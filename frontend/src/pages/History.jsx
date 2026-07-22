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
