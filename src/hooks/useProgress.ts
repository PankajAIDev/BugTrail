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
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load progress from Firestore when user logs in
  const fetchFirestoreProgress = useCallback(async (userId: string) => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      // Fetch user profile stats
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);

      let totalXp = 0;
      let streakDays = 1;
      let lastActiveDate = '';

      if (userSnap.exists()) {
        const userData = userSnap.data();
        totalXp = userData.totalXp || 0;
        streakDays = userData.streakDays || 1;
        lastActiveDate = userData.updatedAt ? formatDate(new Date(userData.updatedAt)) : '';
      }

      // Fetch progress subcollection
      const progressColRef = collection(db, 'users', userId, 'progress');
      const progressSnap = await getDocs(progressColRef);

      const completedChallengeIds: string[] = [];
      const attempts: Record<string, { totalAttempts: number; isCorrect: boolean; timestamp: number }> = {};
      const hintsRevealed: Record<string, number> = {};

      progressSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const chId = data.challengeId || docSnap.id;

        if (data.status === 'completed') {
          completedChallengeIds.push(chId);
        }
        attempts[chId] = {
          totalAttempts: data.attempts || 1,
          isCorrect: data.status === 'completed',
          timestamp: data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now()
        };
        if (data.hintsRevealed) {
          hintsRevealed[chId] = data.hintsRevealed;
        }
      });

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
      console.warn('Failed loading Firestore progress, using local cache:', err);
      setSyncError('Using local session cache.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.id) {
      fetchFirestoreProgress(user.id);
    }
  }, [user, fetchFirestoreProgress]);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  // Record an answer submission
  const recordSubmission = useCallback(
    async (
      challengeId: string,
      isCorrect: boolean,
      optionId: string,
      xpReward: number
    ) => {
      const today = formatDate(new Date());

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

      // Remote Firestore persistence if user logged in
      if (user && user.id) {
        try {
          const progressDocRef = doc(db, 'users', user.id, 'progress', challengeId);
          await setDoc(progressDocRef, {
            id: challengeId,
            userId: user.id,
            challengeId,
            status: isCorrect ? 'completed' : 'attempted',
            attempts: (progress.attempts[challengeId]?.totalAttempts || 0) + 1,
            hintsRevealed: progress.hintsRevealed[challengeId] || 0,
            completedAt: isCorrect ? new Date().toISOString() : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });

          const userDocRef = doc(db, 'users', user.id);
          await setDoc(userDocRef, {
            totalXp: updatedState.totalXp,
            streakDays: updatedState.streakDays,
            completedChallenges: updatedState.completedChallengeIds.length,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.error('Remote save to Firestore failed:', err);
          setSyncError('Stored locally.');
        }
      }
    },
    [progress, user]
  );

  // Unlock / reveal a hint
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

      if (user && user.id) {
        try {
          const progressDocRef = doc(db, 'users', user.id, 'progress', challengeId);
          await setDoc(progressDocRef, {
            hintsRevealed: currentHintLevel,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn('Failed saving hint state to Firestore:', err);
        }
      }
    },
    [user]
  );

  // Reset all progress
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

    if (user && user.id) {
      try {
        const userDocRef = doc(db, 'users', user.id);
        await setDoc(userDocRef, {
          totalXp: 0,
          streakDays: 0,
          completedChallenges: 0,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error('Failed resetting Firestore progress:', err);
      }
    }
  }, [user]);

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
    recordSubmission,
    revealHint,
    resetProgress
  };
}
