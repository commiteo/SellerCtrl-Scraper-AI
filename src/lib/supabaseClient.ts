import { createClient } from '@supabase/supabase-js';

// Use environment variables for sensitive data
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzA3NTAsImV4cCI6MjA2NzAwNjc1MH0.qY4qa352mSJg13QpZ7gKUVLEK-ujLtFMdG44vIPCDIU';

export const supabase = createClient(supabaseUrl, supabaseKey);