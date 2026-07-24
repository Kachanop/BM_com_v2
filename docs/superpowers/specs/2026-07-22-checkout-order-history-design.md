# สเปกออกแบบ: ระบบยืนยันสั่งซื้อ, ใบเสร็จ, ประวัติคำสั่งซื้อ และจัดการคำสั่งซื้อฝั่งแอดมิน

วันที่: 2026-07-22

> **เอกสารนี้ถูกรวมเข้ากับ [2026-07-22-catalog-search-and-order-system-design.md](./2026-07-22-catalog-search-and-order-system-design.md)** ซึ่งเพิ่มขอบเขตเรื่องค้นหา/หมวดหมู่/หน้ารายละเอียดสินค้าเข้ามาด้วย ใช้เอกสารนั้นเป็นสเปกหลักสำหรับ implementation แทน เอกสารนี้เก็บไว้เพื่ออ้างอิงประวัติเท่านั้น

## เป้าหมาย

ปิดช่องว่างที่ระบุไว้ใน [docs/analysis-and-design.md](../../analysis-and-design.md) (FR-6, FR-8): ตอนนี้ตะกร้าสินค้าไม่มีปุ่มยืนยันสั่งซื้อที่บันทึกลงตาราง `orders`/`order_items` จริง และหน้าประวัติคำสั่งซื้อเป็นข้อความคงที่ที่ยังไม่เชื่อมข้อมูล งานรอบนี้จะทำให้:

1. ลูกค้ากดยืนยันสั่งซื้อจากตะกร้า แล้วระบบบันทึกคำสั่งซื้อจริงลงฐานข้อมูล (สถานะเริ่มต้น `pending`)
2. หลังยืนยัน ระบบแสดงหน้า "ใบเสร็จ/สรุปคำสั่งซื้อ" พร้อม QR พร้อมเพย์แบบตัวอย่าง (ไม่ใช่เกตเวย์จริง)
3. ลูกค้าดูประวัติคำสั่งซื้อของตัวเอง พร้อมสถานะแต่ละรายการ จากข้อมูลจริง
4. แอดมินดูรายการคำสั่งซื้อทั้งหมด และเปลี่ยนสถานะได้ (pending → paid → shipped, หรือ cancelled)
5. อัปเดตเอกสารโปรเจกต์ให้ตรงกับสถานะฟีเจอร์ใหม่

## ขอบเขตที่ตัดออกอย่างชัดเจน (Out of scope)

- ไม่มีการเชื่อมต่อผู้ให้บริการชำระเงินจริง (เช่น EasySlip) และไม่มีการตรวจสลิปอัตโนมัติ — ยังเป็นแผนงานรอบถัดไปตามที่ระบุใน analysis-and-design.md ข้อ 3
- QR พร้อมเพย์ที่แสดงเป็นภาพ/ข้อความตัวอย่างเท่านั้น ไม่ใช่ QR ที่สร้างจากยอดเงินจริงผ่านมาตรฐาน EMVCo
- ไม่สร้างไฟล์ PDF จริง (ใช้หน้าเว็บสรุปคำสั่งซื้อที่พิมพ์ผ่าน browser print ได้แทน)
- ไม่แก้ปัญหาอื่นที่ระบุไว้ใน analysis-and-design.md (เช่น ProfileEditModal, ตาราง profiles_admin, คอลัมน์ password) — อยู่นอกขอบเขตงานรอบนี้

## โครงสร้างฐานข้อมูล (ไม่ต้อง migration ใหม่)

ตาราง `orders` และ `order_items` มีอยู่แล้วพร้อม RLS ตามที่ระบุใน [docs/data-schema.md](../../data-schema.md):

- `orders`: `id`, `user_id`, `total_amount`, `status` (`pending`/`paid`/`shipped`/`cancelled`), `slip_url`, `created_at`
- `order_items`: `id`, `order_id`, `product_id`, `quantity`, `price_at_time`
- RLS ปัจจุบัน: เจ้าของคำสั่งซื้อสร้าง/อ่านคำสั่งซื้อของตัวเองได้, แอดมินอ่านได้ทุกรายการ; `order_items` เพิ่ม/อ่านได้เมื่อ order นั้นเป็นของตัวเองหรือเป็นแอดมิน

