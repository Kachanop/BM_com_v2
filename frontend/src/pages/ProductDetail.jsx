import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react';
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

    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
        <div className="rounded-2xl border border-gray-100 bg-white p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
              <div className="h-8 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Package className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-lg font-semibold text-gray-900">ไม่พบสินค้านี้</p>
        <p className="mt-1 text-sm text-gray-500">สินค้าอาจถูกลบออกหรือ URL ไม่ถูกต้อง</p>
        <Link to="/" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  const outOfStock = (product.stock ?? null) !== null && product.stock <= 0;
  const lowStock = !outOfStock && product.stock !== null && product.stock !== undefined && product.stock <= 5;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        กลับหน้าหลัก
      </Link>

      <div className="grid gap-8 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 lg:grid-cols-2">
        <div className="relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-80 w-full rounded-xl object-cover"
          />
          {outOfStock && (
            <div className="absolute inset-0 rounded-xl bg-white/60 flex items-center justify-center">
              <span className="rounded-xl bg-gray-900/80 px-5 py-2 text-sm font-bold text-white">สินค้าหมด</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
            {getCategoryLabel(product.category)}
          </span>

          <h1 className="mt-3 text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

          <p className="mt-4 text-gray-600 leading-relaxed flex-1">{product.description}</p>

          {/* Stock status */}
          {product.stock !== null && product.stock !== undefined && (
            <div className="mt-5 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              {outOfStock ? (
                <span className="text-sm font-medium text-red-600">สินค้าหมดสต็อก</span>
              ) : lowStock ? (
                <span className="text-sm font-medium text-amber-600">เหลือสินค้า {product.stock} ชิ้น</span>
              ) : (
                <span className="text-sm font-medium text-emerald-600">มีสินค้าพร้อมส่ง ({product.stock} ชิ้น)</span>
              )}
            </div>
          )}

          <div className="mt-6 flex items-end justify-between gap-4 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">ราคา</p>
              <p className="text-3xl font-bold text-gray-900">฿{Number(product.price).toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={() => !outOfStock && addToCart(product)}
              disabled={outOfStock}
              className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${
                outOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {outOfStock ? 'สินค้าหมด' : 'ใส่ตะกร้า'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
