import { createClient } from '@supabase/supabase-js';

// Kunci koneksi diambil dari file .env (tidak ikut ke GitHub).
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
