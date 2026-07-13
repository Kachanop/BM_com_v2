import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock 3 computer sets
    const mockProducts = [
      {
        id: 1,
        name: "เซ็ตสุดคุ้ม Beginner",
        description: "เหมาะสำหรับทำงานทั่วไป พิมพ์งาน ดูหนัง ฟังเพลง เล่นเกมเบาๆ",
        price: 15900,
        image_url: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: 2,
        name: "เซ็ต Gamer ขั้นเทพ",
        description: "เล่นเกมยอดฮิตได้ลื่นไหล ไม่ว่าจะเป็น Valorant, GTA V, หรือ PUBG",
        price: 25900,
        image_url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: 3,
        name: "เซ็ต Pro Streamer",
        description: "สเปคแรง ตัดต่อวิดีโอ 4K และสตรีมเกมได้แบบไม่มีสะดุด",
        price: 45900,
        image_url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=600&q=80"
      }
    ];
    setProducts(mockProducts);
    setLoading(false);
  }, []);
  return (
    <div className="space-y-8">
      <section className="text-center py-12 bg-red-600 text-white rounded-2xl shadow-lg">
        <h1 className="text-4xl font-extrabold mb-4">คอมพี่ประกอบแล้ว ไม่ใช้จัดสเปคเอง</h1>
        <p className="text-lg mb-8 opacity-90">เลือกเซ็ตที่ใช่ จ่ายเงินง่าย ส่งตรงถึงบ้าน พร้อมใช้งานทันที</p>
        <button className="bg-white text-red-600 px-8 py-3 rounded-full font-bold shadow-md hover:bg-gray-100 transition-colors">
          ดูสินค้าทั้งหมด
        </button>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="bg-red-600 w-2 h-8 rounded-full"></span>
          เซ็ตคอมพิวเตอร์แนะนำ
        </h2>
        {loading ? (
          <div className="text-center py-12 text-gray-500">กำลังโหลดข้อมูลสินค้า...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col">
                <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-1">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-red-600">
                      ฿{product.price.toLocaleString()}
                    </span>
                    <button className="flex items-center gap-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
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
