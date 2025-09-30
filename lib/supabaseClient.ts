
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
        // FIX: Simplified Insert/Update types to Partial<Realtor> to work around a complex 
        // type inference issue in the Supabase client that was causing method parameters 
        // to be incorrectly inferred as 'never'.
        Insert: Partial<Realtor>;
        Update: Partial<Realtor>;
      };
      realtor_activities: {
          Row: RealtorActivity;
          // FIX: Simplified Insert/Update types to Partial<RealtorActivity> to fix 'never' type errors.
          Insert: Partial<RealtorActivity>;
          Update: Partial<RealtorActivity>;
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