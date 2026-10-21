-- =======================================================
-- BugTrail AI — Supabase PostgreSQL Database Migration
-- Includes Schema, RLS Security Policies, and Triggers
-- =======================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger function to create profile on signup automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Initialize learning stats
  INSERT INTO public.learning_stats (user_id, total_xp, streak_days, completed_challenges)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. USER_PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'attempted' CHECK (status IN ('attempted', 'completed')),
  attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts >= 0),
  hints_revealed INTEGER NOT NULL DEFAULT 0 CHECK (hints_revealed >= 0),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id)
);

-- Enable RLS on user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User Progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 3. LEARNING_STATS TABLE
CREATE TABLE IF NOT EXISTS public.learning_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  completed_challenges INTEGER NOT NULL DEFAULT 0 CHECK (completed_challenges >= 0),
  last_active_date TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on learning_stats
ALTER TABLE public.learning_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Learning Stats
CREATE POLICY "Users can view their own stats"
  ON public.learning_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON public.learning_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON public.learning_stats FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 4. TRUSTED SERVER FUNCTION FOR SECURE CHALLENGE COMPLETION & XP
-- Prevents users from manually awarding themselves arbitrary XP from browser
CREATE OR REPLACE FUNCTION public.record_challenge_completion(
  p_challenge_id TEXT,
  p_is_correct BOOLEAN,
  p_xp_reward INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_existing_status TEXT;
  v_xp_added INTEGER := 0;
  v_already_completed BOOLEAN := FALSE;
  v_new_completed_count INTEGER;
  v_new_total_xp INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check existing progress
  SELECT status INTO v_existing_status
  FROM public.user_progress
  WHERE user_id = v_user_id AND challenge_id = p_challenge_id;

  IF v_existing_status = 'completed' THEN
    v_already_completed := TRUE;
  END IF;

  -- Insert or update user_progress
  IF p_is_correct THEN
    INSERT INTO public.user_progress (user_id, challenge_id, status, attempts, completed_at, updated_at)
    VALUES (v_user_id, p_challenge_id, 'completed', 1, NOW(), NOW())
    ON CONFLICT (user_id, challenge_id) DO UPDATE SET
      status = 'completed',
      attempts = public.user_progress.attempts + 1,
      completed_at = COALESCE(public.user_progress.completed_at, NOW()),
      updated_at = NOW();

    -- Award XP ONLY if not already completed
    IF NOT v_already_completed THEN
      v_xp_added := GREATEST(0, p_xp_reward);
    END IF;
  ELSE
    INSERT INTO public.user_progress (user_id, challenge_id, status, attempts, updated_at)
    VALUES (v_user_id, p_challenge_id, 'attempted', 1, NOW())
    ON CONFLICT (user_id, challenge_id) DO UPDATE SET
      attempts = public.user_progress.attempts + 1,
      updated_at = NOW();
  END IF;

  -- Update learning_stats
  INSERT INTO public.learning_stats (user_id, total_xp, completed_challenges, updated_at)
  VALUES (
    v_user_id,
    v_xp_added,
    CASE WHEN (p_is_correct AND NOT v_already_completed) THEN 1 ELSE 0 END,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = public.learning_stats.total_xp + v_xp_added,
    completed_challenges = (
      SELECT COUNT(*) FROM public.user_progress WHERE user_id = v_user_id AND status = 'completed'
    ),
    updated_at = NOW()
  RETURNING total_xp, completed_challenges INTO v_new_total_xp, v_new_completed_count;

  RETURN jsonb_build_object(
    'success', true,
    'xp_added', v_xp_added,
    'already_completed', v_already_completed,
    'total_xp', v_new_total_xp,
    'completed_challenges', v_new_completed_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.record_challenge_completion(TEXT, BOOLEAN, INTEGER) TO authenticated;

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_challenge ON public.user_progress(user_id, challenge_id);
