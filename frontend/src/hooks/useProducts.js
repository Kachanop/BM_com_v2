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

    console.log("Products:", data);
    console.log("Error:", error);

    if (!error) {
      setProducts(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    reloadProducts();
  }, [reloadProducts]);

  return { products, loading, reloadProducts };
}