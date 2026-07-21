import { useState, useEffect } from 'react';
import { BarChart3, Users, Package, ShoppingBag, Lock, LogIn, ImagePlus, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { saveProductsToStorage, resetProductsToDefault } from '../data/products';
import { useProducts } from '../hooks/useProducts';

const formatCurrency = (value) =>
  `฿${Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// Removed heuristic/admin email logic

export default function Admin() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
  });
  const { products, reloadProducts } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      const firstProduct = products[0];
      setSelectedProductId(firstProduct.id);
      setNameInput(firstProduct.name || '');
      setPriceInput(firstProduct.price?.toString() || '');
      setImageUrlInput(firstProduct.image_url || '');
    }
  }, [products, selectedProductId]);

  const loadStats = async () => {
    try {
      const [{ count: usersCount }, { count: ordersCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
      ]);

      let totalSales = 0;
      try {
        const { data: orders } = await supabase.from('orders').select('total_amount');
        totalSales = orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;
      } catch {
        totalSales = 0;
      }

      setStats({
        totalSales,
        totalOrders: ordersCount || 0,
        totalUsers: usersCount || 0,
      });
    } catch {
      setStats({ totalSales: 0, totalOrders: 0, totalUsers: 0 });
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProductId(product.id);
    setNameInput(product.name || '');
    setPriceInput(product.price?.toString() || '');
    setImageUrlInput(product.image_url || '');
    setSaveMessage('');
  };

  const handleSaveProduct = () => {
    const nextProducts = products.map((product) =>
      product.id === selectedProductId
        ? {
            ...product,
            name: nameInput.trim() || product.name,
            price: Number(priceInput) || product.price,
            image_url: imageUrlInput.trim() || product.image_url,
          }
        : product,
    );

    saveProductsToStorage(nextProducts);
    setSaveMessage('อัปเดตข้อมูลสินค้าเรียบร้อย');
    setTimeout(() => reloadProducts(), 100);
  };

  const handleResetProducts = () => {
    const defaults = resetProductsToDefault();
    const first = defaults[0];
    setSelectedProductId(first?.id || null);
    setNameInput(first?.name || '');
    setPriceInput(first?.price?.toString() || '');
    setImageUrlInput(first?.image_url || '');
    setSaveMessage('คืนค่าเริ่มต้นเรียบร้อย');
    setTimeout(() => reloadProducts(), 100);
  };

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);

    if (session?.user?.id) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      const metadataRole =
        session.user.user_metadata?.role || session.user.app_metadata?.role;
      const admin = data?.role === 'admin' || metadataRole === 'admin';

      setIsAdmin(admin);
      if (admin) {
        await loadStats();
      }
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-20">กำลังตรวจสอบสิทธิ์...</div>;
  }

    if (!session) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold">สงวนสิทธิ์เฉพาะผู้ดูแลระบบ</h1>
          <p className="text-gray-500 mt-2 mb-6">กรุณาเข้าสู่ระบบผ่านปุ่มมุมขวาบน</p>
        </div>
      </div>
    );
  }

    if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-500 mt-2">บัญชีของคุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">ยอดขายวันนี้</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-green-100 text-green-600 p-4 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">คำสั่งซื้อ</p>
            <p className="text-2xl font-bold">{stats.totalOrders} รายการ</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-purple-100 text-purple-600 p-4 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">สมาชิกรวม</p>
            <p className="text-2xl font-bold">{stats.totalUsers} คน</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-blue-600" />
            จัดการรูปภาพสินค้าแนะนำ
          </h2>
          <button
            type="button"
            onClick={handleResetProducts}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-600"
          >
            <RotateCcw className="w-4 h-4" />
            คืนค่าเริ่มต้น
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSelectProduct(product)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${selectedProductId === product.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-blue-200'}`}
              >
                <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-xl object-cover" />
                <div>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
            {selectedProductId ? (
              <>
                <div className="mb-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">ตัวอย่างภาพ</p>
                  <h3 className="mt-1 text-xl font-bold text-gray-900">
                    {products.find((product) => product.id === selectedProductId)?.name}
                  </h3>
                </div>
                <img
                  src={imageUrlInput || products.find((product) => product.id === selectedProductId)?.image_url}
                  alt="ตัวอย่างภาพสินค้า"
                  className="h-56 w-full rounded-2xl object-cover border border-gray-200"
                />
                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    ชื่อสินค้า
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(event) => setNameInput(event.target.value)}
                      placeholder="ชื่อสินค้า"
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                    />
                  </label>
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
                    URL รูปภาพ
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(event) => setImageUrlInput(event.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <ImagePlus className="w-4 h-4" />
                  บันทึกข้อมูลสินค้า
                </button>
                {saveMessage ? <p className="mt-3 text-sm text-green-600">{saveMessage}</p> : null}
              </>
            ) : (
              <p className="text-gray-500">เลือกสินค้าจากรายการด้านซ้ายเพื่อเริ่มแก้ไข</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-600" />
          สถิติเซ็ตคอมพิวเตอร์ที่ขายดีที่สุด
        </h2>
        <div className="h-64 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <p className="text-gray-500">ยังไม่มีข้อมูลสถิติ</p>
        </div>
      </div>
    </div>
  );
}
