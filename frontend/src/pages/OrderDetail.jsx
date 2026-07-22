import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, QrCode } from 'lucide-react';
import { supabase } from '../lib/supabase';

const STATUS_LABELS = {
  pending: { label: 'รอดำเนินการ', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  paid: { label: 'ชำระเงินแล้ว', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped: { label: 'จัดส่งแล้ว', className: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'ยกเลิก', className: 'bg-red-50 text-red-700 border-red-200' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url))')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (isMounted) {
          setOrder(data ?? null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">กำลังโหลดคำสั่งซื้อ...</div>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-lg font-semibold text-gray-900">ไม่พบคำสั่งซื้อนี้</p>
        <Link to="/history" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          ไปหน้าประวัติคำสั่งซื้อ
        </Link>
      </div>
    );
  }

  const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

  return (
    <div className="mx-auto max-w-3xl space-y-6 print:max-w-full">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/history" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4" />
          ไปหน้าประวัติคำสั่งซื้อ
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
        >
          <Printer className="w-4 h-4" />
          พิมพ์ใบเสร็จ
        </button>
      </div>

      <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-6">
          <div>
            <p className="text-sm text-gray-500">เลขที่คำสั่งซื้อ</p>
            <p className="text-lg font-bold text-gray-900">{order.id}</p>
            <p className="mt-1 text-sm text-gray-500">
              วันที่สั่งซื้อ: {new Date(order.created_at).toLocaleString('th-TH')}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 border-b border-gray-50 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.products?.image_url}
                  alt={item.products?.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{item.products?.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x ฿{Number(item.price_at_time).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-gray-900">
                ฿{(item.quantity * item.price_at_time).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
          <p className="text-lg font-semibold text-gray-900">ยอดรวมทั้งหมด</p>
          <p className="text-2xl font-bold text-blue-600">฿{Number(order.total_amount).toLocaleString()}</p>
        </div>

        {order.status === 'pending' && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-blue-200 bg-blue-50/50 p-6 text-center print:hidden">
            <QrCode className="h-32 w-32 text-blue-600" />
            <p className="text-sm font-semibold text-gray-900">ชำระเงินผ่าน PromptPay (ตัวอย่าง)</p>
            <p className="max-w-md text-xs text-gray-500">
              นี่เป็น QR ตัวอย่างสำหรับสาธิตระบบเท่านั้น ไม่ใช่ QR ที่ใช้ชำระเงินจริง กรุณารอแอดมินตรวจสอบยอดโอนแล้วเปลี่ยนสถานะคำสั่งซื้อให้
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
