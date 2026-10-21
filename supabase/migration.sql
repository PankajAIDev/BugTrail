-- ==============================================================================
-- BugTrail AI — Production Supabase PostgreSQL Database Migration
-- Version: 20261021_01
-- Tables: profiles, user_progress, learning_stats, achievements, learning_activity
-- Security: Row Level Security (RLS) on all tables, Triggers & Trusted Functions
-- ==============================================================================

-- Ensure required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);


-- ==============================================================================
-- 2. LEARNING_STATS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.learning_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  completed_challenges INTEGER NOT NULL DEFAULT 0 CHECK (completed_challenges >= 0),
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.learning_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own stats" ON public.learning_stats;
CREATE POLICY "Users can view their own stats"
  ON public.learning_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own stats" ON public.learning_stats;
CREATE POLICY "Users can insert their own stats"
  ON public.learning_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stats" ON public.learning_stats;
CREATE POLICY "Users can update their own stats"
  ON public.learning_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ==============================================================================
-- 3. USER_PROGRESS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'attempted' CHECK (status IN ('not_started', 'in_progress', 'attempted', 'completed')),
  attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts >= 0),
  hints_revealed INTEGER NOT NULL DEFAULT 0 CHECK (hints_revealed >= 0),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own progress" ON public.user_progress;
CREATE POLICY "Users can delete their own progress"
  ON public.user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ==============================================================================
-- 4. ACHIEVEMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_key)
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own achievements" ON public.achievements;
CREATE POLICY "Users can view their own achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.achievements;
CREATE POLICY "Users can insert their own achievements"
  ON public.achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- ==============================================================================
-- 5. LEARNING_ACTIVITY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.learning_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('challenge_attempt', 'challenge_completed', 'hint_revealed', 'code_scanned', 'tutor_query')),
  challenge_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.learning_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own activity" ON public.learning_activity;
CREATE POLICY "Users can view their own activity"
  ON public.learning_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activity" ON public.learning_activity;
CREATE POLICY "Users can insert their own activity"
  ON public.learning_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- ==============================================================================
