
import { createClient } from '@supabase/supabase-js';
import { Realtor, RealtorActivity } from '../types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.example';

export type Database = {
  graphql_public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  public: {
    Tables: {
      realtors: {
        Row: Realtor;
        // FIX: Replaced overly permissive Partial<T> with more specific types to fix 'never' inference.
        // Insert should not include database-generated columns.
        Insert: Omit<Realtor, 'id' | 'created_at'>;
        Update: Partial<Omit<Realtor, 'id' | 'created_at'>>;
      };
      realtor_activities: {
          Row: RealtorActivity;
          // FIX: Replaced overly permissive Partial<T> with more specific types to fix 'never' inference.
          Insert: Omit<RealtorActivity, 'id' | 'created_at'>;
          Update: Partial<Omit<RealtorActivity, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  storage: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
  throw new Error("Supabase URL and Anon Key must be provided. Please fill in your credentials in 'config.example.ts'.");
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export { supabase };