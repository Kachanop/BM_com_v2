# ระบบค้นหา/หมวดหมู่สินค้า, หน้ารายละเอียดสินค้า และระบบสั่งซื้อ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เติมฟีเจอร์ที่ขาดในสเปก [2026-07-22-catalog-search-and-order-system-design.md](../specs/2026-07-22-catalog-search-and-order-system-design.md): ค้นหา/กรองหมวดหมู่สินค้า, หน้ารายละเอียดสินค้า, ยืนยันคำสั่งซื้อจริงลงฐานข้อมูล, ใบเสร็จพร้อม QR ตัวอย่าง, ประวัติคำสั่งซื้อจากข้อมูลจริง และหน้าแอดมินจัดการคำสั่งซื้อ

**Architecture:** React 19 + Vite SPA คุยกับ Supabase (PostgreSQL) โดยตรงจากเบราว์เซอร์ผ่าน `@supabase/supabase-js` ไม่มีเซิร์ฟเวอร์กลาง ควบคุมสิทธิ์ด้วย Row Level Security (RLS) ฝั่งฐานข้อมูล ทุกหน้าใหม่เป็น React component ในโฟลเดอร์ `frontend/src/pages` เชื่อมด้วย React Router

**Tech Stack:** React 19, React Router 7, Tailwind CSS 4, @supabase/supabase-js 2, lucide-react, Supabase Postgres (project id `ntcxxxstddjraothilqk`)

## Global Constraints

- หมวดหมู่สินค้าจำกัดเป็น 4 ค่าคงที่เท่านั้น: `gaming`, `office`, `general`, `creator` (ห้ามใช้ค่าอื่น — มี CHECK constraint ในฐานข้อมูลบังคับ)
- โปรเจกต์นี้ไม่มี automated test framework (ไม่มี Vitest/Jest ติดตั้งอยู่) — การตรวจสอบทุก task ให้ใช้ `npm run build` (ต้องคอมไพล์ผ่าน), `npm run lint` (ต้องไม่มี error ใหม่) และการทดสอบด้วยมือผ่านเบราว์เซอร์ตาม pattern เดิมของโปรเจกต์ (ดู `docs/test-report.md`, `docs/uat.md`) — ห้ามข้ามการทดสอบด้วยมือ แม้ build/lint จะผ่าน
- Migration ฐานข้อมูลทุกตัวต้อง apply ผ่าน Supabase MCP tool `mcp__plugin_supabase_supabase__apply_migration` เท่านั้น (project_id `ntcxxxstddjraothilqk`) ห้ามแก้ผ่านหน้าเว็บ Supabase Dashboard ตรง ๆ เพื่อให้มีประวัติ migration
- Insert `order_items` ต้องส่งเป็น array เดียวในคำสั่ง insert เดียว ห้าม loop insert ทีละแถว
- ข้อความในหน้าเว็บทั้งหมดเป็นภาษาไทย ให้เขียนสไตล์เดียวกับข้อความที่มีอยู่แล้วในแต่ละไฟล์ (โทนสุภาพ กระชับ)
- ห้ามแก้ไขไฟล์หรือฟีเจอร์ที่ระบุว่า "out of scope" ในสเปก (ProfileEditModal, ตาราง profiles_admin, คอลัมน์ password)

---

## Task 1: Database migrations — คอลัมน์ category และ policy อนุญาตแอดมินเปลี่ยนสถานะออเดอร์

**Files:**
- ไม่มีไฟล์ในโค้ด — ใช้ Supabase MCP tool เรียก apply_migration โดยตรงกับโปรเจกต์ `ntcxxxstddjraothilqk`

**Interfaces:**
<<<<<<< HEAD
- Produces: คอลัมน์ `products.category` (text, NOT NULL, default `'general'`, CHECK ใน `('gaming','office','general','creator')`), policy `orders_update_admin` (UPDATE บนตาราง `orders` โดยใช้ `is_admin()`), และ FK `orders.user_id -> profiles.id` — Task ถัดไปทุก task ที่แตะ category, เปลี่ยนสถานะออเดอร์, หรือ join `profiles` จากตาราง `orders` (Task 10) ต้องมีสามสิ่งนี้อยู่ก่อน

- [ ] **Step 0: ตรวจสอบและเพิ่ม FK สำหรับ join orders -> profiles (จำเป็นสำหรับ Task 10)**

`orders.user_id` มี FK ชี้ไปที่ `auth.users.id` อยู่แล้ว แต่ **ไม่มี** FK ชี้ไปที่ `public.profiles.id` โดยตรง ซึ่ง PostgREST ต้องการ FK ตรงระหว่างสองตารางถึงจะ embed แบบ `orders(...).select('*, profiles(full_name, email)')` ได้ (ใช้ใน Task 10) ตรวจสอบก่อนว่ามีอยู่แล้วหรือยัง:

```sql
select conname from pg_constraint where conname = 'orders_user_id_profiles_fkey';
```

ถ้าไม่มีแถวคืนมา ให้ apply migration นี้ผ่าน `mcp__plugin_supabase_supabase__apply_migration` (`project_id`: `ntcxxxstddjraothilqk`, `name`: `add_orders_user_id_profiles_fkey`):

```sql
alter table orders
  add constraint orders_user_id_profiles_fkey
  foreign key (user_id) references profiles(id);
```

ปลอดภัยที่จะเพิ่มแม้มีข้อมูลอยู่แล้ว เพราะ `orders.user_id` ทุกแถวถูกสร้างผ่าน RLS policy `orders_insert_own` ที่บังคับ `user_id = auth.uid()` อยู่แล้ว จึงไม่มีทางมีค่าที่ไม่ตรงกับ `profiles.id` ใดๆ
=======
- Produces: คอลัมน์ `products.category` (text, NOT NULL, default `'general'`, CHECK ใน `('gaming','office','general','creator')`) และ policy `orders_update_admin` (UPDATE บนตาราง `orders` โดยใช้ `is_admin()`) — Task ถัดไปทุก task ที่แตะ category หรือเปลี่ยนสถานะออเดอร์ต้องมีสองสิ่งนี้อยู่ก่อน
>>>>>>> worktree-catalog-search-and-order-system

- [ ] **Step 1: Apply migration เพิ่มคอลัมน์ category**

เรียก tool `mcp__plugin_supabase_supabase__apply_migration` ด้วยพารามิเตอร์:
- `project_id`: `ntcxxxstddjraothilqk`
- `name`: `add_products_category`
- `query`:

```sql
alter table products
  add column category text not null default 'general'
  check (category in ('gaming', 'office', 'general', 'creator'));
```

- [ ] **Step 2: Apply migration เพิ่ม policy UPDATE บน orders**

