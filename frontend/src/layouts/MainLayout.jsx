import { useState, useEffect, useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, Monitor, LogIn, LogOut, User, ShieldCheck, Sparkles, Headphones } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import ProfileEditModal from '../components/ProfileEditModal';
import { supabase } from '../lib/supabase';
import { CartContext } from '../lib/CartContext';

export default function MainLayout() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchProfile(session?.user?.id, session?.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchProfile(session?.user?.id, session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId, authUser = null) => {
    if (!userId) {
      setUserProfile(null);
      setIsRoleLoaded(true);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', userId)
      .maybeSingle();

    console.debug('[MainLayout] fetchProfile fetched:', { userId, data, authUser });

    if (data) {
      setUserProfile(data);
      setIsRoleLoaded(true);
      return;
    }

    if (authUser) {
      setUserProfile({
        full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.fullName || '',
        role: authUser.user_metadata?.role || authUser.app_metadata?.role || '',
      });
    } else {
      setUserProfile(null);
    }

    setIsRoleLoaded(true);
  };

  const { totalItems } = useContext(CartContext);
  const isAdmin = userProfile?.role === 'admin';
  console.debug('[MainLayout] session, userProfile, isAdmin:', { session, userProfile, isAdmin });

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_30%),linear-gradient(180deg,_#f7fbff_0%,_#f1f8ff_100%)] dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-200/70 dark:border-gray-700/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <Monitor className="w-5 h-5" />
                </div>
                <span>บ้านมีคอม V2</span>
              </Link>
            </div>
            <nav className="flex gap-4 sm:gap-6 items-center">
              <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium transition-colors">หน้าหลัก</Link>
              <Link to="/history" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium transition-colors">ประวัติการสั่งซื้อ</Link>
              {session && isRoleLoaded && isAdmin && (
                <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium transition-colors">Admin</Link>
              )}
              
              <Link to="/cart" className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
              {session ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsProfileModalOpen(true)}
                      className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700/80 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="max-w-[120px] truncate">{userProfile?.full_name || session.user.email}</span>
                    </button>
                    {isRoleLoaded && (
                      <button
                        title={userProfile?.role ?? 'unknown'}
                        className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                        onClick={() => setIsProfileModalOpen(true)}
                      >
                        {userProfile?.role ?? '—'}
                      </button>
                    )}
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
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm"
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

      <footer className="bg-white/80 dark:bg-gray-800/80 border-t border-gray-200/70 dark:border-gray-700/70 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} BM Computer (บ้านมีคอม V2)</p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> ประกันและรับประกัน</span>
              <span className="inline-flex items-center gap-2"><Headphones className="w-4 h-4" /> แนะนำและช่วยเหลือ</span>
            </div>
          </div>
        </div>
      </footer>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        session={session}
        userProfile={userProfile}
        onProfileUpdated={(updatedProfile) => setUserProfile(updatedProfile)}
      />
    </div>
  );
}
