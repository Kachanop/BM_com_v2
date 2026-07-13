import { useState } from 'react';
import { Trash2, QrCode } from 'lucide-react';

export default function Cart() {
  const [showQr, setShowQr] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold border-b border-gray-200 dark:border-gray-700 pb-4">ตะกร้าสินค้าของคุณ</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-500">ไม่มีสินค้าในตะกร้า</p>
      </div>
    </div>
  );
}
