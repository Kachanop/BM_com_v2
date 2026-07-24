import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ใช้ sessionStorage แทน localStorage ตอน dev เท่านั้น เพื่อให้แต่ละแท็บ/หน้าต่างบน localhost
    // ล็อกอินคนละบัญชีพร้อมกันได้ (sessionStorage แยกต่อแท็บ ไม่ใช้ร่วมกันเหมือน localStorage)
    // โปรดักชันยังใช้ localStorage ตามปกติ เพื่อให้ลูกค้าจริงยังคงล็อกอินค้างไว้ข้ามแท็บ/รีเฟรชได้
    storage: import.meta.env.DEV ? window.sessionStorage : window.localStorage,
  },
});