import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const reloadProducts = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id");

    if (!error) {
      setProducts(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    reloadProducts();
  }, [reloadProducts]);

  const addProduct = useCallback(async ({ name, price, description, image_url }) => {
    const { error } = await supabase
      .from("products")
      .insert({ name, price, description, image_url });

    if (!error) {
      await reloadProducts();
    }

    return { error };
  }, [reloadProducts]);

  const deleteProduct = useCallback(async (id) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (!error) {
      await reloadProducts();
    }

    return { error };
  }, [reloadProducts]);

  return { products, loading, reloadProducts, addProduct, deleteProduct };
}