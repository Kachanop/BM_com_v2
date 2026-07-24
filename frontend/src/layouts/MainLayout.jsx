import { useState, useEffect, useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, Monitor, LogIn, LogOut, User, Menu, X } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import ProfileEditModal from '../components/ProfileEditModal';
import { supabase } from '../lib/supabase';
import { CartContext } from '../lib/CartContext';

export default function MainLayout() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchProfile(session?.user?.id, session?.user);
    });

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-gray-900 hover:text-blue-600 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg tracking-tight">บ้านมีคอม</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                หน้าหลัก
              </Link>
              <Link to="/history" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                ประวัติคำสั่งซื้อ
              </Link>
              {session && isRoleLoaded && isAdmin && (
                <Link to="/admin" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  จัดการระบบ
                </Link>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Link to="/cart" className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-blue-600 rounded-full">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {session ? (
                <div className="hidden md:flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="max-w-[120px] truncate">{userProfile?.full_name || session.user.email}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  เข้าสู่ระบบ
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">หน้าหลัก</Link>
              <Link to="/history" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">ประวัติคำสั่งซื้อ</Link>
              {session && isRoleLoaded && isAdmin && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">จัดการระบบ</Link>
              )}
              <div className="pt-2 border-t border-gray-100">
                {session ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <button type="button" onClick={() => { setIsProfileModalOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      {userProfile?.full_name || session.user.email}
                    </button>
                    <button type="button" onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
                      <LogOut className="w-4 h-4" /> ออกจากระบบ
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                    <LogIn className="w-4 h-4" /> เข้าสู่ระบบ
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Monitor className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">บ้านมีคอม V2</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>รับประกันทุกเซ็ต</span>
              <span>บริการหลังการขาย</span>
              <span>&copy; {new Date().getFullYear()} BM Computer</span>
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
