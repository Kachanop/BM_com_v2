import { useState } from 'react';
import { Trash2, QrCode } from 'lucide-react';

export default function Cart() {
  const [showQr, setShowQr] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold border-b border-gray-200 dark:border-gray-700 pb-4">ตะกร้าสินค้าของคุณ</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
          <div className="flex items-center gap-4">
            <img src="https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=150&q=80" alt="PC" className="w-20 h-20 object-cover rounded-lg" />
            <div>
              <h3 className="font-bold text-lg">เซ็ตสุดคุ้ม Beginner</h3>
              <p className="text-gray-500 text-sm">จำนวน: 1</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-bold text-xl text-red-600">฿15,900</span>
            <button className="text-gray-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4">
          <span className="text-xl font-bold">ยอดรวมทั้งสิ้น</span>
          <span className="text-3xl font-extrabold text-red-600">฿15,900</span>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button 
          onClick={() => setShowQr(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg"
        >
          <QrCode className="w-5 h-5" />
          ชำระเงินด้วย PromptPay
        </button>
      </div>

      {showQr && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl max-w-sm w-full text-center space-y-6 shadow-2xl">
            <h3 className="text-2xl font-bold">สแกน QR Code เพื่อชำระเงิน</h3>
            <div className="bg-gray-100 p-4 rounded-xl inline-block">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <div className="space-y-2">
              <p className="text-gray-500">ยอดที่ต้องชำระ</p>
              <p className="text-3xl font-extrabold text-red-600">฿15,900</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <p className="text-sm text-gray-500 mb-4">ระบบจะตรวจสอบสลิปอัตโนมัติเมื่อโอนสำเร็จ</p>
              <button 
                onClick={() => setShowQr(false)}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
