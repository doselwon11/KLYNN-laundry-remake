import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

console.log("URL:", process.env.EXPO_PUBLIC_SUPABASE_URL)
console.log("KEY:", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 12) + "…")

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
