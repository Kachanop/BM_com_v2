import { Link } from 'react-router-dom';
import { ShoppingCart, Sparkles, ShieldCheck, Headphones } from 'lucide-react';
import { useContext, useMemo, useState } from 'react';
import { CartContext } from '../lib/CartContext';
import { useProducts } from '../hooks/useProducts';
import { CATEGORIES } from '../lib/categories';

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
<<<<<<< HEAD
=======

>>>>>>> worktree-catalog-search-and-order-system
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-blue-100 bg-white p-8 shadow-[0_20px_80px_-20px_rgba(37,99,235,0.18)] sm:p-10 lg:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_35%),linear-gradient(135deg,_rgba(243,249,255,0.95),_rgba(255,255,255,1))]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
              <Sparkles className="w-4 h-4" />
              คอมพิวเตอร์ประกอบแล้ว ส่งตรงถึงบ้าน
            </div>
            <h1 className="mt-4 text-4xl font-black leading-tight text-gray-900 sm:text-5xl">
              คอมพี่ประกอบแล้ว<br />ไม่ต้องจัดสเปคเอง
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              เลือกเซ็ตที่ใช่สำหรับการเรียน งาน เล่นเกม และสตรีมได้ทันที พร้อมรับประกันและบริการหลังการขายที่น่าเชื่อถือ
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/cart" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
                <ShoppingCart className="w-5 h-5" />
                ดูสินค้าทั้งหมด
              </Link>
              <Link to="/history" className="inline-flex items-center rounded-full border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-600">
                ตรวจสอบคำสั่งซื้อ
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] bg-gray-900 p-5 text-white shadow-2xl">
            <div className="rounded-[22px] border border-white/10 bg-white/10 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">เซ็ตแนะนำ</p>
                  <p className="text-xl font-semibold">BM Pro Gaming</p>
                </div>
                <div className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-200">พร้อมส่ง</div>
              </div>
                  <div className="mt-6 rounded-2xl bg-white p-4 text-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">ประหยัดสุดคุ้ม</p>
                    <p className="text-2xl font-bold">฿25,900</p>
                  </div>
                      <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-xl bg-white/10 px-3 py-3">
                  <p className="font-semibold">i5</p>
                  <p className="text-gray-300">CPU</p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-3">
                  <p className="font-semibold">16GB</p>
                  <p className="text-gray-300">RAM</p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-3">
                  <p className="font-semibold">1TB</p>
                  <p className="text-gray-300">SSD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'ประกอบแล้วใช้งานทันที', desc: 'เลือกใช้ได้เลย ไม่ต้องกังวลเรื่องสเปค', icon: Sparkles },
          { title: 'รับประกันและช่วยเหลือ', desc: 'ทีมงานพร้อมดูแลหลังการขาย', icon: ShieldCheck },
          { title: 'บริการลูกค้า 24/7', desc: 'คุยและตอบคำถามได้ตลอด', icon: Headphones },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <item.icon className="w-5 h-5" />
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </section>

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
    </div>
  );
}