ตรวจสอบ policy จริงในโปรเจกต์ Supabase (`BM_com_v2`, project id `ntcxxxstddjraothilqk`) แล้วพบว่าปัจจุบันมีแค่ policy `INSERT`/`SELECT` บน `orders` และ `order_items` เท่านั้น **ไม่มี policy `UPDATE` บนตาราง `orders` เลย** ดังนั้นแอดมินจะเปลี่ยนสถานะคำสั่งซื้อไม่ได้จนกว่าจะเพิ่ม migration ใหม่:

```sql
create policy "orders_update_admin"
  on orders for update
  to authenticated
  using (is_admin())
  with check (is_admin());
```

ต้อง apply migration นี้ก่อนเริ่มเขียนโค้ดส่วนแอดมินเปลี่ยนสถานะ (ขั้นตอน implementation ต้องใช้ `apply_migration` ผ่าน Supabase MCP หรือ Supabase CLI ไม่ใช่แก้ผ่านหน้าเว็บ Dashboard ตรง ๆ เพื่อให้มีประวัติ migration ในโปรเจกต์)

## Data flow

```
ลูกค้า (Cart.jsx)
  → กด "ยืนยันคำสั่งซื้อ"
  → ตรวจสอบ session (ถ้าไม่ได้ล็อกอิน แสดงข้อความให้เข้าสู่ระบบ ไม่ทำต่อ)
  → insert orders (user_id, total_amount, status='pending') → ได้ order.id
  → insert order_items (order_id, product_id, quantity, price_at_time) ทีละรายการจาก cartItems
  → clearCart()
  → navigate('/order/:id')

OrderDetail.jsx (/order/:id)
  → select orders by id (+ order_items join products) — RLS จำกัดให้เห็นเฉพาะของตัวเองหรือแอดมิน
  → แสดงเลขคำสั่งซื้อ วันที่ รายการสินค้า ยอดรวม สถานะ และ QR ตัวอย่าง

History.jsx (/history)
  → ตรวจสอบ session (ถ้าไม่ได้ล็อกอิน แสดงข้อความให้เข้าสู่ระบบ)
  → select orders where user_id = ตัวเอง, order by created_at desc (+ นับจำนวนชิ้นต่อออเดอร์)
  → แต่ละแถวคลิกไปที่ /order/:id

Admin.jsx (ส่วนใหม่: จัดการคำสั่งซื้อ)
  → select orders ทั้งหมด (+ ชื่อ/อีเมลผู้ซื้อจาก profiles) order by created_at desc
  → เปลี่ยนสถานะ: update orders set status=... where id=...
```

## รายละเอียดแต่ละส่วน

### 1. Cart.jsx — ปุ่มยืนยันคำสั่งซื้อ

- เพิ่มปุ่ม "ยืนยันคำสั่งซื้อ" ข้าง ๆ ปุ่ม "ล้างตะกร้า" เดิม แสดงเฉพาะเมื่อ `cartItems.length > 0`
- ต้องตรวจสอบ session ก่อน (ใช้ `supabase.auth.getSession()`) — ถ้าไม่มี session แสดงข้อความ "กรุณาเข้าสู่ระบบก่อนสั่งซื้อ" แทนที่จะเปิด modal ใหม่ (ปุ่มเข้าสู่ระบบมีอยู่แล้วที่ header) เพื่อไม่ต้องแก้โครงสร้าง modal state ที่อยู่ใน `MainLayout.jsx`
- ระหว่างบันทึก แสดงสถานะ loading และปิดปุ่มไม่ให้กดซ้ำ (ป้องกันสร้างออเดอร์ซ้ำจากการกดปุ่มรัว ๆ)
- ลำดับการเขียนข้อมูล: insert `orders` → ได้ id → insert `order_items` เป็น array เดียว (ไม่ loop เรียก insert ทีละแถว) → ถ้า insert order_items ล้มเหลว ให้แจ้ง error กับผู้ใช้ (ไม่ rollback order อัตโนมัติ เพราะเป็น client-side ธรรมดา ไม่มี transaction; ระบุ known limitation นี้ไว้ในเอกสาร)
- state `showQr` ที่มีอยู่เดิมใน Cart.jsx (ประกาศไว้แต่ไม่ได้ใช้งาน) ให้ลบออก เพราะ flow ใหม่นำทางไปหน้า OrderDetail แทนการแสดง QR ในหน้าเดิม

