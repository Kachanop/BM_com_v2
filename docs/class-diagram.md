# Class Diagram

เอกสารนี้แสดงแบบจำลองคลาส (Class Diagram) ของโดเมนหลักในระบบ ตัวระบบไม่ได้เขียนด้วยภาษาเชิงวัตถุแบบมีคลาสจริงฝั่งเซิร์ฟเวอร์ (หน้าเว็บคุยกับฐานข้อมูล Supabase โดยตรง ดู [tech-stack.md](./tech-stack.md)) แต่แผนภาพนี้สรุป "แนวคิดเชิงวัตถุ" ของข้อมูลและพฤติกรรมในระบบ เพื่อให้เห็นโครงสร้างข้อมูลและความสัมพันธ์ชัดเจนตามหลัก SDLC อ่านคู่กับ [data-schema.md](./data-schema.md) ซึ่งเป็นโครงสร้างฐานข้อมูลจริง

```mermaid
classDiagram
    class Profile {
        +UUID id
        +string email
        +string full_name
        +string phone
        +string role
        +datetime created_at
        +isAdmin() bool
    }

    class Product {
        +bigint id
        +string name
        +string description
        +decimal price
        +string image_url
        +string category
        +datetime created_at
        +matchesSearch(term) bool
        +matchesCategory(category) bool
    }

    class Order {
        +UUID id
        +UUID user_id
        +decimal total_amount
        +string status
        +string slip_url
        +datetime created_at
        +updateStatus(newStatus) void
        +calculateTotal() decimal
    }

    class OrderItem {
        +bigint id
        +UUID order_id
        +bigint product_id
        +int quantity
        +decimal price_at_time
        +getSubtotal() decimal
    }

    class Cart {
        +CartItem[] items
        +addToCart(product) void
        +removeFromCart(productId) void
        +updateQuantity(productId, quantity) void
        +clearCart() void
        +getTotalItems() int
        +getTotalAmount() decimal
        +confirmOrder() Order
    }

    class CartItem {
        +bigint productId
        +string name
        +decimal price
        +int quantity
    }

    Profile "1" --> "0..*" Order : สั่งซื้อ
    Order "1" *-- "1..*" OrderItem : ประกอบด้วย
    Product "1" --> "0..*" OrderItem : ถูกสั่งซื้อใน
    Cart "1" *-- "0..*" CartItem : เก็บสินค้าที่เลือกไว้
    Cart ..> Order : confirmOrder() สร้าง Order + OrderItem จริงลงฐานข้อมูล
    Product ..> CartItem : addToCart() แปลง Product เป็น CartItem
```

## คำอธิบายแต่ละคลาส

| คลาส | หน้าที่ | ตารางฐานข้อมูลที่เกี่ยวข้อง |
| --- | --- | --- |
| Profile | ข้อมูลผู้ใช้และสิทธิ์การใช้งาน (`role` กำหนดว่าเป็นลูกค้าหรือแอดมิน) | `profiles` |
| Product | ข้อมูลสินค้า รองรับการค้นหา (`matchesSearch`) และกรองหมวดหมู่ (`matchesCategory`) ซึ่งทำงานฝั่งหน้าเว็บ ไม่ยิงคำขอใหม่ทุกครั้ง | `products` |
| Order | คำสั่งซื้อของลูกค้าหนึ่งรายการ มีสถานะที่แอดมินเปลี่ยนได้ผ่าน `updateStatus()` | `orders` |
| OrderItem | รายการสินค้าแต่ละชิ้นในคำสั่งซื้อ เก็บราคา ณ เวลาที่สั่งซื้อแยกจากราคาปัจจุบันของ Product | `order_items` |
| Cart | ตะกร้าสินค้าฝั่งหน้าเว็บ (เก็บใน browser ผ่าน `CartContext`) ไม่ใช่ตารางในฐานข้อมูล จนกว่าจะ `confirmOrder()` จึงจะกลายเป็น Order + OrderItem จริง | ไม่มี (runtime state เท่านั้น) |
| CartItem | สินค้าหนึ่งชิ้นที่อยู่ในตะกร้า พร้อมจำนวนที่เลือก | ไม่มี (runtime state เท่านั้น) |

## หมายเหตุการออกแบบ

- **Cart ไม่ใช่ตารางฐานข้อมูล** — เป็นสถานะชั่วคราวฝั่งหน้าเว็บเท่านั้น (เก็บอยู่ตราบใดที่ไม่ได้ล้าง browser storage) เพื่อให้ผู้เยี่ยมชมที่ยังไม่สมัครสมาชิกก็ใส่ตะกร้าได้ ก่อนจะบังคับให้เข้าสู่ระบบตอนยืนยันคำสั่งซื้อจริงเท่านั้น
- `isAdmin()` สอดคล้องกับฟังก์ชัน `is_admin()` ในฐานข้อมูล Supabase ที่ใช้เป็นจุดกลางตรวจสิทธิ์ในทุก RLS policy (ดู [data-schema.md](./data-schema.md))
- ความสัมพันธ์ Order–OrderItem เป็นแบบ composition (เส้นทึบมีข้าวหลามตัด) เพราะ OrderItem มีความหมายก็ต่อเมื่ออยู่ภายใต้ Order เท่านั้น ต่างจาก Product–OrderItem ที่เป็นแค่การอ้างอิง (reference)
