import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl || 'https://placeholder-url.supabase.co', supabaseAnonKey || 'placeholder-key');

/**
 * Validates the Supabase connection by fetching the user session or checking status.
 */
export const verifySupabaseConnection = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase Environment Variables.");
    }
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { success: true, message: "Supabase connection verified." };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to connect to Supabase." };
  }
};
