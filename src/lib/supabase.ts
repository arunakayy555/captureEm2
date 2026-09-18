import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate if real environment variables are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-public-key'
);

// Fallback dummy URL and key for safe client initialization when variables are pending
const validUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co';
const validKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

/**
 * Singleton Supabase client instance for the browser application
 */
export const supabase: SupabaseClient = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Safely verify the Supabase connection / readiness
 */
export const checkSupabaseConnection = async (): Promise<{
  connected: boolean;
  configured: boolean;
  message: string;
}> => {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      configured: false,
      message: 'Supabase client initialized with placeholder credentials. Configure .env with valid project credentials.',
    };
  }

  try {
    // Ping Supabase auth service to verify reachability without touching tables
    const { error } = await supabase.auth.getSession();
    if (error) {
      return {
        connected: false,
        configured: true,
        message: `Connection error: ${error.message}`,
      };
    }
    return {
      connected: true,
      configured: true,
      message: 'Supabase connection verified successfully.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      configured: true,
      message: `Connection failed: ${errorMsg}`,
    };
  }
};
