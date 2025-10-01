


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
        // The Insert type omits database-generated columns.
        // `user_id` is set by the database's `DEFAULT auth.uid()` and should not be sent by the client.
        Insert: Omit<Realtor, 'id' | 'created_at' | 'user_id'>;
        // The 'Update' type is made more specific to exclude non-updatable columns.
        Update: Partial<Omit<Realtor, 'id' | 'created_at' | 'user_id'>>;
      };
      realtor_activities: {
          Row: RealtorActivity;
          // The Insert type omits database-generated columns.
          // `user_id` is set by the database's `DEFAULT auth.uid()` and should not be sent by the client.
          Insert: Omit<RealtorActivity, 'id' | 'created_at' | 'user_id'>;
          // The 'Update' type is made more specific to exclude non-updatable columns.
          // An activity should not be moved between realtors, so realtor_id is also omitted.
          Update: Partial<Omit<RealtorActivity, 'id' | 'created_at' | 'user_id' | 'realtor_id'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    // FIX: Define database enums to ensure correct type inference for Supabase client operations.
    Enums: {
      ai_interest: "Bajo" | "Medio" | "Alto";
      funnel_stage:
        | "Prospect"
        | "Contacted"
        | "Qualified"
        | "Demo/Presentation Agendada"
        | "Propuesta Enviada"
        | "Negociación"
        | "Ganado/Cerrado"
        | "Perdido"
        | "En Nurturing";
      production_level: "$50k-$100k" | "$100k-$250k" | "$250k+";
      team_size: "Individual" | "Equipo Pequeño (2-5)" | "Equipo Grande (6+)";
      tech_adoption: "Bajo" | "Medio" | "Alto";
    };
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

/**
 * Parses a Supabase error object and returns a human-readable string.
 * @param error The error object, which can be of any type.
 * @returns A user-friendly error message string.
 */
export const parseSupabaseError = (error: any): string => {
  // Log the raw error object to the console for detailed debugging
  console.error("Raw Supabase Error:", error);

  // Handle Supabase PostgrestError objects
  if (error && typeof error === 'object' && 'message' in error) {
    let message = String(error.message);
    
    // Check for common constraint violation details
    if (message.includes('violates unique constraint')) {
      if ('details' in error && typeof error.details === 'string' && error.details.includes('already exists')) {
          return `Error de duplicado: ${error.details}`;
      }
      return 'Error: Se ha violado una restricción de valor único. Es posible que el correo electrónico ya esté en uso.';
    }

    if (message.includes('violates not-null constraint')) {
       if ('details' in error && typeof error.details === 'string' && error.details) {
           const columnNameMatch = error.details.match(/column "(\w+)"/);
           if (columnNameMatch && columnNameMatch[1]) {
               return `Error: El campo '${columnNameMatch[1]}' es obligatorio y no puede estar vacío.`;
           }
       }
       return 'Error: Uno de los campos requeridos está vacío.';
    }

    // Append details and hint if they exist for other errors
    if ('details' in error && typeof error.details === 'string' && error.details) {
      message += ` | Detalles: ${error.details}`;
    }
    if ('hint' in error && typeof error.hint === 'string' && error.hint) {
      message += ` | Sugerencia: ${error.hint}`;
    }
    return message;
  }
  
  // Handle standard JavaScript Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback for other types
  try {
    const jsonString = JSON.stringify(error);
    if (jsonString && jsonString !== '{}') {
      return jsonString;
    }
  } catch (e) { /* ignore stringify errors */ }
  
  return 'Ocurrió un error desconocido. Revisa la consola para más detalles.';
};