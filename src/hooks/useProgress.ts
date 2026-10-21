import { useState, useEffect, useCallback } from 'react';
import { UserProgress } from '../types';
import {
  loadUserProgress,
  saveUserProgress,
  clearUserProgress,
  calculateStreak,
  formatDate,
  getLevelInfo
} from '../utils/storage';
import { supabase, isSupabaseConfigured, UserProgressRecord, LearningStatsRecord, AchievementRecord, LearningActivityRecord } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface ProgressHookReturn {
  progress: UserProgress;
  levelInfo: ReturnType<typeof getLevelInfo>;
  totalSubmissions: number;
  totalSolved: number;
  accuracyPercent: number;
  isSyncing: boolean;
  syncError: string | null;
  achievements: AchievementRecord[];
  recentActivity: LearningActivityRecord[];
  recordSubmission: (challengeId: string, isCorrect: boolean, optionId: string, xpReward: number) => Promise<void>;
  revealHint: (challengeId: string, currentHintLevel: number) => Promise<void>;
  resetProgress: () => Promise<void>;
  retrySync: () => Promise<void>;
}

export function useProgress(): ProgressHookReturn {
  const { user, isConfigured } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);
  const [recentActivity, setRecentActivity] = useState<LearningActivityRecord[]>([]);

  // Load complete progress from Supabase PostgreSQL
  const fetchSupabaseProgress = useCallback(async (userId: string) => {
    if (!isConfigured || !supabase) return;
    setIsSyncing(true);
    setSyncError(null);

    try {
      // 1. Fetch user progress records
      const { data: progressRows, error: progressErr } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressErr) throw progressErr;

      // 2. Fetch learning stats
      const { data: statsRow, error: statsErr } = await supabase
        .from('learning_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (statsErr) console.warn('Could not retrieve learning stats:', statsErr);

      // 3. Fetch unlocked achievements
      const { data: achievementsRows } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId);

      if (achievementsRows) {
        setAchievements(achievementsRows as AchievementRecord[]);
      }

      // 4. Fetch recent learning activity
      const { data: activityRows } = await supabase
        .from('learning_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(15);

      if (activityRows) {
        setRecentActivity(activityRows as LearningActivityRecord[]);
      }

      const completedChallengeIds: string[] = [];
      const attempts: Record<string, { totalAttempts: number; isCorrect: boolean; timestamp: number }> = {};
      const hintsRevealed: Record<string, number> = {};

      if (progressRows) {
        (progressRows as UserProgressRecord[]).forEach((row) => {
          if (row.status === 'completed') {
            completedChallengeIds.push(row.challenge_id);
          }
          attempts[row.challenge_id] = {
            totalAttempts: row.attempts || 1,
            isCorrect: row.status === 'completed',
            timestamp: new Date(row.updated_at).getTime()
          };
          if (row.hints_revealed) {
            hintsRevealed[row.challenge_id] = row.hints_revealed;
          }
        });
      }

      const totalXp = statsRow?.total_xp ?? 0;
      const streakDays = statsRow?.current_streak ?? 1;
      const lastActiveDate = statsRow?.last_activity_at ? formatDate(new Date(statsRow.last_activity_at)) : '';

      const loadedState: UserProgress = {
        totalXp,
        completedChallengeIds,
        attempts,
        hintsRevealed,
        streakDays,
        lastActiveDate,
        activeHistory: lastActiveDate ? [lastActiveDate] : []
      };

      setProgress(loadedState);
      saveUserProgress(loadedState);
    } catch (err: any) {
      console.warn('Failed loading Supabase PostgreSQL progress:', err);
      setSyncError('Could not sync with Supabase PostgreSQL. Using local cached data.');
    } finally {
      setIsSyncing(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    if (user && isConfigured) {
      fetchSupabaseProgress(user.id);
    }
  }, [user, isConfigured, fetchSupabaseProgress]);

  // Sync state to localStorage cache
  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  // Record challenge answer submission
  const recordSubmission = useCallback(
    async (
      challengeId: string,
      isCorrect: boolean,
      optionId: string,
      xpReward: number
    ) => {
      const today = formatDate(new Date());

      // Update in-memory state optimistically
      let updatedState: UserProgress = { ...progress };

      setProgress((prev) => {
        const isAlreadyCompleted = prev.completedChallengeIds.includes(challengeId);
        const prevAttempt = prev.attempts[challengeId] || {
          totalAttempts: 0,
          isCorrect: false,
          timestamp: Date.now()
        };

        const updatedAttempts = {
          ...prev.attempts,
          [challengeId]: {
            totalAttempts: prevAttempt.totalAttempts + 1,
            isCorrect: prevAttempt.isCorrect || isCorrect,
            timestamp: Date.now(),
            selectedOptionId: optionId
          }
        };

        const xpToAdd = isCorrect && !isAlreadyCompleted ? xpReward : 0;
        const newTotalXp = prev.totalXp + xpToAdd;

        const newCompleted =
          isCorrect && !isAlreadyCompleted
            ? [...prev.completedChallengeIds, challengeId]
            : prev.completedChallengeIds;

        const activeHistorySet = new Set(prev.activeHistory);
        activeHistorySet.add(today);
        const updatedHistory = Array.from(activeHistorySet);
        const newStreak = calculateStreak(updatedHistory, today);

        updatedState = {
          ...prev,
          totalXp: newTotalXp,
          completedChallengeIds: newCompleted,
          attempts: updatedAttempts,
          streakDays: newStreak,
          lastActiveDate: today,
          activeHistory: updatedHistory
        };

        return updatedState;
      });

      // Synchronize with Supabase PostgreSQL if authenticated
      if (user && isConfigured && supabase) {
        setIsSyncing(true);
        setSyncError(null);

        try {
          // Attempt trusted server-side RPC function
          const { data: rpcData, error: rpcErr } = await supabase.rpc('record_challenge_completion', {
            p_challenge_id: challengeId,
            p_is_correct: isCorrect,
            p_xp_reward: xpReward,
            p_option_id: optionId
          });

          if (rpcErr) {
            console.warn('RPC record_challenge_completion failed, falling back to direct table write:', rpcErr);
            
            // Direct table write fallback with Row Level Security check
            await supabase.from('user_progress').upsert({
              user_id: user.id,
              challenge_id: challengeId,
              status: isCorrect ? 'completed' : 'attempted',
              attempts: (progress.attempts[challengeId]?.totalAttempts || 0) + 1,
              completed_at: isCorrect ? new Date().toISOString() : null,
              updated_at: new Date().toISOString()
            });

            await supabase.from('learning_stats').upsert({
              user_id: user.id,
              total_xp: updatedState.totalXp,
              completed_challenges: updatedState.completedChallengeIds.length,
              current_streak: updatedState.streakDays,
              longest_streak: updatedState.streakDays,
              last_activity_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

            await supabase.from('learning_activity').insert({
              user_id: user.id,
              activity_type: isCorrect ? 'challenge_completed' : 'challenge_attempt',
              challenge_id: challengeId,
              metadata: { is_correct: isCorrect, xp_awarded: isCorrect ? xpReward : 0, option_id: optionId }
            });
          } else if (rpcData) {
            // Update stats from authoritative PostgreSQL server calculation
            if (rpcData.total_xp !== undefined) {
              setProgress((p) => ({
                ...p,
                totalXp: rpcData.total_xp,
                streakDays: rpcData.current_streak || p.streakDays
              }));
            }
          }
        } catch (err: any) {
          console.error('Remote save to Supabase PostgreSQL failed:', err);
          setSyncError('Database sync failed. Submission saved locally.');
        } finally {
          setIsSyncing(false);
        }
      }
    },
    [progress, user, isConfigured]
  );

  // Reveal a hint
  const revealHint = useCallback(
    async (challengeId: string, currentHintLevel: number) => {
      setProgress((prev) => {
        const existing = prev.hintsRevealed[challengeId] || 0;
        if (currentHintLevel <= existing) return prev;
        return {
          ...prev,
          hintsRevealed: {
            ...prev.hintsRevealed,
            [challengeId]: currentHintLevel
          }
        };
      });

      if (user && isConfigured && supabase) {
        try {
          await supabase.from('user_progress').upsert({
            user_id: user.id,
            challenge_id: challengeId,
            hints_revealed: currentHintLevel,
            updated_at: new Date().toISOString()
          });

          await supabase.from('learning_activity').insert({
            user_id: user.id,
            activity_type: 'hint_revealed',
            challenge_id: challengeId,
            metadata: { hint_level: currentHintLevel }
          });
        } catch (err) {
          console.warn('Failed saving hint state to Supabase:', err);
        }
      }
    },
    [user, isConfigured]
  );

  // Reset progress
  const resetProgress = useCallback(async () => {
    clearUserProgress();
    setProgress({
      totalXp: 0,
      completedChallengeIds: [],
      attempts: {},
      hintsRevealed: {},
      streakDays: 0,
      lastActiveDate: '',
      activeHistory: []
    });
    setAchievements([]);
    setRecentActivity([]);

    if (user && isConfigured && supabase) {
      setIsSyncing(true);
      try {
        await supabase.from('user_progress').delete().eq('user_id', user.id);
        await supabase.from('achievements').delete().eq('user_id', user.id);
        await supabase.from('learning_activity').delete().eq('user_id', user.id);
        await supabase.from('learning_stats').upsert({
          user_id: user.id,
          total_xp: 0,
          completed_challenges: 0,
          current_streak: 0,
          longest_streak: 0,
          last_activity_at: null,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed resetting Supabase progress:', err);
        setSyncError('Failed resetting database records on server.');
      } finally {
        setIsSyncing(false);
      }
    }
  }, [user, isConfigured]);

  const retrySync = useCallback(async () => {
    if (user && isConfigured) {
      await fetchSupabaseProgress(user.id);
    }
  }, [user, isConfigured, fetchSupabaseProgress]);

  const totalSubmissions = Object.values(progress.attempts).reduce(
    (sum, a) => sum + a.totalAttempts,
    0
  );
  const totalSolved = progress.completedChallengeIds.length;

  const accuracyPercent =
    totalSubmissions > 0
      ? Math.min(100, Math.round((totalSolved / totalSubmissions) * 100))
      : 0;

  const levelInfo = getLevelInfo(progress.totalXp);

  return {
    progress,
    levelInfo,
    totalSubmissions,
    totalSolved,
    accuracyPercent,
    isSyncing,
    syncError,
    achievements,
    recentActivity,
    recordSubmission,
    revealHint,
    resetProgress,
    retrySync
  };
}
