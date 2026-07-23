import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Cpu, HardDrive, MemoryStick, Zap } from 'lucide-react';
import { useContext, useMemo, useState } from 'react';
import { CartContext } from '../lib/CartContext';
import { useProducts } from '../hooks/useProducts';
import { CATEGORIES } from '../lib/categories';

function StockBadge({ stock }) {
  if (stock === null || stock === undefined) return null;
  if (stock === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
        สินค้าหมด
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
        เหลือ {stock} ชิ้น
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
      มีสินค้า
    </span>
  );
}

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

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gray-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.3),_transparent_60%)]" />
        <div className="relative px-8 py-14 sm:px-12 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 mb-6">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              คอมพิวเตอร์ประกอบสำเร็จรูป — พร้อมใช้งานทันที
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              เซ็ตคอม<br />
              <span className="text-blue-400">ราคาดี ใช้ได้เลย</span>
            </h1>
            <p className="mt-5 text-base text-gray-400 max-w-lg leading-relaxed">
              เลือกเซ็ตที่ตรงกับการใช้งานของคุณ ทั้งเรียน ทำงาน เล่นเกม และสตรีม
              ประกอบแล้ว ทดสอบแล้ว รับประกันคุณภาพ
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#products" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
                ดูสินค้าทั้งหมด
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link to="/history" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/10 transition-colors">
                ตรวจสอบคำสั่งซื้อ
              </Link>
            </div>
          </div>

          {/* Spec preview */}
          <div className="mt-10 lg:mt-0 lg:absolute lg:right-12 lg:top-1/2 lg:-translate-y-1/2">
            <div className="inline-grid grid-cols-3 gap-3">
              {[
                { icon: Cpu, label: 'CPU', value: 'Intel i5' },
                { icon: MemoryStick, label: 'RAM', value: '16 GB' },
                { icon: HardDrive, label: 'SSD', value: '1 TB' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-center backdrop-blur">
                  <Icon className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-lg font-bold">{value}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { title: 'ประกอบสำเร็จ', desc: 'เลือกสเปค เราประกอบให้ ใช้งานได้ทันที' },
          { title: 'รับประกัน 1 ปี', desc: 'ทีมงานดูแลหลังการขาย มีปัญหาเราช่วย' },
          { title: 'จัดส่งทั่วไทย', desc: 'แพ็คอย่างดี ส่งถึงมือคุณปลอดภัย 100%' },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <p className="mt-1.5 text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Products */}
      <section id="products">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">สินค้า</p>
            <h2 className="text-2xl font-bold text-gray-900">เซ็ตคอมพิวเตอร์</h2>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="w-full sm:w-72 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              ทั้งหมด
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat.value ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="text-gray-400 font-medium">ไม่พบสินค้าที่ค้นหา</p>
            <button type="button" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="mt-3 text-sm text-blue-600 hover:text-blue-700">ล้างตัวกรอง</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => {
              const outOfStock = (product.stock ?? null) !== null && product.stock <= 0;
              return (
                <div
                  key={product.id}
                  className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:shadow-md ${outOfStock ? 'border-gray-100 opacity-75' : 'border-gray-100 hover:-translate-y-0.5'}`}
                >
                  <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className={`h-48 w-full object-cover transition-transform duration-300 ${outOfStock ? '' : 'group-hover:scale-[1.03]'}`}
                    />
                    {outOfStock && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="rounded-lg bg-gray-900/80 px-4 py-1.5 text-sm font-semibold text-white">สินค้าหมด</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link to={`/product/${product.id}`} className="flex-1">
                        <h3 className="font-bold text-gray-900 leading-tight hover:text-blue-600 transition-colors">{product.name}</h3>
                      </Link>
                      <StockBadge stock={product.stock} />
                    </div>
                    <p className="text-sm text-gray-500 flex-1 line-clamp-2">{product.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        ฿{Number(product.price).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => !outOfStock && addToCart(product)}
                        disabled={outOfStock}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                          outOfStock
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {outOfStock ? 'หมดสต็อก' : 'ใส่ตะกร้า'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
