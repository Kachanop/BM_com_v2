import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, Users, Package, ShoppingBag, Lock, Plus, Trash2,
  Save, TrendingUp, ChevronRight, AlertTriangle, MapPin, Phone,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProducts } from '../hooks/useProducts';
import { CATEGORIES } from '../lib/categories';

const formatCurrency = (value) =>
  `฿${Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })}`;

const STATUS_CONFIG = {
  pending: { label: 'รอดำเนินการ', dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
  paid: { label: 'ชำระเงินแล้ว', dot: 'bg-blue-400', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
  shipped: { label: 'จัดส่งแล้ว', dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  cancelled: { label: 'ยกเลิก', dot: 'bg-gray-300', text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100' },
};

const EMPTY_FORM = { name: '', price: '', description: '', image_url: '', category: 'general', stock: '' };

export default function Admin() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0 });
  const [orders, setOrders] = useState([]);
  const { products, reloadProducts, addProduct, deleteProduct } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkAdmin();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => checkAdmin());
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (products.length > 0 && !selectedProductId && !isCreating) {
      selectProduct(products[0]);
    }
  }, [products, selectedProductId, isCreating]);

  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user?.id) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        const admin = data?.role === 'admin' || session.user.user_metadata?.role === 'admin';
        setIsAdmin(admin);
        if (admin) { await loadStats(); await loadOrders(); }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [{ count: usersCount }, { count: ordersCount }, { count: productsCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
      ]);
      const { data: ordersData } = await supabase.from('orders').select('total_amount');
      const totalSales = ordersData?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;
      setStats({ totalSales, totalOrders: ordersCount || 0, totalUsers: usersCount || 0, totalProducts: productsCount || 0 });
    } catch { setStats({ totalSales: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0 }); }
  };

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
    setOrders(data ?? []);
  };

  const selectProduct = (product) => {
    setIsCreating(false);
    setSelectedProductId(product.id);
    setForm({
      name: product.name || '',
      price: product.price?.toString() || '',
      description: product.description || '',
      image_url: product.image_url || '',
      category: product.category || 'general',
      stock: product.stock?.toString() ?? '',
    });
    setSaveMessage({ type: '', text: '' });
  };

  const startCreate = () => {
    setIsCreating(true);
    setSelectedProductId(null);
    setForm(EMPTY_FORM);
    setSaveMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      setSaveMessage({ type: 'error', text: 'กรุณากรอกชื่อสินค้าและราคา' });
      return;
    }
    setIsSaving(true);
    const payload = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      image_url: form.image_url,
      category: form.category,
      stock: form.stock !== '' ? Number(form.stock) : null,
    };

    if (isCreating) {
      const { error } = await addProduct(payload);
      if (error) { setSaveMessage({ type: 'error', text: 'เพิ่มสินค้าไม่สำเร็จ' }); }
      else { setIsCreating(false); setSaveMessage({ type: 'success', text: 'เพิ่มสินค้าใหม่เรียบร้อย' }); }
    } else {
      const { error } = await supabase.from('products').update(payload).eq('id', selectedProductId);
      if (error) { setSaveMessage({ type: 'error', text: 'บันทึกไม่สำเร็จ' }); }
      else { setSaveMessage({ type: 'success', text: 'อัปเดตสินค้าเรียบร้อย' }); reloadProducts(); }
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedProductId || !confirm('ยืนยันลบสินค้านี้?')) return;
    const { error } = await deleteProduct(selectedProductId);
    if (error) { setSaveMessage({ type: 'error', text: 'ลบสินค้าไม่สำเร็จ' }); }
    else { setSelectedProductId(null); setSaveMessage({ type: 'success', text: 'ลบสินค้าเรียบร้อย' }); }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) { alert('เปลี่ยนสถานะไม่สำเร็จ'); return; }
    await loadOrders();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-sm text-gray-400">กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (!session || !isAdmin) {
    return (
      <div className="max-w-sm mx-auto mt-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">{!session ? 'กรุณาเข้าสู่ระบบ' : 'ไม่มีสิทธิ์เข้าถึง'}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {!session ? 'เข้าสู่ระบบด้วยบัญชีแอดมินเพื่อดูหน้านี้' : 'บัญชีของคุณไม่มีสิทธิ์แอดมิน'}
        </p>
      </div>
    );
  }

  const lowStockProducts = products.filter((p) => p.stock !== null && p.stock !== undefined && p.stock <= 3);

  const TABS = [
    { key: 'overview', label: 'ภาพรวม', icon: BarChart3 },
    { key: 'products', label: 'สินค้า', icon: Package },
    { key: 'orders', label: 'คำสั่งซื้อ', icon: ShoppingBag },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">จัดการระบบ</h1>
        <p className="mt-1 text-sm text-gray-500">Admin Dashboard</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* =================== OVERVIEW =================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'ยอดขายรวม', value: formatCurrency(stats.totalSales), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'คำสั่งซื้อ', value: `${stats.totalOrders} รายการ`, icon: ShoppingBag, color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'สมาชิก', value: `${stats.totalUsers} คน`, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'สินค้าทั้งหมด', value: `${stats.totalProducts} รายการ`, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Low stock alert */}
          {lowStockProducts.length > 0 && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-semibold text-amber-800">สินค้าสต็อกใกล้หมด ({lowStockProducts.length} รายการ)</p>
              </div>
              <div className="space-y-2">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-amber-800 font-medium">{p.name}</span>
                    <span className={`font-semibold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {p.stock === 0 ? 'หมดสต็อก' : `เหลือ ${p.stock} ชิ้น`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent orders preview */}
          <div className="rounded-xl border border-gray-100 bg-white">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900">คำสั่งซื้อล่าสุด</h2>
              <button type="button" onClick={() => setActiveTab('orders')} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {orders.slice(0, 5).map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <div key={order.id} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.profiles?.full_name || order.profiles?.email || 'ไม่ทราบชื่อ'}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('th-TH')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount)}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================== PRODUCTS =================== */}
      {activeTab === 'products' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Product List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{products.length} รายการ</p>
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                เพิ่มสินค้าใหม่
              </button>
            </div>

            <div className="space-y-2">
              {products.map((product) => {
                const outOfStock = product.stock !== null && product.stock !== undefined && product.stock <= 0;
                const isSelected = selectedProductId === product.id;
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => selectProduct(product)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      isSelected ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                    </div>
                    <div className="text-right">
                      {product.stock !== null && product.stock !== undefined ? (
                        <span className={`text-xs font-medium ${outOfStock ? 'text-red-500' : product.stock <= 5 ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {outOfStock ? 'หมด' : `${product.stock} ชิ้น`}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Form */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 h-fit sticky top-24">
            {selectedProductId || isCreating ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
                    {isCreating ? 'สินค้าใหม่' : 'แก้ไขสินค้า'}
                  </p>
                  <h3 className="text-lg font-bold text-gray-900">
                    {isCreating ? (form.name || 'ชื่อสินค้า') : products.find((p) => p.id === selectedProductId)?.name}
                  </h3>
                </div>

                {(form.image_url) && (
                  <img
                    src={form.image_url}
                    alt="preview"
                    className="h-40 w-full rounded-xl object-cover border border-gray-100"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}

                {[
                  { label: 'ชื่อสินค้า', key: 'name', type: 'text', placeholder: 'เช่น BM Gaming Pro i5' },
                  { label: 'ราคา (บาท)', key: 'price', type: 'number', placeholder: '0' },
                  { label: 'สต็อก (ชิ้น)', key: 'stock', type: 'number', placeholder: 'ว่างเว้นหากไม่ติดตาม' },
                  { label: 'URL รูปภาพ', key: 'image_url', type: 'url', placeholder: 'https://...' },
                ].map(({ label, key, type, placeholder }) => (
                  <label key={key} className="block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      min={type === 'number' ? '0' : undefined}
                      className="mt-1.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </label>
                ))}

                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">หมวดหมู่</span>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">รายละเอียด</span>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="อธิบายจุดเด่นของสินค้า"
                    rows={3}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition resize-none"
                  />
                </label>

                {saveMessage.text && (
                  <p className={`text-sm font-medium ${saveMessage.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {saveMessage.text}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'กำลังบันทึก...' : isCreating ? 'เพิ่มสินค้า' : 'บันทึก'}
                  </button>
                  {!isCreating && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      ลบ
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">เลือกสินค้าจากรายการ หรือเพิ่มสินค้าใหม่</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================== ORDERS =================== */}
      {activeTab === 'orders' && (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">คำสั่งซื้อทั้งหมด ({orders.length} รายการ)</h2>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">ยังไม่มีคำสั่งซื้อ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 px-6 py-3">วันที่</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 px-6 py-3">ผู้ซื้อ</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 px-6 py-3">ที่อยู่จัดส่ง</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 px-6 py-3">ยอด</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 px-6 py-3">สถานะ</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400 px-6 py-3">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString('th-TH')}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{order.profiles?.full_name || order.profiles?.email || '—'}</p>
                          {order.shipping_phone && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />{order.shipping_phone}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 max-w-[220px]">
                          {order.shipping_name || order.shipping_address ? (
                            <div className="space-y-0.5">
                              {order.shipping_name && (
                                <p className="text-sm font-medium text-gray-900">{order.shipping_name}</p>
                              )}
                              {order.shipping_address && (
                                <p className="text-xs text-gray-500 flex items-start gap-1">
                                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{order.shipping_address}</span>
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(order.total_amount)}</td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold outline-none cursor-pointer transition ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          >
                            <option value="pending">รอดำเนินการ</option>
                            <option value="paid">ชำระเงินแล้ว</option>
                            <option value="shipped">จัดส่งแล้ว</option>
                            <option value="cancelled">ยกเลิก</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/order/${order.id}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            ดูรายละเอียด
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
