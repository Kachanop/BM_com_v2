import { Clock, CheckCircle } from 'lucide-react';

export default function History() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold border-b border-gray-200 dark:border-gray-700 pb-4">ประวัติการสั่งซื้อของคุณ</h1>
      
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>สั่งซื้อเมื่อ: 9 ก.ค. 2026, 14:30 น.</span>
            </div>
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full font-medium text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>ชำระเงินแล้ว (เตรียมจัดส่ง)</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <img src="https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=150&q=80" alt="PC" className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-bold text-lg">เซ็ตสุดคุ้ม Beginner</h3>
              <p className="text-gray-500 text-sm">รหัสคำสั่งซื้อ: #ORD-20260709-001</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-xl text-gray-900 dark:text-white">฿15,900</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
