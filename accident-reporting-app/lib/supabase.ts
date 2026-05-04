import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


async function testConnection() {
  const { data, error } = await supabase
    .from('profiles') // replace with an actual table if you have one
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Connection failed:', error.message);
  } else {
    console.log('✅ Connection successful:', data);
  }
}

testConnection();