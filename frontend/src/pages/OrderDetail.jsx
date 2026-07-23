import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, QrCode, Package, MapPin, Phone, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const STATUS_CONFIG = {
  pending: { label: 'รอดำเนินการ', dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
  paid: { label: 'ชำระเงินแล้ว', dot: 'bg-blue-400', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
  shipped: { label: 'จัดส่งแล้ว', dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  cancelled: { label: 'ยกเลิกแล้ว', dot: 'bg-gray-300', text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100' },
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
        if (isMounted) { setOrder(data ?? null); setLoading(false); }
      });

    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 pt-4">
        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
        <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-gray-100 rounded" />
          <div className="h-3 w-32 bg-gray-100 rounded" />
          <div className="border-t border-gray-50 pt-4 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-gray-100 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-lg font-semibold text-gray-900">ไม่พบคำสั่งซื้อนี้</p>
        <Link to="/history" className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          ไปหน้าประวัติ
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className="max-w-2xl mx-auto space-y-6 print:max-w-full">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/history" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          ประวัติคำสั่งซื้อ
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          พิมพ์ใบเสร็จ
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 pb-5 border-b border-gray-50">
          <div>
            <p className="text-xs text-gray-400 mb-1">เลขที่คำสั่งซื้อ</p>
            <p className="font-mono text-sm font-semibold text-gray-700">{order.id}</p>
            <p className="mt-1 text-xs text-gray-400">
              {new Date(order.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* Shipping address */}
        {(order.shipping_name || order.shipping_address) && (
          <div className="mt-5 rounded-xl bg-gray-50 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> ที่อยู่จัดส่ง
            </p>
            {order.shipping_name && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="font-medium">{order.shipping_name}</span>
              </div>
            )}
            {order.shipping_phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>{order.shipping_phone}</span>
              </div>
            )}
            {order.shipping_address && (
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{order.shipping_address}</span>
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="mt-5 space-y-4">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              {item.products?.image_url && (
                <img
                  src={item.products.image_url}
                  alt={item.products.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.products?.name}</p>
                <p className="text-sm text-gray-400">{item.quantity} x ฿{Number(item.price_at_time).toLocaleString()}</p>
              </div>
              <p className="font-semibold text-gray-900">
                ฿{(item.quantity * item.price_at_time).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-5 pt-5 border-t border-gray-50 flex items-center justify-between">
          <p className="font-medium text-gray-600">ยอดรวมทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-900">฿{Number(order.total_amount).toLocaleString()}</p>
        </div>

        {/* Payment QR */}
        {order.status === 'pending' && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center print:hidden">
            <QrCode className="h-24 w-24 text-gray-300" />
            <div>
              <p className="text-sm font-semibold text-gray-900">ชำระเงินผ่าน PromptPay</p>
              <p className="mt-1 text-xs text-gray-400">QR นี้เป็นตัวอย่างสำหรับสาธิตระบบ รอแอดมินตรวจสอบยอดโอนและเปลี่ยนสถานะ</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
