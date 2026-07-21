import { useState, useEffect, useCallback } from 'react';
import { loadProductsFromStorage } from '../data/products';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const reloadProducts = useCallback(() => {
    console.log('useProducts: reloading products...');
    try {
      const loadedProducts = loadProductsFromStorage();
      console.log('useProducts: loaded', loadedProducts.length, 'products');
      setProducts(loadedProducts);
    } catch (error) {
      console.error('useProducts: error loading products', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial load
    reloadProducts();

    // Listen for storage changes from same tab (using custom event)
    const handleProductsUpdate = () => {
      console.log('useProducts: event listener triggered');
      reloadProducts();
    };

    // Also listen for storage changes from other tabs
    const handleStorageChange = (event) => {
      if (event.key === 'bm_recommended_products') {
        console.log('useProducts: storage change detected');
        reloadProducts();
      }
    };

    window.addEventListener('bm-products-updated', handleProductsUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('bm-products-updated', handleProductsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [reloadProducts]);

  return { products, loading, reloadProducts };
}
