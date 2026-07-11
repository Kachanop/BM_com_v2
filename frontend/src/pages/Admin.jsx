import { BarChart3, Users, Package, ShoppingBag } from 'lucide-react';

export default function Admin() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">ยอดขายวันนี้</p>
            <p className="text-2xl font-bold">฿125,400</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-green-100 text-green-600 p-4 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">คำสั่งซื้อ</p>
            <p className="text-2xl font-bold">8 รายการ</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-purple-100 text-purple-600 p-4 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">สมาชิกรวม</p>
            <p className="text-2xl font-bold">1,204 คน</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-600" />
          สถิติเซ็ตคอมพิวเตอร์ที่ขายดีที่สุด
        </h2>
        <div className="h-64 flex items-end justify-around gap-4 pt-8 border-b border-gray-200 dark:border-gray-700">
          <div className="w-1/4 bg-red-200 dark:bg-red-900/40 h-[60%] rounded-t-lg relative group transition-all hover:bg-red-300">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold">35%</div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm whitespace-nowrap text-gray-500">Beginner</div>
          </div>
          <div className="w-1/4 bg-red-400 dark:bg-red-700/60 h-[90%] rounded-t-lg relative group transition-all hover:bg-red-500">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold">55%</div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm whitespace-nowrap text-gray-500">Gamer</div>
          </div>
          <div className="w-1/4 bg-red-100 dark:bg-red-950/40 h-[20%] rounded-t-lg relative group transition-all hover:bg-red-200">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold">10%</div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm whitespace-nowrap text-gray-500">Pro Streamer</div>
          </div>
        </div>
      </div>
    </div>
  );
}
