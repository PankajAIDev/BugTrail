import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://xyz.supabase.co' &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
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
        detectSessionInUrl: true,
        storageKey: 'bugtrail_supabase_auth_token'
      }
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    client = null;
  }
}

export const supabase = client;

// ==============================================================================
// Schema Type Definitions
// ==============================================================================

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
  status: 'not_started' | 'in_progress' | 'attempted' | 'completed';
  attempts: number;
  hints_revealed: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningStatsRecord {
  user_id: string;
  total_xp: number;
  completed_challenges: number;
  current_streak: number;
  longest_streak: number;
  last_activity_at: string | null;
  updated_at: string;
}

export interface AchievementRecord {
  id: string;
  user_id: string;
  achievement_key: string;
  unlocked_at: string;
}

export interface LearningActivityRecord {
  id: string;
  user_id: string;
  activity_type: 'challenge_attempt' | 'challenge_completed' | 'hint_revealed' | 'code_scanned' | 'tutor_query';
  challenge_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}