-- 6. PERFORMANCE & QUERY INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_challenge ON public.user_progress(user_id, challenge_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_activity_user_id ON public.learning_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_activity_created_at ON public.learning_activity(user_id, created_at DESC);


-- ==============================================================================
-- 7. AUTOMATIC NEW USER INITIALIZATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Safely create initial profile
  INSERT INTO public.profiles (id, display_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1),
      'Developer'
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Safely initialize learning stats
  INSERT INTO public.learning_stats (
    user_id,
    total_xp,
    completed_challenges,
    current_streak,
    longest_streak,
    last_activity_at,
    updated_at
  )
  VALUES (NEW.id, 0, 0, 1, 1, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Prevent signup blockage if trigger encounters transient issue
  RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- 8. TRUSTED SERVER FUNCTION: SECURE CHALLENGE SUBMISSION & XP AWARDING
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.record_challenge_completion(
  p_challenge_id TEXT,
  p_is_correct BOOLEAN,
  p_xp_reward INTEGER,
  p_option_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_existing_status TEXT;
  v_xp_added INTEGER := 0;
  v_already_completed BOOLEAN := FALSE;
  v_new_completed_count INTEGER := 0;
  v_new_total_xp INTEGER := 0;
  v_current_streak INTEGER := 1;
  v_longest_streak INTEGER := 1;
  v_last_activity TIMESTAMPTZ;
  v_streak_incremented BOOLEAN := FALSE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Check existing status
  SELECT status INTO v_existing_status
  FROM public.user_progress
  WHERE user_id = v_user_id AND challenge_id = p_challenge_id;

  IF v_existing_status = 'completed' THEN
    v_already_completed := TRUE;
  END IF;

  -- 2. Upsert user progress record
  IF p_is_correct THEN
    INSERT INTO public.user_progress (user_id, challenge_id, status, attempts, completed_at, updated_at)
    VALUES (v_user_id, p_challenge_id, 'completed', 1, NOW(), NOW())
    ON CONFLICT (user_id, challenge_id) DO UPDATE SET
      status = 'completed',
      attempts = public.user_progress.attempts + 1,
      completed_at = COALESCE(public.user_progress.completed_at, NOW()),
      updated_at = NOW();

    -- Award XP ONLY if not already completed (prevent duplicate XP exploit)
    IF NOT v_already_completed THEN
      v_xp_added := GREATEST(0, LEAST(p_xp_reward, 1000)); -- bounded between 0 and 1000
    END IF;
  ELSE
    INSERT INTO public.user_progress (user_id, challenge_id, status, attempts, updated_at)
    VALUES (v_user_id, p_challenge_id, 'attempted', 1, NOW())
    ON CONFLICT (user_id, challenge_id) DO UPDATE SET
      attempts = public.user_progress.attempts + 1,
      updated_at = NOW();
  END IF;

  -- 3. Update learning stats with atomic calculations
  SELECT last_activity_at, current_streak, longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM public.learning_stats
  WHERE user_id = v_user_id;

  IF v_last_activity IS NULL THEN
    v_current_streak := 1;
    v_longest_streak := 1;
  ELSIF (NOW()::date - v_last_activity::date) = 1 THEN
    v_current_streak := v_current_streak + 1;
    v_streak_incremented := TRUE;
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;
  ELSIF (NOW()::date - v_last_activity::date) > 1 THEN
    v_current_streak := 1;
  END IF;

  INSERT INTO public.learning_stats (
    user_id,
    total_xp,
    completed_challenges,
    current_streak,
    longest_streak,
    last_activity_at,
    updated_at
  )
  VALUES (
    v_user_id,
    v_xp_added,
    CASE WHEN (p_is_correct AND NOT v_already_completed) THEN 1 ELSE 0 END,
    v_current_streak,
    v_longest_streak,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = public.learning_stats.total_xp + v_xp_added,
    completed_challenges = (
      SELECT COUNT(*) FROM public.user_progress WHERE user_id = v_user_id AND status = 'completed'
    ),
    current_streak = v_current_streak,
    longest_streak = GREATEST(public.learning_stats.longest_streak, v_longest_streak),
    last_activity_at = NOW(),
    updated_at = NOW()
  RETURNING total_xp, completed_challenges, current_streak, longest_streak
  INTO v_new_total_xp, v_new_completed_count, v_current_streak, v_longest_streak;

  -- 4. Check and award achievements
  IF p_is_correct AND NOT v_already_completed THEN
    -- First Blood Achievement
    IF v_new_completed_count = 1 THEN
      INSERT INTO public.achievements (user_id, achievement_key, unlocked_at)
      VALUES (v_user_id, 'first_blood', NOW())
      ON CONFLICT (user_id, achievement_key) DO NOTHING;
    END IF;

    -- Master Debugger (5 challenges)
    IF v_new_completed_count >= 5 THEN
      INSERT INTO public.achievements (user_id, achievement_key, unlocked_at)
      VALUES (v_user_id, 'debugger_five', NOW())
      ON CONFLICT (user_id, achievement_key) DO NOTHING;
    END IF;

    -- Streak Master
    IF v_current_streak >= 3 THEN
      INSERT INTO public.achievements (user_id, achievement_key, unlocked_at)
      VALUES (v_user_id, 'streak_three', NOW())
      ON CONFLICT (user_id, achievement_key) DO NOTHING;
    END IF;
  END IF;

  -- 5. Record activity event
  INSERT INTO public.learning_activity (user_id, activity_type, challenge_id, metadata, created_at)
  VALUES (
    v_user_id,
    CASE WHEN p_is_correct THEN 'challenge_completed' ELSE 'challenge_attempt' END,
    p_challenge_id,
    jsonb_build_object(
      'is_correct', p_is_correct,
      'xp_awarded', v_xp_added,
      'option_id', p_option_id
    ),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'xp_added', v_xp_added,
    'already_completed', v_already_completed,
    'total_xp', v_new_total_xp,
    'completed_challenges', v_new_completed_count,
    'current_streak', v_current_streak,
    'longest_streak', v_longest_streak
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.record_challenge_completion(TEXT, BOOLEAN, INTEGER, TEXT) TO authenticated;
