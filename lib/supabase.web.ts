import { createClient } from '@supabase/supabase-js'

// localStorage is built-in on the web
const url = process.env.EXPO_PUBLIC_SUPABASE_URL!
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

console.log("URL:", url)
console.log("KEY:", key?.slice(0, 12) + "…")

export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