### 2. OrderDetail.jsx (ใหม่) — เส้นทาง `/order/:id`

- ใช้ `useParams()` ดึง order id จาก URL
- โหลดข้อมูล order พร้อม order_items และชื่อสินค้า (join ผ่าน `select` ของ supabase: `order_items(*, products(name, image_url))`)
- ถ้าไม่พบ order หรือไม่มีสิทธิ์เข้าถึง (RLS จะคืนค่าว่าง ไม่ error) ให้แสดงข้อความ "ไม่พบคำสั่งซื้อนี้"
- แสดง: เลขที่คำสั่งซื้อ (id), วันที่สั่งซื้อ, ตารางรายการสินค้า (ชื่อ, จำนวน, ราคาต่อชิ้นที่ price_at_time, ราคารวม), ยอดรวมทั้งหมด, badge สถานะ (สี/ข้อความตาม pending/paid/shipped/cancelled)
- แสดงกล่อง "ชำระเงินผ่าน PromptPay" เป็นภาพ/placeholder พร้อมข้อความอธิบายว่าเป็นตัวอย่าง และให้รอแอดมินตรวจสอบยอดโอนแล้วเปลี่ยนสถานะให้ — แสดงเฉพาะเมื่อสถานะเป็น `pending`
- มีปุ่ม "พิมพ์ใบเสร็จ" ที่เรียก `window.print()` (ใช้ print stylesheet พื้นฐานของ browser ไม่ต้องเขียน CSS พิเศษเพิ่ม)

### 3. History.jsx — ดึงข้อมูลจริง

