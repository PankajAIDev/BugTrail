import { UserProgress } from '../types';

const STORAGE_KEY = 'bugtrail_user_progress_v1';

export const INITIAL_PROGRESS: UserProgress = {
  totalXp: 0,
  completedChallengeIds: [],
  attempts: {},
  hintsRevealed: {},
  streakDays: 0,
  lastActiveDate: '',
  activeHistory: []
};

// Formats a Date object to YYYY-MM-DD
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Safely parses YYYY-MM-DD into local noon date to avoid timezone offset drift
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

// Computes consecutive daily streak from actual stored history dates
export function calculateStreak(activeDates: string[], todayStr: string): number {
  if (!activeDates || activeDates.length === 0) return 0;
  
  const dateSet = new Set(activeDates);
  const today = parseLocalDate(todayStr);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  // If neither today nor yesterday has activity, streak is 0
  let anchorDate: Date;
  if (dateSet.has(todayStr)) {
    anchorDate = today;
  } else if (dateSet.has(yesterdayStr)) {
    anchorDate = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  const testDate = new Date(anchorDate);

  while (true) {
    const curStr = formatDate(testDate);
    if (dateSet.has(curStr)) {
      streak += 1;
      testDate.setDate(testDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_PROGRESS };
    const parsed = JSON.parse(raw);
    
    // Ensure all mandatory fields exist to guard against corrupted or legacy storage
    return {
      totalXp: typeof parsed.totalXp === 'number' ? parsed.totalXp : 0,
      completedChallengeIds: Array.isArray(parsed.completedChallengeIds) ? parsed.completedChallengeIds : [],
      attempts: typeof parsed.attempts === 'object' && parsed.attempts !== null ? parsed.attempts : {},
      hintsRevealed: typeof parsed.hintsRevealed === 'object' && parsed.hintsRevealed !== null ? parsed.hintsRevealed : {},
      streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 0,
      lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : '',
      activeHistory: Array.isArray(parsed.activeHistory) ? parsed.activeHistory : []
    };
  } catch (err) {
    console.error('Failed to parse stored progress, resetting to initial state:', err);
    return { ...INITIAL_PROGRESS };
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progress to localStorage:', err);
  }
}

export function clearUserProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear progress:', err);
  }
}

export interface LevelInfo {
  levelNumber: number;
  title: string;
  minXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

export function getLevelInfo(xp: number): LevelInfo {
  if (xp < 100) {
    return {
      levelNumber: 1,
      title: 'Bug Scout',
      minXp: 0,
      nextLevelXp: 100,
      progressPercent: Math.min(100, Math.round((xp / 100) * 100))
    };
  } else if (xp < 250) {
    return {
      levelNumber: 2,
      title: 'Stack Sleuth',
      minXp: 100,
      nextLevelXp: 250,
      progressPercent: Math.min(100, Math.round(((xp - 100) / 150) * 100))
    };
  } else if (xp < 500) {
    return {
      levelNumber: 3,
      title: 'Memory Tracker',
      minXp: 250,
      nextLevelXp: 500,
      progressPercent: Math.min(100, Math.round(((xp - 250) / 250) * 100))
    };
  } else if (xp < 800) {
    return {
      levelNumber: 4,
      title: 'Kernel Detective',
      minXp: 500,
      nextLevelXp: 800,
      progressPercent: Math.min(100, Math.round(((xp - 500) / 300) * 100))
    };
  } else {
    return {
      levelNumber: 5,
      title: 'BugTrail Master',
      minXp: 800,
      nextLevelXp: 1200,
      progressPercent: 100
    };
  }
}
