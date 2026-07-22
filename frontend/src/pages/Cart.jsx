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
