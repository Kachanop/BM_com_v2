import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onClose();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (signUpError) throw signUpError;
        setSuccessMsg('สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลหรือเข้าสู่ระบบได้เลย');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </h2>

          <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${isLogin ? 'bg-white dark:bg-gray-800 shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${!isLogin ? 'bg-white dark:bg-gray-800 shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              สมัครสมาชิกใหม่
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-600 p-3 rounded-lg text-sm text-center">
                {successMsg}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                  placeholder="สมชาย ใจดี"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">อีเมล</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">รหัสผ่าน</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span>กำลังดำเนินการ...</span>
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  เข้าสู่ระบบ
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  สมัครสมาชิก
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
