import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://xyz.supabase.co' &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

let client: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    client = null;
  }
}

export const supabase = client;

export interface ProfileRecord {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProgressRecord {
  id: string;
  user_id: string;
  challenge_id: string;
  status: 'attempted' | 'completed';
  attempts: number;
  hints_revealed: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningStatsRecord {
  user_id: string;
  total_xp: number;
  streak_days: number;
  completed_challenges: number;
  last_active_date: string | null;
  updated_at: string;
}