เรียก tool `mcp__plugin_supabase_supabase__apply_migration` ด้วยพารามิเตอร์:
- `project_id`: `ntcxxxstddjraothilqk`
- `name`: `add_orders_update_admin_policy`
- `query`:

```sql
create policy "orders_update_admin"
  on orders for update
  to authenticated
  using (is_admin())
  with check (is_admin());
```

- [ ] **Step 3: ตรวจสอบว่า migration สำเร็จ**

เรียก tool `mcp__plugin_supabase_supabase__execute_sql` ด้วย `project_id`: `ntcxxxstddjraothilqk` และ query:

```sql
select column_name, data_type, column_default
from information_schema.columns
where table_name = 'products' and column_name = 'category';
```

Expected: คืนแถวเดียว `category | text | 'general'::text`

จากนั้นรัน query ตรวจ policy:

```sql
select policyname, cmd from pg_policies where tablename = 'orders';
```

Expected: มีแถว `orders_update_admin | UPDATE` อยู่ในผลลัพธ์ (นอกเหนือจาก policy INSERT/SELECT เดิม)

<<<<<<< HEAD
ตรวจ FK อีกครั้งให้ชัวร์:

```sql
select conname from pg_constraint where conname = 'orders_user_id_profiles_fkey';
```

Expected: คืนหนึ่งแถว

=======
>>>>>>> worktree-catalog-search-and-order-system
- [ ] **Step 4: Commit**

ไม่มีไฟล์โค้ดให้ commit ใน task นี้ (migration อยู่ในฐานข้อมูล ไม่ใช่ไฟล์ในโปรเจกต์) ข้ามไป task ถัดไปได้เลย

---

## Task 2: ค่าคงที่หมวดหมู่สินค้าที่ใช้ร่วมกัน

**Files:**
- Create: `frontend/src/lib/categories.js`

**Interfaces:**
- Consumes: ไม่มี (ไม่พึ่งพา task อื่น นอกจาก Task 1 ที่ทำให้ค่าตรงกับ DB constraint)
- Produces: `CATEGORIES` (array ของ `{ value, label }`) และ `getCategoryLabel(value)` — Task 4, 5, 6, 10 import จากไฟล์นี้

- [ ] **Step 1: สร้างไฟล์ค่าคงที่**

สร้าง `frontend/src/lib/categories.js`:

```js
export const CATEGORIES = [
  { value: 'gaming', label: 'เกมมิ่ง' },
  { value: 'office', label: 'ทำงานออฟฟิศ' },
  { value: 'general', label: 'เรียน-ทำงานทั่วไป' },
  { value: 'creator', label: 'สตรีมมิ่ง/สร้างคอนเทนต์' },
];

export function getCategoryLabel(value) {
  return CATEGORIES.find((category) => category.value === value)?.label || value;
}
```

- [ ] **Step 2: ตรวจสอบว่าคอมไพล์ผ่าน**

