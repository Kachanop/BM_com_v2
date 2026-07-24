import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Package, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const STATUS_CONFIG = {
  pending: { label: 'รอดำเนินการ', dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
  paid: { label: 'ชำระเงินแล้ว', dot: 'bg-blue-400', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
  shipped: { label: 'จัดส่งแล้ว', dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  cancelled: { label: 'ยกเลิกแล้ว', dot: 'bg-gray-300', text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100' },
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

      if (!currentSession) { setLoading(false); return; }

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(count)')
        .eq('user_id', currentSession.user.id)
        .order('created_at', { ascending: false });

      if (isMounted) { setOrders(data ?? []); setLoading(false); }
    };

    loadOrders();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-3 w-28 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
              <div className="h-6 w-16 bg-gray-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">กรุณาเข้าสู่ระบบ</h1>
        <p className="mt-2 text-sm text-gray-500">เข้าสู่ระบบเพื่อดูประวัติคำสั่งซื้อของคุณ</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ประวัติคำสั่งซื้อ</h1>
        <p className="mt-1 text-sm text-gray-500">คำสั่งซื้อทั้งหมดของคุณ</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 text-gray-300" />
          </div>
          <p className="font-medium text-gray-500">ยังไม่มีคำสั่งซื้อ</p>
          <Link to="/" className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700">เริ่มช้อปปิ้ง</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const itemCount = order.order_items?.[0]?.count ?? 0;
            return (
              <Link
                key={order.id}
                to={`/order/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="font-semibold text-gray-900">{itemCount} รายการ</p>
                  <p className="text-lg font-bold text-blue-600">฿{Number(order.total_amount).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
