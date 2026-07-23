import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, MapPin, User, Phone } from 'lucide-react';
import { CartContext } from '../lib/CartContext';
import { supabase } from '../lib/supabase';

function Field({ label, icon: Icon, required, ...props }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition"
      />
    </label>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount } = useContext(CartContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Shipping address state
  const [shipping, setShipping] = useState({ name: '', phone: '', address: '' });

  // Pre-fill from user profile
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', session.user.id)
        .maybeSingle();
      if (profile) {
        setShipping((prev) => ({
          name: prev.name || profile.full_name || '',
          phone: prev.phone || profile.phone || '',
          address: prev.address,
        }));
      }
    });
  }, []);

  const setField = (key) => (e) => setShipping((prev) => ({ ...prev, [key]: e.target.value }));

  const handleConfirmOrder = async () => {
    setErrorMessage('');

    // Validate shipping
    if (!shipping.name.trim()) { setErrorMessage('กรุณากรอกชื่อ-นามสกุลผู้รับ'); return; }
    if (!shipping.phone.trim()) { setErrorMessage('กรุณากรอกเบอร์โทรศัพท์'); return; }
    if (!shipping.address.trim()) { setErrorMessage('กรุณากรอกที่อยู่จัดส่ง'); return; }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setErrorMessage('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ'); return; }

    setIsSubmitting(true);

    // Check stock
    const productIds = cartItems.map((i) => i.id);
    const { data: latestProducts, error: prodError } = await supabase
      .from('products')
      .select('id, stock')
      .in('id', productIds);

    if (prodError) {
      setErrorMessage('ไม่สามารถตรวจสอบสต็อกสินค้าได้ กรุณาลองใหม่');
      setIsSubmitting(false);
      return;
    }

    const stockMap = new Map((latestProducts || []).map((p) => [p.id, p.stock ?? 0]));

    for (const item of cartItems) {
      const available = stockMap.get(item.id) ?? 0;
      if (available < (item.quantity || 0)) {
        setErrorMessage(`จำนวนสินค้า "${item.name}" มีไม่เพียงพอ (คงเหลือ ${available} ชิ้น)`);
        setIsSubmitting(false);
        return;
      }
    }

    // Create order with shipping address
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        total_amount: totalAmount,
        status: 'pending',
        shipping_name: shipping.name.trim(),
        shipping_phone: shipping.phone.trim(),
        shipping_address: shipping.address.trim(),
      })
      .select()
      .single();

    if (orderError || !order) {
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
      setErrorMessage('บันทึกรายการสินค้าไม่สำเร็จ กรุณาลองใหม่');
      setIsSubmitting(false);
      return;
    }

    // Deduct stock
    try {
      await Promise.all(
        orderItems.map(async (it) => {
          const current = stockMap.get(it.product_id) ?? 0;
          const newStock = Math.max(0, current - (it.quantity || 0));
          await supabase.from('products').update({ stock: newStock }).eq('id', it.product_id);
        })
      );
    } catch (e) {
      console.error('stock update error', e);
    }

    clearCart();
    setIsSubmitting(false);
    navigate(`/order/${order.id}`);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-7 h-7 text-gray-300" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">ตะกร้าว่างเปล่า</h1>
        <p className="mt-1 text-sm text-gray-500">ยังไม่มีสินค้าในตะกร้าของคุณ</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          เลือกซื้อสินค้า
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ตะกร้าสินค้า</h1>
        <button type="button" onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
          ล้างตะกร้า
        </button>
      </div>

      {/* Cart items */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        {cartItems.map((item, index) => (
          <div key={item.id} className={`flex items-center gap-4 p-5 ${index < cartItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
            {item.image_url && (
              <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">฿{Number(item.price).toLocaleString()} / ชิ้น</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="font-semibold text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</p>
            </div>
            <button type="button" onClick={() => removeFromCart(item.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Shipping address form */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="font-semibold text-gray-900">ที่อยู่จัดส่ง</h2>
        </div>
        <div className="space-y-3">
          <Field
            label="ชื่อ-นามสกุลผู้รับ"
            icon={User}
            required
            type="text"
            placeholder="เช่น สมชาย ใจดี"
            value={shipping.name}
            onChange={setField('name')}
          />
          <Field
            label="เบอร์โทรศัพท์"
            icon={Phone}
            required
            type="tel"
            placeholder="เช่น 081-234-5678"
            value={shipping.phone}
            onChange={setField('phone')}
          />
          <label className="block">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              ที่อยู่จัดส่ง
              <span className="text-red-500">*</span>
            </span>
            <textarea
              rows={3}
              placeholder="บ้านเลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
              value={shipping.address}
              onChange={setField('address')}
              className="mt-1.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition resize-none"
            />
          </label>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Summary */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="space-y-2 pb-4 border-b border-gray-50">
          <div className="flex justify-between text-sm text-gray-500">
            <span>จำนวนสินค้า</span>
            <span>{totalItems} ชิ้น</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>ค่าจัดส่ง</span>
            <span className="text-emerald-600 font-medium">ฟรี</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4">
          <div>
            <p className="text-sm text-gray-500">ยอดรวมทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">฿{totalAmount.toLocaleString()}</p>
          </div>
          <button
            type="button"
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันคำสั่งซื้อ'}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
