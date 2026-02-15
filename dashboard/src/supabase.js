import { createClient } from '@supabase/supabase-js'
console.log("ENV URL:", import.meta.env.VITE_SUPABASE_URL)
console.log("ENV KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY)



const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
