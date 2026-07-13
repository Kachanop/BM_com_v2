import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, Monitor, LogIn, LogOut, User } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import { supabase } from '../lib/supabase';

export default function MainLayout() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchProfile(session?.user?.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchProfile(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    if (!userId) {
      setUserProfile(null);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setUserProfile(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-red-600 font-bold text-xl">
                <Monitor className="w-6 h-6" />
                <span>บ้านมีคอม V2</span>
              </Link>
            </div>
            <nav className="flex gap-6 items-center">
              <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-red-600 font-medium">หน้าหลัก</Link>
              <Link to="/history" className="text-gray-600 dark:text-gray-300 hover:text-red-600 font-medium">ประวัติการสั่งซื้อ</Link>
              <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-red-600 font-medium">Admin</Link>
              <Link to="/cart" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-red-600">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">0</span>
              </Link>
              {session ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                    <User className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">{userProfile?.full_name || session.user.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">ออกจากระบบ</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} BM Computer (บ้านมีคอม V2) - คอมพี่ประกอบแล้ว ไม่ใช้จัดสเปคเอง</p>
          </div>
        </div>
      </footer>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
