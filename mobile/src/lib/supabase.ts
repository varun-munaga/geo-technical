import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPABASE_URL = 'https://ribvbiqqbbhiibzcwcag.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpYnZiaXFxYmJoaWliemN3Y2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTA2MzYsImV4cCI6MjA4ODcyNjYzNn0.AWtid5kDDdn2yDEQIfSZFgowOTNaLe3NqrbUNrYYtOE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

