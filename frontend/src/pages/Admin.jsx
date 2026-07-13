import { useState, useEffect } from 'react';
import { BarChart3, Users, Package, ShoppingBag, Lock, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    
    if (session?.user?.id) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      setIsAdmin(data?.role === 'admin');
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-20">กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
          <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold">สงวนสิทธิ์เฉพาะผู้ดูแลระบบ</h1>
          <p className="text-gray-500 mt-2 mb-6">กรุณาเข้าสู่ระบบผ่านปุ่มมุมขวาบน</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
          <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-500 mt-2">บัญชีของคุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
        </div>
      </div>
    );
  }

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
            <p className="text-2xl font-bold">฿0</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-green-100 text-green-600 p-4 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">คำสั่งซื้อ</p>
            <p className="text-2xl font-bold">0 รายการ</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="bg-purple-100 text-purple-600 p-4 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">สมาชิกรวม</p>
            <p className="text-2xl font-bold">0 คน</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-600" />
          สถิติเซ็ตคอมพิวเตอร์ที่ขายดีที่สุด
        </h2>
        <div className="h-64 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <p className="text-gray-500">ยังไม่มีข้อมูลสถิติ</p>
        </div>
      </div>
    </div>
  );
}
