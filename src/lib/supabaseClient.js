import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta?.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process?.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project')
  );
};

let clientInstance = null;

export const getSupabaseClient = () => {
  if (clientInstance) return clientInstance;
  if (!isSupabaseConfigured()) return null;

  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return clientInstance;
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    return null;
  }
};

export const supabase = getSupabaseClient();
export default supabase;
