import { Clock, CheckCircle } from 'lucide-react';

export default function History() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold border-b border-gray-200 dark:border-gray-700 pb-4">ประวัติการสั่งซื้อของคุณ</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-500">ยังไม่มีประวัติคำสั่งซื้อ</p>
      </div>
    </div>
  );
}
