import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Suppress non-critical Supabase errors in console
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args) {
    // Suppress token grant errors and unprocessable content errors
    const message = args[0]?.toString() || '';
    if (
      message.includes('Failed to load resource') ||
      message.includes('token?grant_type') ||
      message.includes('422') ||
      message.includes('400 (Bad Request)')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

