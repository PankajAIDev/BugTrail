export type Language = 'c' | 'python';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type BugCategory =
  | 'Pointers & Memory'
  | 'Boundary & Indexing'
  | 'Operator Precedence'
  | 'Conditional & Logic'
  | 'Format Specifiers'
  | 'Function Return & Stack'
  | 'Indentation & Scope'
  | 'Sequence Indexing'
  | 'Mutable Defaults'
  | 'Collection Mutation'
  | 'Identity vs Equality'
  | 'Exception Handling';

export interface Option {
  id: string; // e.g. 'opt-a', 'opt-b', 'opt-c', 'opt-d'
  text: string;
  explanation: string;
}

export interface Hint {
  level: 1 | 2 | 3;
  title: string;
  content: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  language: Language;
  difficulty: Difficulty;
  category: BugCategory;
  faultyCode: string;
  options: Option[];
  correctOptionId: string;
  hints: [Hint, Hint, Hint];
  correctedCode: string;
  rootCause: string;
  expectedBehavior: string;
  xpReward: number;
  highlightLines?: number[];
  bugLine?: number;
}

export interface ChallengeAttempt {
  totalAttempts: number;
  isCorrect: boolean;
  timestamp: number;
  selectedOptionId?: string;
}

export interface UserProgress {
  totalXp: number;
  completedChallengeIds: string[];
  attempts: Record<string, ChallengeAttempt>;
  hintsRevealed: Record<string, number>; // challengeId -> hint count revealed (0-3)
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  activeHistory: string[]; // Set of YYYY-MM-DD dates with user activity
}

export interface FilterState {
  language: 'all' | Language;
  difficulty: 'all' | Difficulty;
  category: 'all' | string;
  search: string;
}

export interface AiExplanationPayload {
  challengeId: string;
  language: Language;
  title: string;
  faultyCode: string;
  correctedCode: string;
  rootCause: string;
  userQuestion?: string;
}

export interface AiExplanationResponse {
  success: boolean;
  explanation?: string;
  tutorTip?: string;
  sampleFixSnippet?: string;
  error?: string;
  isAiGenerated: boolean;
}

// ==========================================
// CODE SCANNER TYPES
// ==========================================
export type FindingSeverity = 'Error' | 'Warning' | 'Suggestion';

export interface ScanFinding {
  id: string;
  summary: string;
  severity: FindingSeverity;
  bugCategory: string;
  lineNumber: number | null; // 1-indexed, null if uncertain
  lineRange: string | null; // e.g. "8-10" or "8"
  originalCodeExcerpt: string;
  explanation: string;
  correctedCode: string;
  whyFixWorks: string;
  confidenceLevel: string; // estimated confidence e.g. "95% (High Estimate)"
}

export interface ScanRequestPayload {
  language: Language;
  code: string;
  expectedBehavior?: string;
}

export interface ScanResponse {
  success: boolean;
  findings: ScanFinding[];
  summaryMessage: string;
  hasBugs: boolean;
  isAiGenerated: boolean;
  error?: string;
}
