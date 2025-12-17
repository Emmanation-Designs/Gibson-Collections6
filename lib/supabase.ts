import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzyowgewdekfzjlflvzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eW93Z2V3ZGVrZnpqbGZsdnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTIyODEsImV4cCI6MjA4MDkyODI4MX0.ULZy9HIOCFSgHFkxpjwkgm8YDfdxwGVhKsXT3CTHweg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Crucial: Save session to localStorage
    autoRefreshToken: true, // Keep session alive
    detectSessionInUrl: true // Handle OAuth/Email links
  }
});