Run: `cd frontend && npm run build`
Expected: build สำเร็จ ไม่มี error (ไฟล์นี้ยังไม่ถูก import ที่ไหน แต่ต้องไม่มี syntax error)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/categories.js
git commit -m "feat: add shared product category constants"
```

---

## Task 3: useProducts hook รองรับ category

**Files:**
- Modify: `frontend/src/hooks/useProducts.js`

**Interfaces:**
- Consumes: Task 1 (คอลัมน์ `category` ต้องมีอยู่ในตาราง `products`)
- Produces: `addProduct({ name, price, description, image_url, category })` — Task 4 (Admin.jsx) เรียกใช้ด้วย signature นี้

- [ ] **Step 1: แก้ addProduct ให้รับและส่ง category**

ใน `frontend/src/hooks/useProducts.js` แก้บรรทัด 27-30 จาก:

```js
  const addProduct = useCallback(async ({ name, price, description, image_url }) => {
    const { error } = await supabase
      .from("products")
      .insert({ name, price, description, image_url });
```

เป็น:

```js
  const addProduct = useCallback(async ({ name, price, description, image_url, category }) => {
    const { error } = await supabase
      .from("products")
      .insert({ name, price, description, image_url, category });
```

- [ ] **Step 2: ตรวจสอบว่าคอมไพล์ผ่าน**

Run: `cd frontend && npm run build`
Expected: build สำเร็จ ไม่มี error

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useProducts.js
git commit -m "feat: pass category through useProducts addProduct"
```

---

## Task 4: Admin.jsx — เลือกหมวดหมู่ตอนเพิ่ม/แก้ไขสินค้า

**Files:**
- Modify: `frontend/src/pages/Admin.jsx`

**Interfaces:**
- Consumes: `CATEGORIES` จาก `frontend/src/lib/categories.js` (Task 2), `addProduct({..., category})` จาก `useProducts` (Task 3)
- Produces: ไม่มี interface ใหม่ให้ task อื่นใช้ต่อ (เป็นหน้าจอปลายทาง)

- [ ] **Step 1: เพิ่ม import และ state**

ใน `frontend/src/pages/Admin.jsx` แก้บรรทัด 1-4 จาก:

```js
import { useState, useEffect } from 'react';
import { BarChart3, Users, Package, ShoppingBag, Lock, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProducts } from '../hooks/useProducts';
```

เป็น:

```js
import { useState, useEffect } from 'react';
import { BarChart3, Users, Package, ShoppingBag, Lock, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProducts } from '../hooks/useProducts';
import { CATEGORIES } from '../lib/categories';
```

แก้บรรทัด 24 (หลัง `imageUrlInput`) เพิ่ม state ใหม่ จาก:

```js
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
```

เป็น:

```js
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('general');
  const [saveMessage, setSaveMessage] = useState('');
```

- [ ] **Step 2: ตั้งค่า categoryInput เมื่อเลือก/สร้างสินค้า**

แก้ useEffect บรรทัด 39-48 จาก:

```js
  useEffect(() => {
    if (products.length > 0 && !selectedProductId && !isCreating) {
      const firstProduct = products[0];
      setSelectedProductId(firstProduct.id);
      setNameInput(firstProduct.name || '');
      setPriceInput(firstProduct.price?.toString() || '');
      setDescriptionInput(firstProduct.description || '');
      setImageUrlInput(firstProduct.image_url || '');
    }
  }, [products, selectedProductId, isCreating]);
```

เป็น:

```js
  useEffect(() => {
    if (products.length > 0 && !selectedProductId && !isCreating) {
      const firstProduct = products[0];
      setSelectedProductId(firstProduct.id);
      setNameInput(firstProduct.name || '');
      setPriceInput(firstProduct.price?.toString() || '');
      setDescriptionInput(firstProduct.description || '');
      setImageUrlInput(firstProduct.image_url || '');
      setCategoryInput(firstProduct.category || 'general');
    }
  }, [products, selectedProductId, isCreating]);
```

แก้ `handleSelectProduct` บรรทัด 80-88 จาก:

```js
  const handleSelectProduct = (product) => {
    setIsCreating(false);
    setSelectedProductId(product.id);
    setNameInput(product.name || '');
    setPriceInput(product.price?.toString() || '');
    setDescriptionInput(product.description || '');
    setImageUrlInput(product.image_url || '');
    setSaveMessage('');
  };
```

เป็น:

```js
  const handleSelectProduct = (product) => {
    setIsCreating(false);
    setSelectedProductId(product.id);
    setNameInput(product.name || '');
    setPriceInput(product.price?.toString() || '');
    setDescriptionInput(product.description || '');
    setImageUrlInput(product.image_url || '');
    setCategoryInput(product.category || 'general');
    setSaveMessage('');
  };
```

แก้ `handleStartCreate` บรรทัด 90-98 จาก:

```js
  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedProductId(null);
    setNameInput('');
    setPriceInput('');
    setDescriptionInput('');
    setImageUrlInput('');
    setSaveMessage('');
  };
```

เป็น:

```js
  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedProductId(null);
    setNameInput('');
    setPriceInput('');
    setDescriptionInput('');
    setImageUrlInput('');
    setCategoryInput('general');
    setSaveMessage('');
  };
```

- [ ] **Step 3: ส่ง category ตอนบันทึกสินค้า**

แก้ `handleSaveProduct` บรรทัด 106-118 จาก:

```js
    if (isCreating) {
      const { error } = await addProduct({
        name: nameInput,
        price: Number(priceInput),
        description: descriptionInput,
        image_url: imageUrlInput,
      });
```

เป็น:

```js
    if (isCreating) {
      const { error } = await addProduct({
        name: nameInput,
        price: Number(priceInput),
        description: descriptionInput,
        image_url: imageUrlInput,
        category: categoryInput,
      });
```

แก้บรรทัด 125-133 จาก:

```js
    const { error } = await supabase
      .from("products")
      .update({
        name: nameInput,
        price: Number(priceInput),
        description: descriptionInput,
        image_url: imageUrlInput,
      })
      .eq("id", selectedProductId);
```

เป็น:

```js
    const { error } = await supabase
      .from("products")
      .update({
        name: nameInput,
        price: Number(priceInput),
        description: descriptionInput,
        image_url: imageUrlInput,
        category: categoryInput,
      })
      .eq("id", selectedProductId);
```

- [ ] **Step 4: เพิ่ม dropdown หมวดหมู่ในฟอร์ม**

แก้ส่วนฟอร์มบรรทัด 329-340 (label "ราคา") หา label ถัดไปคือ "รายละเอียดสินค้า" — แทรก dropdown หมวดหมู่ระหว่างสองอันนี้ จาก:

```jsx
                  <label className="block text-sm font-medium text-gray-700">
                    ราคา
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={priceInput}
                      onChange={(event) => setPriceInput(event.target.value)}
                      placeholder="ราคา"
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    รายละเอียดสินค้า
```

เป็น:

```jsx
                  <label className="block text-sm font-medium text-gray-700">
                    ราคา
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={priceInput}
                      onChange={(event) => setPriceInput(event.target.value)}
                      placeholder="ราคา"
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    หมวดหมู่สินค้า
                    <select
                      value={categoryInput}
                      onChange={(event) => setCategoryInput(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    รายละเอียดสินค้า
```

- [ ] **Step 5: ตรวจสอบว่าคอมไพล์และ lint ผ่าน**

Run: `cd frontend && npm run build && npm run lint`
Expected: ทั้งสองคำสั่งผ่านโดยไม่มี error

- [ ] **Step 6: ทดสอบด้วยมือ**

Run: `cd frontend && npm run dev` (ถ้ายังไม่ได้รันอยู่) เปิดเบราว์เซอร์ที่ URL ที่ Vite แสดง (ปกติ `http://localhost:5173`)

1. เข้าสู่ระบบด้วยบัญชีแอดมิน ไปหน้า `/admin`
2. กด "เพิ่มสินค้าใหม่" กรอกชื่อ+ราคา เลือกหมวดหมู่ "เกมมิ่ง" กดบันทึก → ต้องเห็นข้อความ "เพิ่มสินค้าใหม่เรียบร้อย"
3. เลือกสินค้าเดิมจากรายการซ้าย → dropdown หมวดหมู่ต้องแสดงค่าที่ตรงกับที่บันทึกไว้ (หรือ "เรียน-ทำงานทั่วไป" สำหรับสินค้าเก่าที่ไม่เคยตั้งหมวดหมู่)
4. เปลี่ยนหมวดหมู่ของสินค้าเดิมแล้วกด "บันทึกข้อมูลสินค้า" → ต้องเห็นข้อความ "อัปเดตข้อมูลสินค้าเรียบร้อย"

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/Admin.jsx
git commit -m "feat: add category selector to admin product form"
```

---

## Task 5: Home.jsx — ค้นหาและกรองหมวดหมู่สินค้า

**Files:**
- Modify: `frontend/src/pages/Home.jsx`

**Interfaces:**
- Consumes: `CATEGORIES` จาก `frontend/src/lib/categories.js` (Task 2), route `/product/:id` (จะถูกสร้างใน Task 6 — ลิงก์ชี้ไปก่อนได้ แม้หน้ายังไม่มี เพราะ React Router จะ match ตอน Task 6 เพิ่ม route)
- Produces: ไม่มี interface ใหม่ให้ task อื่นใช้ต่อ

- [ ] **Step 1: เพิ่ม import ที่ต้องใช้**

แก้บรรทัด 1-5 จาก:

```jsx
import { Link } from 'react-router-dom';
import { ShoppingCart, Sparkles, ShieldCheck, Headphones } from 'lucide-react';
import { useContext } from 'react';
import { CartContext } from '../lib/CartContext';
import { useProducts } from '../hooks/useProducts';
```

เป็น:

```jsx
import { Link } from 'react-router-dom';
import { ShoppingCart, Sparkles, ShieldCheck, Headphones } from 'lucide-react';
import { useContext, useMemo, useState } from 'react';
import { CartContext } from '../lib/CartContext';
import { useProducts } from '../hooks/useProducts';
import { CATEGORIES } from '../lib/categories';
```

- [ ] **Step 2: เพิ่ม state ค้นหา/กรอง และ filteredProducts**

แก้บรรทัด 7-9 จาก:

```jsx
export default function Home() {
  const { products, loading } = useProducts();
  const { addToCart } = useContext(CartContext);
```

เป็น:

```jsx
export default function Home() {
  const { products, loading } = useProducts();
  const { addToCart } = useContext(CartContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesTerm =
        !term ||
        product.name?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term);
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesTerm && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);
```

- [ ] **Step 3: เพิ่มแถบค้นหา+กรองหมวดหมู่ และแก้ grid ให้ใช้ filteredProducts**

แก้ส่วนบรรทัด 92-130 (section "สินค้าแนะนำ") จาก:

```jsx
      <section>
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">สินค้าแนะนำ</p>
            <h2 className="text-2xl font-bold text-gray-900">เซ็ตคอมพิวเตอร์ยอดนิยม</h2>
          </div>
          <Link to="/cart" className="text-sm font-semibold text-blue-600 hover:text-blue-700">ดูทั้งหมด</Link>
        </div>
        {loading ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 py-16 text-center text-gray-500">กำลังโหลดข้อมูลสินค้า...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group flex flex-col overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
                <img src={product.image_url} alt={product.name} className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-gray-500">
                    {product.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      ฿{product.price.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      หยิบใส่ตะกร้า
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
```

เป็น:

```jsx
      <section>
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">สินค้าแนะนำ</p>
            <h2 className="text-2xl font-bold text-gray-900">เซ็ตคอมพิวเตอร์ยอดนิยม</h2>
          </div>
          <Link to="/cart" className="text-sm font-semibold text-blue-600 hover:text-blue-700">ดูทั้งหมด</Link>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="w-full rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm outline-none transition focus:border-blue-500 sm:max-w-xs"
          />
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="w-full rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm outline-none transition focus:border-blue-500 sm:w-56"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 py-16 text-center text-gray-500">กำลังโหลดข้อมูลสินค้า...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 py-16 text-center text-gray-500">ไม่พบสินค้าที่ค้นหา</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group flex flex-col overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
                <Link to={`/product/${product.id}`} className="block">
                  <img src={product.image_url} alt={product.name} className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <Link to={`/product/${product.id}`} className="hover:text-blue-600">
                    <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  </Link>
                  <p className="mt-2 flex-1 text-sm text-gray-500">
                    {product.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      ฿{product.price.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      หยิบใส่ตะกร้า
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
```

- [ ] **Step 4: ตรวจสอบว่าคอมไพล์และ lint ผ่าน**

Run: `cd frontend && npm run build && npm run lint`
Expected: ทั้งสองคำสั่งผ่านโดยไม่มี error

- [ ] **Step 5: ทดสอบด้วยมือ**

Run: `cd frontend && npm run dev` (ถ้ายังไม่ได้รันอยู่) เปิดหน้าแรก

1. พิมพ์คำค้นหาที่ตรงกับชื่อสินค้าบางส่วน → เห็นเฉพาะสินค้าที่ตรง
2. พิมพ์คำที่ไม่มีอยู่จริง (เช่น "xyz123") → เห็นข้อความ "ไม่พบสินค้าที่ค้นหา"
3. ล้างคำค้นหา แล้วเลือกหมวดหมู่จาก dropdown → เห็นเฉพาะสินค้าหมวดนั้น
4. เลือก "ทุกหมวดหมู่" อีกครั้ง → เห็นสินค้าทั้งหมด
5. คลิกรูปหรือชื่อสินค้า → เบราว์เซอร์พยายามไปที่ `/product/:id` (จะยังเป็นหน้า 404 จนกว่า Task 6 จะเพิ่ม route — เป็นพฤติกรรมที่คาดไว้ในขั้นนี้)
6. กดปุ่ม "หยิบใส่ตะกร้า" บนการ์ดสินค้า → ต้องเพิ่มลงตะกร้าได้ตามปกติ ไม่นำทางไปหน้าอื่น

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Home.jsx
git commit -m "feat: add product search and category filter to home page"
```

---

## Task 6: หน้ารายละเอียดสินค้า (ProductDetail.jsx)

**Files:**
- Create: `frontend/src/pages/ProductDetail.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: `getCategoryLabel` จาก `frontend/src/lib/categories.js` (Task 2), `CartContext.addToCart` จาก `frontend/src/lib/CartContext.jsx`
- Produces: route `/product/:id` — ทำให้ลิงก์ที่เพิ่มใน Task 5 ใช้งานได้จริง

- [ ] **Step 1: สร้างหน้า ProductDetail**

สร้าง `frontend/src/pages/ProductDetail.jsx`:

```jsx
import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CartContext } from '../lib/CartContext';
import { getCategoryLabel } from '../lib/categories';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (isMounted) {
          setProduct(data ?? null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">กำลังโหลดข้อมูลสินค้า...</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-lg font-semibold text-gray-900">ไม่พบสินค้านี้</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าแรก
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4" />
        กลับหน้าแรก
      </Link>
      <div className="grid gap-8 rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-2">
        <img src={product.image_url} alt={product.name} className="h-80 w-full rounded-2xl object-cover" />
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            {getCategoryLabel(product.category)}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-4 flex-1 text-gray-600">{product.description}</p>
          <p className="mt-6 text-3xl font-bold text-blue-600">฿{Number(product.price).toLocaleString()}</p>
          <button
            type="button"
            onClick={() => addToCart(product)}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <ShoppingCart className="w-4 h-4" />
            หยิบใส่ตะกร้า
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: เพิ่ม route ใน App.jsx**

แก้ `frontend/src/App.jsx` จาก:

```jsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Cart from './pages/Cart';
import History from './pages/History';
import Admin from './pages/Admin';
import { CartProvider } from './lib/CartContext';

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="cart" element={<Cart />} />
          <Route path="history" element={<History />} />
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<div className="text-center py-20 text-2xl font-bold">404 - ไม่พบหน้าเว็บที่คุณค้นหา</div>} />
        </Route>
      </Routes>
    </CartProvider>
  );
}

export default App;
```

เป็น:

```jsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Cart from './pages/Cart';
import History from './pages/History';
import Admin from './pages/Admin';
import ProductDetail from './pages/ProductDetail';
import { CartProvider } from './lib/CartContext';

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="history" element={<History />} />
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<div className="text-center py-20 text-2xl font-bold">404 - ไม่พบหน้าเว็บที่คุณค้นหา</div>} />
        </Route>
      </Routes>
    </CartProvider>
  );
}

export default App;
```

- [ ] **Step 3: ตรวจสอบว่าคอมไพล์และ lint ผ่าน**

Run: `cd frontend && npm run build && npm run lint`
Expected: ทั้งสองคำสั่งผ่านโดยไม่มี error

- [ ] **Step 4: ทดสอบด้วยมือ**

Run: `cd frontend && npm run dev` (ถ้ายังไม่ได้รันอยู่)

1. จากหน้าแรก คลิกการ์ดสินค้าใดก็ได้ → ไปหน้า `/product/:id` เห็นรูปใหญ่ ชื่อ หมวดหมู่ คำอธิบายเต็ม ราคา และปุ่มหยิบใส่ตะกร้าครบ
2. กดปุ่ม "หยิบใส่ตะกร้า" จากหน้านี้ → ไอคอนตะกร้าที่ header ต้องมีตัวเลขเพิ่มขึ้น
3. เปิด URL `/product/999999` (id ที่ไม่มีจริง) ตรง ๆ → เห็นข้อความ "ไม่พบสินค้านี้" พร้อมลิงก์กลับหน้าแรก
4. กด "กลับหน้าแรก" → กลับมาหน้า Home ปกติ

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ProductDetail.jsx frontend/src/App.jsx
git commit -m "feat: add product detail page at /product/:id"
```

---

## Task 7: Cart.jsx — ยืนยันคำสั่งซื้อบันทึกลงฐานข้อมูล

**Files:**
- Modify: `frontend/src/pages/Cart.jsx` (เขียนทั้งไฟล์ใหม่)

**Interfaces:**
- Consumes: `supabase` client จาก `frontend/src/lib/supabase.js`, `CartContext` (`cartItems`, `clearCart`, `totalItems`, `totalAmount`)
- Produces: insert แถวใหม่ในตาราง `orders` (status `pending`) และ `order_items` — Task 8 (OrderDetail) และ Task 9 (History) อ่านข้อมูลที่ task นี้สร้าง; นำทางไปที่ `/order/:id` ซึ่ง Task 8 จะสร้าง route รองรับ

- [ ] **Step 1: เขียน Cart.jsx ใหม่ทั้งไฟล์**

แทนที่เนื้อหาทั้งหมดของ `frontend/src/pages/Cart.jsx` ด้วย:

```jsx
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { CartContext } from '../lib/CartContext';
import { supabase } from '../lib/supabase';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount } = useContext(CartContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConfirmOrder = async () => {
    setErrorMessage('');
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setErrorMessage('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ');
      return;
    }

    setIsSubmitting(true);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error(orderError);
      setErrorMessage('สร้างคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่');
      setIsSubmitting(false);
      return;
    }

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      console.error(itemsError);
      setErrorMessage('บันทึกรายการสินค้าในคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่');
      setIsSubmitting(false);
      return;
    }

    clearCart();
    setIsSubmitting(false);
    navigate(`/order/${order.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold border-b border-gray-200 dark:border-gray-700 pb-4">ตะกร้าสินค้าของคุณ</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500">ไม่มีสินค้าในตะกร้า</p>
          <p className="mt-2 text-sm text-gray-500">ลองเพิ่มสินค้าในหน้าหลักก่อน</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-gray-100 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.name}</h2>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="min-w-[48px] text-center text-sm font-semibold text-gray-900 dark:text-gray-100">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">ยอดรวมสินค้า: ฿{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      ลบออก
                    </button>
                    <p className="text-xs text-gray-500">สูงสุด 20 ชิ้นต่อสินค้า</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {errorMessage && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
          )}

          <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">รวมสินค้า</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalItems} ชิ้น</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ยอดรวม</p>
              <p className="text-2xl font-bold text-blue-600">฿{totalAmount.toLocaleString()}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={clearCart}
                className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                ล้างตะกร้า
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันคำสั่งซื้อ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: ตรวจสอบว่าคอมไพล์และ lint ผ่าน**

Run: `cd frontend && npm run build && npm run lint`
Expected: ทั้งสองคำสั่งผ่านโดยไม่มี error (การลบ `QrCode` import และ `showQr` state ที่ไม่ได้ใช้เดิมต้องทำให้ lint สะอาดขึ้น ไม่ใช่แย่ลง)

- [ ] **Step 3: ทดสอบด้วยมือ**

Run: `cd frontend && npm run dev` (ถ้ายังไม่ได้รันอยู่)

1. เพิ่มสินค้าลงตะกร้า **โดยไม่ล็อกอิน** ไปหน้า `/cart` กด "ยืนยันคำสั่งซื้อ" → ต้องเห็นข้อความ "กรุณาเข้าสู่ระบบก่อนสั่งซื้อ" และตะกร้าต้องไม่ว่างลง (ตรวจสอบใน Supabase ว่าไม่มี order ใหม่ถูกสร้าง)
2. เข้าสู่ระบบ เพิ่มสินค้าลงตะกร้า กด "ยืนยันคำสั่งซื้อ" → ปุ่มต้องขึ้น "กำลังบันทึก..." ชั่วครู่ แล้วนำทางไปที่ URL รูปแบบ `/order/<uuid>` (หน้านี้จะยัง 404 จนกว่า Task 8 จะเพิ่ม route — เป็นพฤติกรรมที่คาดไว้ในขั้นนี้) และตะกร้าต้องว่างลง
3. เปิด Supabase Table Editor ตรวจตาราง `orders` → ต้องมีแถวใหม่สถานะ `pending` และตาราง `order_items` ต้องมีแถวตรงกับจำนวนสินค้าที่สั่ง

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Cart.jsx
git commit -m "feat: confirm order writes real orders and order_items rows"
```

---

## Task 8: หน้าใบเสร็จ/รายละเอียดคำสั่งซื้อ (OrderDetail.jsx)

**Files:**
- Create: `frontend/src/pages/OrderDetail.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: `supabase` client, ตาราง `orders`/`order_items`/`products` ที่ Task 7 เขียนข้อมูลลงไป
- Produces: route `/order/:id` — ทำให้การนำทางใน Task 7 ใช้งานได้จริง; Task 9 (History) ลิงก์มาที่ route นี้เช่นกัน

- [ ] **Step 1: สร้างหน้า OrderDetail**

สร้าง `frontend/src/pages/OrderDetail.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, QrCode } from 'lucide-react';
import { supabase } from '../lib/supabase';

const STATUS_LABELS = {
  pending: { label: 'รอดำเนินการ', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  paid: { label: 'ชำระเงินแล้ว', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped: { label: 'จัดส่งแล้ว', className: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'ยกเลิก', className: 'bg-red-50 text-red-700 border-red-200' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url))')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (isMounted) {
          setOrder(data ?? null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">กำลังโหลดคำสั่งซื้อ...</div>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-lg font-semibold text-gray-900">ไม่พบคำสั่งซื้อนี้</p>
        <Link to="/history" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          ไปหน้าประวัติคำสั่งซื้อ
        </Link>
      </div>
    );
  }

  const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

  return (
    <div className="mx-auto max-w-3xl space-y-6 print:max-w-full">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/history" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4" />
          ไปหน้าประวัติคำสั่งซื้อ
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
        >
          <Printer className="w-4 h-4" />
          พิมพ์ใบเสร็จ
        </button>
      </div>

      <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-6">
          <div>
            <p className="text-sm text-gray-500">เลขที่คำสั่งซื้อ</p>
            <p className="text-lg font-bold text-gray-900">{order.id}</p>
            <p className="mt-1 text-sm text-gray-500">
              วันที่สั่งซื้อ: {new Date(order.created_at).toLocaleString('th-TH')}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 border-b border-gray-50 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.products?.image_url}
                  alt={item.products?.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{item.products?.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x ฿{Number(item.price_at_time).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-gray-900">
                ฿{(item.quantity * item.price_at_time).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
          <p className="text-lg font-semibold text-gray-900">ยอดรวมทั้งหมด</p>
          <p className="text-2xl font-bold text-blue-600">฿{Number(order.total_amount).toLocaleString()}</p>
        </div>

        {order.status === 'pending' && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-blue-200 bg-blue-50/50 p-6 text-center print:hidden">
            <QrCode className="h-32 w-32 text-blue-600" />
            <p className="text-sm font-semibold text-gray-900">ชำระเงินผ่าน PromptPay (ตัวอย่าง)</p>
            <p className="max-w-md text-xs text-gray-500">
              นี่เป็น QR ตัวอย่างสำหรับสาธิตระบบเท่านั้น ไม่ใช่ QR ที่ใช้ชำระเงินจริง กรุณารอแอดมินตรวจสอบยอดโอนแล้วเปลี่ยนสถานะคำสั่งซื้อให้
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: เพิ่ม route ใน App.jsx**

แก้ `frontend/src/App.jsx` จาก:

```jsx
import ProductDetail from './pages/ProductDetail';
import { CartProvider } from './lib/CartContext';

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="history" element={<History />} />
          <Route path="admin" element={<Admin />} />
```

เป็น:

```jsx
import ProductDetail from './pages/ProductDetail';
import OrderDetail from './pages/OrderDetail';
import { CartProvider } from './lib/CartContext';

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="order/:id" element={<OrderDetail />} />
          <Route path="history" element={<History />} />
          <Route path="admin" element={<Admin />} />
```

- [ ] **Step 3: ตรวจสอบว่าคอมไพล์และ lint ผ่าน**

Run: `cd frontend && npm run build && npm run lint`
Expected: ทั้งสองคำสั่งผ่านโดยไม่มี error

- [ ] **Step 4: ทดสอบด้วยมือ**

Run: `cd frontend && npm run dev` (ถ้ายังไม่ได้รันอยู่)

1. ทำซ้ำ flow ยืนยันคำสั่งซื้อจาก Task 7 (เข้าสู่ระบบ → ใส่ตะกร้า → ยืนยันคำสั่งซื้อ) → ครั้งนี้ต้องไปหน้าใบเสร็จได้จริง เห็นเลขคำสั่งซื้อ วันที่ รายการสินค้า ยอดรวม badge สถานะ "รอดำเนินการ" และกล่อง QR ตัวอย่าง
2. กด "พิมพ์ใบเสร็จ" → หน้าต่างพิมพ์ของเบราว์เซอร์ต้องเปิดขึ้น (ปิดได้โดยไม่ต้องพิมพ์จริง)
3. เปิด `/order/00000000-0000-0000-0000-000000000000` (uuid ที่ไม่มีจริง) → เห็นข้อความ "ไม่พบคำสั่งซื้อนี้"
4. ล็อกอินด้วยบัญชีอื่นแล้วเปิด URL คำสั่งซื้อของบัญชีแรกตรง ๆ → ต้องเห็น "ไม่พบคำสั่งซื้อนี้" เช่นกัน (RLS บล็อก)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/OrderDetail.jsx frontend/src/App.jsx
git commit -m "feat: add order detail/receipt page at /order/:id"
```

---

## Task 9: History.jsx — ประวัติคำสั่งซื้อจากข้อมูลจริง

**Files:**
- Modify: `frontend/src/pages/History.jsx` (เขียนทั้งไฟล์ใหม่)

**Interfaces:**
- Consumes: `supabase` client, ตาราง `orders` (ที่ Task 7 เขียนข้อมูลลงไป), route `/order/:id` (Task 8)
- Produces: ไม่มี interface ใหม่ให้ task อื่นใช้ต่อ

- [ ] **Step 1: เขียน History.jsx ใหม่ทั้งไฟล์**

แทนที่เนื้อหาทั้งหมดของ `frontend/src/pages/History.jsx` ด้วย:

```jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const STATUS_LABELS = {
  pending: { label: 'รอดำเนินการ', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  paid: { label: 'ชำระเงินแล้ว', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped: { label: 'จัดส่งแล้ว', className: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'ยกเลิก', className: 'bg-red-50 text-red-700 border-red-200' },
};

export default function History() {
  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!isMounted) return;
      setSession(currentSession);

      if (!currentSession) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(count)')
        .eq('user_id', currentSession.user.id)
        .order('created_at', { ascending: false });

      if (isMounted) {
        setOrders(data ?? []);
        setLoading(false);
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">กำลังโหลดประวัติคำสั่งซื้อ...</div>;
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-500 mt-2 mb-6">เข้าสู่ระบบเพื่อดูประวัติคำสั่งซื้อของคุณผ่านปุ่มมุมขวาบน</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold border-b border-gray-200 dark:border-gray-700 pb-4">ประวัติการสั่งซื้อของคุณ</h1>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500">ยังไม่มีประวัติคำสั่งซื้อ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
            const itemCount = order.order_items?.[0]?.count ?? 0;
            return (
              <Link
                key={order.id}
                to={`/order/${order.id}`}
                className="flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString('th-TH')}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{itemCount} ชิ้น</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-blue-600">฿{Number(order.total_amount).toLocaleString()}</p>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: ตรวจสอบว่าคอมไพล์และ lint ผ่าน**

Run: `cd frontend && npm run build && npm run lint`
Expected: ทั้งสองคำสั่งผ่านโดยไม่มี error

- [ ] **Step 3: ทดสอบด้วยมือ**

Run: `cd frontend && npm run dev` (ถ้ายังไม่ได้รันอยู่)

1. **ไม่ล็อกอิน** เปิด `/history` → เห็นข้อความ "กรุณาเข้าสู่ระบบ"
2. ล็อกอินด้วยบัญชีที่มีคำสั่งซื้อจาก Task 7-8 เปิด `/history` → เห็นรายการคำสั่งซื้อที่เพิ่งสร้าง พร้อมวันที่ จำนวนชิ้น ยอดรวม และ badge สถานะ "รอดำเนินการ"
3. คลิกที่การ์ดคำสั่งซื้อ → ไปหน้า `/order/:id` ตรงกับออเดอร์ที่คลิก
4. ล็อกอินด้วยบัญชีที่ไม่เคยสั่งซื้อ เปิด `/history` → เห็นข้อความ "ยังไม่มีประวัติคำสั่งซื้อ"

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/History.jsx
git commit -m "feat: load real order history from database"
```

---

## Task 10: Admin.jsx — จัดการคำสั่งซื้อ (เปลี่ยนสถานะ)

**Files:**
- Modify: `frontend/src/pages/Admin.jsx`

**Interfaces:**
<<<<<<< HEAD
- Consumes: policy `orders_update_admin` จาก Task 1, FK `orders_user_id_profiles_fkey` จาก Task 1 (จำเป็นสำหรับ embed `profiles(full_name, email)` ใน `loadOrders`), route `/order/:id` จาก Task 8
=======
- Consumes: policy `orders_update_admin` จาก Task 1, route `/order/:id` จาก Task 8
>>>>>>> worktree-catalog-search-and-order-system
- Produces: ไม่มี interface ใหม่ให้ task อื่นใช้ต่อ (เป็นหน้าจอปลายทาง)

- [ ] **Step 1: เพิ่ม import Link และ state orders**

แก้บรรทัดบนสุด (หลังการแก้ไขจาก Task 4) จาก:

```js
import { useState, useEffect } from 'react';
import { BarChart3, Users, Package, ShoppingBag, Lock, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProducts } from '../hooks/useProducts';
import { CATEGORIES } from '../lib/categories';
```

เป็น:

```js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, Package, ShoppingBag, Lock, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProducts } from '../hooks/useProducts';
import { CATEGORIES } from '../lib/categories';
```

แก้บรรทัดที่ประกาศ `saveMessage` (จาก Task 4 คือหลัง `categoryInput`) เพิ่ม state orders จาก:

```js
  const [categoryInput, setCategoryInput] = useState('general');
  const [saveMessage, setSaveMessage] = useState('');
```

เป็น:

```js
  const [categoryInput, setCategoryInput] = useState('general');
  const [saveMessage, setSaveMessage] = useState('');
  const [orders, setOrders] = useState([]);
```

- [ ] **Step 2: เพิ่ม loadOrders และเรียกตอนตรวจสิทธิ์แอดมิน**

เพิ่มฟังก์ชัน `loadOrders` ต่อจาก `loadStats` (หลังบรรทัด `};` ที่ปิด `loadStats`):

```js
  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });

    setOrders(data ?? []);
  };
```

แก้ใน `checkAdmin` ส่วนที่เรียก `loadStats()` จาก:

```js
      if (admin) {
        await loadStats();
      }
```

เป็น:

```js
      if (admin) {
        await loadStats();
        await loadOrders();
      }
```

- [ ] **Step 3: เพิ่ม handleUpdateOrderStatus**

เพิ่มฟังก์ชันนี้ต่อจาก `handleDeleteProduct`:

```js
  const handleUpdateOrderStatus = async (orderId, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);

    if (error) {
      console.error(error);
      alert('เปลี่ยนสถานะคำสั่งซื้อไม่สำเร็จ');
      return;
    }

    await loadOrders();
  };
```

- [ ] **Step 4: เพิ่ม section จัดการคำสั่งซื้อในหน้าจอ**

แทรก section ใหม่ระหว่าง card "จัดการข้อมูลสินค้า" (ปิดด้วย `</div>` ที่บรรทัด 389 เดิม) กับ card "สถิติเซ็ตคอมพิวเตอร์ที่ขายดีที่สุด" — หา:

```jsx
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-600" />
          สถิติเซ็ตคอมพิวเตอร์ที่ขายดีที่สุด
        </h2>
```

แทรก section จัดการคำสั่งซื้อไว้ก่อนหน้านั้น ให้เป็น:

```jsx
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          จัดการคำสั่งซื้อ
        </h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีคำสั่งซื้อ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-3 pr-4">วันที่</th>
                  <th className="py-3 pr-4">ผู้ซื้อ</th>
                  <th className="py-3 pr-4">ยอดรวม</th>
                  <th className="py-3 pr-4">สถานะ</th>
                  <th className="py-3 pr-4">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4">{new Date(order.created_at).toLocaleString('th-TH')}</td>
                    <td className="py-3 pr-4">{order.profiles?.full_name || order.profiles?.email || 'ไม่ทราบชื่อ'}</td>
                    <td className="py-3 pr-4 font-semibold text-blue-600">{formatCurrency(order.total_amount)}</td>
                    <td className="py-3 pr-4">
                      <select
                        value={order.status}
                        onChange={(event) => handleUpdateOrderStatus(order.id, event.target.value)}
                        className="rounded-full border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="pending">รอดำเนินการ</option>
                        <option value="paid">ชำระเงินแล้ว</option>
                        <option value="shipped">จัดส่งแล้ว</option>
                        <option value="cancelled">ยกเลิก</option>
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <Link to={`/order/${order.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-600" />
          สถิติเซ็ตคอมพิวเตอร์ที่ขายดีที่สุด
        </h2>
```

- [ ] **Step 5: ตรวจสอบว่าคอมไพล์และ lint ผ่าน**

Run: `cd frontend && npm run build && npm run lint`
Expected: ทั้งสองคำสั่งผ่านโดยไม่มี error

- [ ] **Step 6: ทดสอบด้วยมือ**

Run: `cd frontend && npm run dev` (ถ้ายังไม่ได้รันอยู่)

1. เข้าสู่ระบบด้วยบัญชีแอดมิน ไปหน้า `/admin` → ต้องเห็น section "จัดการคำสั่งซื้อ" แสดงคำสั่งซื้อที่สร้างไว้จาก Task 7-9 พร้อมชื่อ/อีเมลผู้ซื้อ
2. เปลี่ยน dropdown สถานะของคำสั่งซื้อหนึ่งรายการเป็น "ชำระเงินแล้ว" → แถวต้องอัปเดตทันทีโดยไม่ต้อง refresh หน้า
3. เปิดบัญชีลูกค้าเจ้าของออเดอร์นั้นในอีกแท็บ ไปหน้า `/history` หรือ `/order/:id` แล้ว refresh → ต้องเห็นสถานะเปลี่ยนเป็น "ชำระเงินแล้ว" ตามที่แอดมินตั้ง
4. กด "ดูรายละเอียด" ในตารางคำสั่งซื้อ → ไปหน้า `/order/:id` ของออเดอร์นั้นถูกต้อง

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/Admin.jsx
git commit -m "feat: add order status management to admin dashboard"
```

---

## Task 11: อัปเดตเอกสารโปรเจกต์

**Files:**
- Modify: `docs/data-schema.md`
- Modify: `docs/analysis-and-design.md`
- Modify: `docs/api.md`
- Modify: `docs/how-it-works.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: ผลลัพธ์จาก Task 1-10 ทั้งหมด (เอกสารต้องสะท้อนสถานะจริงหลัง implementation เสร็จ)
- Produces: ไม่มี (task สุดท้าย)

- [ ] **Step 1: อัปเดต data-schema.md**

ใน `docs/data-schema.md` แก้ ER diagram ส่วน `PRODUCTS` ให้มี `text category` เพิ่มในบรรทัดหลัง `text image_url` และแก้ตาราง "รายละเอียดตาราง products" เพิ่มแถว:

```markdown
| category | หมวดหมู่สินค้า มีค่าได้ 4 แบบ คือ gaming (เกมมิ่ง) office (ทำงานออฟฟิศ) general (เรียน-ทำงานทั่วไป) creator (สตรีมมิ่ง/สร้างคอนเทนต์) |
```

แก้ตาราง RLS แถว `orders` คอลัมน์ "ใครเพิ่ม/แก้/ลบได้" จาก "เจ้าของบัญชีสร้างคำสั่งซื้อของตัวเองได้" เป็น "เจ้าของบัญชีสร้างคำสั่งซื้อของตัวเองได้ / แอดมินแก้ไขสถานะได้ทุกรายการ"

- [ ] **Step 2: อัปเดต analysis-and-design.md**

ใน `docs/analysis-and-design.md` แก้ตาราง Functional Requirements:
- FR-6 สถานะเปลี่ยนจาก "ยังไม่ได้พัฒนา" เป็น "ใช้งานได้แล้ว (ยืนยันด้วยมือ ยังไม่มีเกตเวย์จริง)"
- FR-8 สถานะเปลี่ยนจาก "ยังไม่ได้พัฒนา (หน้าเปล่ารอการเชื่อมข้อมูลจริง)" เป็น "ใช้งานได้แล้ว"

เพิ่มแถวใหม่ต่อท้ายตาราง:

```markdown
| FR-10 | ลูกค้าค้นหาและกรองสินค้าตามหมวดหมู่ได้ | ใช้งานได้แล้ว |
| FR-11 | ลูกค้าดูหน้ารายละเอียดสินค้าแยกต่างหากได้ | ใช้งานได้แล้ว |
| FR-12 | แอดมินดูรายการคำสั่งซื้อทั้งหมดและเปลี่ยนสถานะได้ | ใช้งานได้แล้ว |
```

ในหัวข้อ "ปัญหาที่พบระหว่างตรวจสอบระบบ" ลบแถว "ระบบสั่งซื้อยังไม่เชื่อมกับฐานข้อมูลจริง" ออก (แก้ไขแล้ว) ในหัวข้อ "แผนงานที่แนะนำสำหรับรอบพัฒนาถัดไป" ลบข้อ 2 (พัฒนาระบบยืนยันคำสั่งซื้อ) ออก เหลือเลขข้อ 1, 2, 3 เรียงใหม่ตามลำดับเดิมที่เหลือ

- [ ] **Step 3: อัปเดต api.md**

เปิด `docs/api.md` อ่านรูปแบบตารางที่มีอยู่ก่อน แล้วเพิ่มแถวในรูปแบบเดียวกันสำหรับ:

```markdown
| GET /rest/v1/products?id=eq.{id} | อ่าน | สาธารณะ | ดึงรายละเอียดสินค้าชิ้นเดียวสำหรับหน้า /product/:id |
| POST /rest/v1/orders | เขียน | ผู้ใช้ที่ล็อกอิน | สร้างคำสั่งซื้อใหม่ (status เริ่มต้น pending) |
| POST /rest/v1/order_items | เขียน | ผู้ใช้ที่ล็อกอิน | บันทึกรายการสินค้าในคำสั่งซื้อ (insert เป็น array เดียว) |
| GET /rest/v1/orders | อ่าน | เจ้าของคำสั่งซื้อ / แอดมิน | ดึงคำสั่งซื้อของตัวเอง (ลูกค้า) หรือทั้งหมด (แอดมิน) |
| PATCH /rest/v1/orders | แก้ไข | แอดมินเท่านั้น | เปลี่ยนสถานะคำสั่งซื้อ |
```

- [ ] **Step 4: อัปเดต how-it-works.md**

เปิด `docs/how-it-works.md` อ่านโทนภาษาที่ใช้อยู่ แล้วเพิ่มหัวข้อใหม่อธิบาย flow แบบภาษาคน:
- การค้นหาและกรองหมวดหมู่สินค้าที่หน้าแรก (กรองจากข้อมูลที่โหลดมาแล้ว ไม่ได้ค้นหาใหม่จากฐานข้อมูลทุกครั้ง)
- การเปิดหน้ารายละเอียดสินค้า
- ขั้นตอนตั้งแต่กดยืนยันคำสั่งซื้อ จนถึงหน้าใบเสร็จ และการที่แอดมินต้องเปลี่ยนสถานะให้ด้วยมือ (ยังไม่มีระบบตรวจสลิปอัตโนมัติ)

- [ ] **Step 5: อัปเดต README.md**

ใน `README.md` แก้หัวข้อ "ฟีเจอร์ที่ใช้งานได้จริงตอนนี้" เพิ่มบรรทัด:

```markdown
- ลูกค้าค้นหาสินค้าและกรองตามหมวดหมู่ได้ พร้อมหน้ารายละเอียดสินค้าแยกต่างหาก
- ลูกค้ายืนยันคำสั่งซื้อจากตะกร้า ดูใบเสร็จพร้อม QR พร้อมเพย์ตัวอย่าง และดูประวัติ/สถานะคำสั่งซื้อของตัวเองได้
- แอดมินดูรายการคำสั่งซื้อทั้งหมดและเปลี่ยนสถานะได้ (รอดำเนินการ/ชำระเงินแล้ว/จัดส่งแล้ว/ยกเลิก)
```

แก้ประโยคท้ายย่อหน้าที่พูดถึงฟีเจอร์ที่ยังอยู่ระหว่างวางแผน ให้คงเหลือเฉพาะ "การชำระเงินผ่าน QR พร้อมเพย์แบบเกตเวย์จริง และการตรวจสลิปอัตโนมัติ" (ตัดส่วนยืนยันสั่งซื้อออกเพราะทำแล้ว)

- [ ] **Step 6: ตรวจสอบลิงก์และรูปแบบ markdown**

อ่านทุกไฟล์ที่แก้ไขอีกครั้งให้แน่ใจว่า:
- ตาราง markdown จัดคอลัมน์ครบทุกแถว (จำนวน `|` เท่ากันทุกบรรทัดในตารางเดียวกัน)
- ไม่มีข้อความขัดแย้งกันเอง (เช่น README บอกว่ายังไม่เสร็จ แต่ analysis-and-design.md บอกว่าเสร็จแล้ว)

- [ ] **Step 7: Commit**

```bash
git add docs/data-schema.md docs/analysis-and-design.md docs/api.md docs/how-it-works.md README.md
git commit -m "docs: update project docs for search, product detail, and order management features"
```
