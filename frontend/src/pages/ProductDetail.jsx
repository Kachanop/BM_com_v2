import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CartContext } from '../lib/CartContext';
import { getCategoryLabel } from '../lib/categories';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (isMounted) {
          setProduct(data ?? null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">กำลังโหลดข้อมูลสินค้า...</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-lg font-semibold text-gray-900">ไม่พบสินค้านี้</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าแรก
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4" />
        กลับหน้าแรก
      </Link>
      <div className="grid gap-8 rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-2">
        <img src={product.image_url} alt={product.name} className="h-80 w-full rounded-2xl object-cover" />
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            {getCategoryLabel(product.category)}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-4 flex-1 text-gray-600">{product.description}</p>
          <p className="mt-6 text-3xl font-bold text-blue-600">฿{Number(product.price).toLocaleString()}</p>
          <button
            type="button"
            onClick={() => addToCart(product)}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <ShoppingCart className="w-4 h-4" />
            หยิบใส่ตะกร้า
          </button>
        </div>
      </div>
    </div>
  );
}
