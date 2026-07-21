import { useEffect, useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ProfileEditModal({ isOpen, onClose, session, userProfile, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    phone: '',
    payment_method: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        address: userProfile.address || '',
        phone: userProfile.phone || '',
        payment_method: userProfile.payment_method || '',
      });
      setError('');
      setSuccess('');
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: session.user.id,
            full_name: formData.full_name,
            address: formData.address,
            phone: formData.phone,
            payment_method: formData.payment_method,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (updateError) throw updateError;

      onProfileUpdated?.({
        ...userProfile,
        ...formData,
      });
      setSuccess('บันทึกข้อมูลสำเร็จ');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">แก้ไขข้อมูลของคุณ</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-600">{error}</div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-600">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อนามสกุล</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-900"
                placeholder="สมชาย ใจดี"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">ที่อยู่</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-900"
                placeholder="บ้านเลขที่ ซอย ถนน จังหวัด"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">เบอร์โทร</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-900"
                placeholder="0812345678"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">ช่องทางการชำระเงิน</label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="">เลือกช่องทางการชำระเงิน</option>
                <option value="cash">เก็บเงินปลายทาง</option>
                <option value="bank_transfer">โอนผ่านธนาคาร</option>
                <option value="promptpay">พร้อมเพย์</option>
                <option value="qr_code">QR Code</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  บันทึกข้อมูล
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
