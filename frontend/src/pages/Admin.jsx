import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, Package, ShoppingBag, Lock, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProducts } from '../hooks/useProducts';
import { CATEGORIES } from '../lib/categories';

const formatCurrency = (value) =>
  `฿${Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function Admin() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
  });
  const { products, reloadProducts, addProduct, deleteProduct } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('general');
  const [saveMessage, setSaveMessage] = useState('');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
  checkAdmin();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    checkAdmin();
  });

  return () => subscription.unsubscribe();
}, []);

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

  const loadStats = async () => {
    try {
      const [{ count: usersCount }, { count: ordersCount }] =
  await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select("*", { count: "exact", head: true }),
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

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });

    setOrders(data ?? []);
  };

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

  const handleSaveProduct = async () => {
    if (!nameInput.trim() || !priceInput) {
      alert('กรุณากรอกชื่อสินค้าและราคาให้ครบ');
      return;
    }

    if (isCreating) {
      const { error } = await addProduct({
        name: nameInput,
        price: Number(priceInput),
        description: descriptionInput,
        image_url: imageUrlInput,
        category: categoryInput,
      });

      if (error) {
        console.error(error);
        alert('เพิ่มสินค้าไม่สำเร็จ');
        return;
      }

      setIsCreating(false);
      setSaveMessage('เพิ่มสินค้าใหม่เรียบร้อย');
      return;
    }

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

    if (error) {
      console.error(error);
      alert("บันทึกไม่สำเร็จ");
      return;
    }

    setSaveMessage("อัปเดตข้อมูลสินค้าเรียบร้อย");
    reloadProducts();
  };

  const handleDeleteProduct = async () => {
    if (!selectedProductId) return;
    if (!confirm('ยืนยันลบสินค้านี้ออกจากระบบ')) return;

    const { error } = await deleteProduct(selectedProductId);

    if (error) {
      console.error(error);
      alert('ลบสินค้าไม่สำเร็จ');
      return;
    }

    setSelectedProductId(null);
    setSaveMessage('ลบสินค้าเรียบร้อย');
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);

    if (error) {
      console.error(error);
      alert('เปลี่ยนสถานะคำสั่งซื้อไม่สำเร็จ');
      return;
    }

    await loadOrders();
  };

 const checkAdmin = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSession(session);

    if (session?.user?.id) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      const admin =
        data?.role === "admin" ||
        session.user.user_metadata?.role === "admin";

      setIsAdmin(admin);

      if (admin) {
        await loadStats();
        await loadOrders();
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
 if (loading) {
  return (
    <div className="text-center py-20">
      กำลังตรวจสอบสิทธิ์...
    </div>
  );
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
            จัดการข้อมูลสินค้า
          </h2>
          <button
            type="button"
            onClick={handleStartCreate}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            เพิ่มสินค้าใหม่
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
            {selectedProductId || isCreating ? (
              <>
                <div className="mb-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                    {isCreating ? 'เพิ่มสินค้าใหม่' : 'ตัวอย่างภาพ'}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-gray-900">
                    {isCreating
                      ? (nameInput || 'สินค้าใหม่')
                      : products.find((product) => product.id === selectedProductId)?.name}
                  </h3>
                </div>
                {(imageUrlInput || !isCreating) && (
                  <img
                    src={imageUrlInput || products.find((product) => product.id === selectedProductId)?.image_url}
                    alt="ตัวอย่างภาพสินค้า"
                    className="h-56 w-full rounded-2xl object-cover border border-gray-200"
                  />
                )}
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
                    <textarea
                      value={descriptionInput}
                      onChange={(event) => setDescriptionInput(event.target.value)}
                      placeholder="อธิบายจุดเด่นของสินค้าให้ลูกค้าเข้าใจง่าย"
                      rows={3}
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
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveProduct}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <ImagePlus className="w-4 h-4" />
                    {isCreating ? 'เพิ่มสินค้า' : 'บันทึกข้อมูลสินค้า'}
                  </button>
                  {!isCreating && (
                    <button
                      type="button"
                      onClick={handleDeleteProduct}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      ลบสินค้านี้
                    </button>
                  )}
                </div>
                {saveMessage ? <p className="mt-3 text-sm text-green-600">{saveMessage}</p> : null}
              </>
            ) : (
              <p className="text-gray-500">เลือกสินค้าจากรายการด้านซ้าย หรือกดเพิ่มสินค้าใหม่</p>
            )}
          </div>
        </div>
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
        <div className="h-64 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <p className="text-gray-500">ยังไม่มีข้อมูลสถิติ</p>
        </div>
      </div>
    </div>
  );
}