- ตรวจสอบ session แบบเดียวกับ `Admin.jsx` (pattern `checkAdmin` แต่ไม่ต้องเช็ค role) — ถ้าไม่มี session แสดงข้อความให้เข้าสู่ระบบ (reuse layout เดียวกับ Admin's "สงวนสิทธิ์" card)
- query: `orders` ของ `user_id = session.user.id`, เรียงจากใหม่ไปเก่า, พร้อมนับจำนวน order_items ต่อออเดอร์ (`order_items(count)`)
- แสดงเป็นรายการ/การ์ด: วันที่, จำนวนชิ้นรวม, ยอดรวม, badge สถานะ, ลิงก์ไปหน้า `/order/:id`
- ถ้าไม่มีคำสั่งซื้อเลย แสดงข้อความเดิม "ยังไม่มีประวัติคำสั่งซื้อ"

### 4. Admin.jsx — ส่วนจัดการคำสั่งซื้อ

- เพิ่ม section ใหม่ต่อจาก "จัดการข้อมูลสินค้า" ชื่อ "จัดการคำสั่งซื้อ"
- โหลดรายการ orders ทั้งหมดพร้อมข้อมูลผู้ซื้อ (`profiles(full_name, email)`) เรียงใหม่ไปเก่า
- ตารางแสดง: วันที่, ชื่อ/อีเมลผู้ซื้อ, ยอดรวม, สถานะปัจจุบัน (badge), dropdown หรือปุ่มเปลี่ยนสถานะเป็น pending/paid/shipped/cancelled
- เปลี่ยนสถานะ: `supabase.from('orders').update({status}).eq('id', orderId)` แล้ว reload รายการ / อัปเดต state ทันที
- ปุ่มลิงก์ไปดูรายละเอียดออเดอร์ (`/order/:id`) เผื่อแอดมินอยากเห็นรายการสินค้าในออเดอร์นั้น

### 5. Route ใหม่ใน App.jsx

เพิ่ม `<Route path="order/:id" element={<OrderDetail />} />` ภายใต้ `MainLayout`

## Error handling

- Insert order/order_items ล้มเหลว: แสดง alert แจ้งผู้ใช้ ไม่ clear ตะกร้า (ให้ลองกดใหม่ได้)
- โหลด order ไม่เจอ/ไม่มีสิทธิ์: แสดงข้อความแทน error technical
- เปลี่ยนสถานะฝั่งแอดมินล้มเหลว: แสดง alert เหมือน pattern เดิมใน Admin.jsx (`alert('...ไม่สำเร็จ')`)

## การทดสอบ

- ทดสอบด้วยมือ (manual) ตาม pattern เดิมของโปรเจกต์นี้ (ดู [docs/test-report.md](../../test-report.md) และ [docs/uat.md](../../uat.md)):
  1. ลูกค้าเพิ่มสินค้าลงตะกร้า กดยืนยันคำสั่งซื้อโดยไม่ล็อกอิน → ต้องเห็นข้อความให้เข้าสู่ระบบ ไม่มี order ถูกสร้าง
  2. ล็อกอินแล้วยืนยันคำสั่งซื้อ → มี order ใหม่สถานะ pending, ตะกร้าว่างลง, ไปหน้าใบเสร็จถูกต้อง
  3. เข้าหน้าประวัติคำสั่งซื้อ → เห็นออเดอร์ที่เพิ่งสร้าง สถานะ pending
  4. แอดมินเข้าหน้าจัดการคำสั่งซื้อ เปลี่ยนสถานะเป็น paid → ลูกค้า refresh หน้าประวัติ/ใบเสร็จเห็นสถานะเปลี่ยนตาม
  5. ผู้ใช้ B พยายามเปิด `/order/:id` ของผู้ใช้ A ทาง URL ตรง → ต้องไม่เห็นข้อมูล (RLS บล็อก)

## เอกสารที่ต้องอัปเดตหลัง implementation

- `docs/analysis-and-design.md`: อัปเดตสถานะ FR-6, FR-8 เป็น "ใช้งานได้แล้ว (แบบยืนยันด้วยมือ ยังไม่มีเกตเวย์จริง)" และย้ายข้อ 2 ออกจาก "แผนงานที่แนะนำ" ไปเป็นงานที่ทำแล้ว
- `docs/api.md`: เพิ่มตาราง endpoint สำหรับ `POST /rest/v1/orders`, `POST /rest/v1/order_items`, `GET /rest/v1/orders` (ของตัวเอง/แอดมินดูทั้งหมด), `PATCH /rest/v1/orders` (แอดมินเปลี่ยนสถานะ)
- `docs/how-it-works.md`: อธิบาย flow การสั่งซื้อใหม่แบบภาษาคน
- `README.md`: ย้ายฟีเจอร์ "ยืนยันคำสั่งซื้อ" และ "ดูประวัติ/สถานะ" จากส่วน "อยู่ระหว่างวางแผน" มาเป็น "ใช้งานได้จริงตอนนี้" (คงข้อความเรื่อง QR พร้อมเพย์จริง/ตรวจสลิปอัตโนมัติไว้ในส่วนที่ยังไม่ได้พัฒนา)

## ไฟล์ที่คาดว่าจะแก้ไข/เพิ่ม

- แก้ไข: `frontend/src/pages/Cart.jsx`, `frontend/src/pages/History.jsx`, `frontend/src/pages/Admin.jsx`, `frontend/src/App.jsx`
- เพิ่มใหม่: `frontend/src/pages/OrderDetail.jsx`
- แก้ไขเอกสาร: `docs/analysis-and-design.md`, `docs/api.md`, `docs/how-it-works.md`, `README.md`
