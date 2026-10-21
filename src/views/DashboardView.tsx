import React from 'react';
import { Play, ArrowRight, CheckCircle2, Code2, Award, Target, Flame, Sparkles, Clock, ChevronRight, Zap, Bug, BookOpen } from 'lucide-react';
import { Challenge, ChallengeAttempt } from '../types';
import { LevelInfo } from '../utils/storage';
import { CHALLENGES } from '../data/challenges';

interface DashboardViewProps {
  totalXp: number;
  completedIds: string[];
  streakDays: number;
  accuracyPercent: number;
  levelInfo: LevelInfo;
  attempts?: Record<string, ChallengeAttempt>;
  onSelectChallenge: (challengeId: string) => void;
  onNavigateToLibrary: () => void;
  onNavigateToScanner?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  totalXp,
  completedIds,
  streakDays,
  accuracyPercent,
  levelInfo,
  attempts = {},
  onSelectChallenge,
  onNavigateToLibrary,
  onNavigateToScanner
}) => {
  // Find next uncompleted challenge or first challenge
  const nextChallenge =
    CHALLENGES.find((c) => !completedIds.includes(c.id)) || CHALLENGES[0];

  // Language breakdown
  const cChallenges = CHALLENGES.filter((c) => c.language === 'c');
  const pyChallenges = CHALLENGES.filter((c) => c.language === 'python');
  const cSolved = cChallenges.filter((c) => completedIds.includes(c.id)).length;
  const pySolved = pyChallenges.filter((c) => completedIds.includes(c.id)).length;

  // Recent activity list
  const recentAttempts = Object.entries(attempts)
    .map(([id, att]) => {
      const challenge = CHALLENGES.find((c) => c.id === id);
      return { challenge, ...att };
    })
    .filter((item): item is { challenge: Challenge } & ChallengeAttempt => Boolean(item.challenge))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Hero Welcome Banner */}
      <div className="card-brutal bg-white p-6 sm:p-8 relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-[#E5E0FA] border-2 border-[#2F2E33] rounded-full text-xs font-extrabold text-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]">
              Level {levelInfo.levelNumber}: {levelInfo.title}
            </span>
            <span className="px-3 py-1 bg-[#9AF7A0] border-2 border-[#2F2E33] rounded-full text-xs font-mono font-extrabold text-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]">
              {totalXp} XP
            </span>
            <span className="px-3 py-1 bg-[#FFB8B0] border-2 border-[#2F2E33] rounded-full text-xs font-extrabold text-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-[#2F2E33]" />
              <span>{streakDays} Day Streak</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#2F2E33] leading-tight">
            Welcome Back to Your Debugging Workbench
          </h1>

          <p className="text-sm font-bold text-[#858B98] leading-relaxed max-w-2xl">
            Diagnose real runtime crashes, fix memory pointer defects, and sharpen your CS engineering intuition.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectChallenge(nextChallenge.id)}
              className="btn-primary text-sm py-3 px-5 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Continue: {nextChallenge.title}</span>
            </button>

            <button
              onClick={onNavigateToLibrary}
              className="btn-secondary text-sm py-3 px-5 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse All Challenges</span>
            </button>

            {onNavigateToScanner && (
              <button
                onClick={onNavigateToScanner}
                className="px-4 py-3 text-sm font-extrabold text-[#2F2E33] bg-[#E5E0FA] border-2 border-[#2F2E33] rounded-xl shadow-[3px_3px_0px_#2F2E33] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
              >
                <Code2 className="w-4 h-4" />
                <span>Code Scanner</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Core Stats Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1: Total XP */}
        <div className="card-brutal p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#858B98] text-xs font-extrabold uppercase">
            <span>XP Score</span>
            <Award className="w-4 h-4 text-[#24C566]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold font-mono text-[#2F2E33]">{totalXp} XP</div>
            <div className="text-[11px] font-bold text-[#858B98] mt-0.5">
              Level {levelInfo.levelNumber}: {levelInfo.title}
            </div>
          </div>
          <div className="w-full bg-[#E4E1DF] h-2.5 border-2 border-[#2F2E33] rounded-full mt-3 overflow-hidden p-0.5">
            <div
              className="bg-[#24C566] h-full rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Completed Challenges */}
        <div className="card-brutal p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#858B98] text-xs font-extrabold uppercase">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[#24C566]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold font-mono text-[#2F2E33]">
              {completedIds.length} <span className="text-sm text-[#858B98]">/ {CHALLENGES.length}</span>
            </div>
            <div className="text-[11px] font-bold text-[#858B98] mt-0.5">
              {Math.round((completedIds.length / CHALLENGES.length) * 100)}% Complete
            </div>
          </div>
          <div className="w-full bg-[#E4E1DF] h-2.5 border-2 border-[#2F2E33] rounded-full mt-3 overflow-hidden p-0.5">
            <div
              className="bg-[#9AF7A0] h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedIds.length / CHALLENGES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Accuracy */}
        <div className="card-brutal p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#858B98] text-xs font-extrabold uppercase">
            <span>Accuracy</span>
            <Target className="w-4 h-4 text-[#2F2E33]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold font-mono text-[#2F2E33]">{accuracyPercent}%</div>
            <div className="text-[11px] font-bold text-[#858B98] mt-0.5">
              Submission Accuracy Ratio
            </div>
          </div>
          <div className="w-full bg-[#E4E1DF] h-2.5 border-2 border-[#2F2E33] rounded-full mt-3 overflow-hidden p-0.5">
            <div
              className="bg-[#ADDCE8] h-full rounded-full transition-all duration-500"
              style={{ width: `${accuracyPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Daily Streak */}
        <div className="card-brutal p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#858B98] text-xs font-extrabold uppercase">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-[#2F2E33]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold font-mono text-[#2F2E33]">{streakDays} Days</div>
            <div className="text-[11px] font-bold text-[#858B98] mt-0.5">
              {streakDays > 0 ? 'Active Learning Streak' : 'Solve a challenge today'}
            </div>
          </div>
          <div className="w-full bg-[#E4E1DF] h-2.5 border-2 border-[#2F2E33] rounded-full mt-3 overflow-hidden p-0.5">
            <div
              className="bg-[#FFB8B0] h-full rounded-full transition-all duration-500"
              style={{ width: streakDays > 0 ? '100%' : '10%' }}
            />
          </div>
        </div>

      </div>

      {/* Spotlight Recommended Challenge & Language Tracks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Recommended Challenge Card */}
        <div className="lg:col-span-8 card-brutal p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
              <span className="px-2.5 py-0.5 bg-[#9AF7A0] border-2 border-[#2F2E33] rounded-lg">
                Recommended
              </span>
              <span className="px-2.5 py-0.5 bg-[#E5E0FA] border-2 border-[#2F2E33] rounded-lg font-mono uppercase">
                {nextChallenge.language}
              </span>
              <span className="px-2.5 py-0.5 bg-[#FFB8B0] border-2 border-[#2F2E33] rounded-lg">
                {nextChallenge.difficulty}
              </span>
              <span className="font-mono font-extrabold text-[#2F2E33]">
                +{nextChallenge.xpReward} XP
              </span>
            </div>

            <h3 className="text-xl font-extrabold font-display text-[#2F2E33]">
              {nextChallenge.title}
            </h3>

            <p className="text-xs font-bold text-[#858B98] leading-relaxed">
              {nextChallenge.description}
            </p>

            {/* Code Snippet Box */}
            <div className="p-3.5 bg-[#2F2E33] text-white border-2 border-[#2F2E33] rounded-xl font-mono text-xs overflow-hidden line-clamp-3">
              {nextChallenge.faultyCode}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t-2 border-[#E4E1DF]">
            <span className="text-xs font-mono font-extrabold text-[#858B98]">
              Topic: {nextChallenge.category}
            </span>
            <button
              onClick={() => onSelectChallenge(nextChallenge.id)}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
            >
              <span>Debug Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Language Tracks */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          
          {/* C Track */}
          <div className="card-brutal-coral p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold font-display text-[#2F2E33]">C Language Track</h4>
                <p className="text-xs font-bold text-[#2F2E33]/80">Pointers, Memory & Scans</p>
              </div>
              <span className="font-mono font-extrabold text-[#2F2E33] text-sm">
                {cSolved}/{cChallenges.length}
              </span>
            </div>
            <div className="w-full bg-white border-2 border-[#2F2E33] h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-[#2F2E33] h-full rounded-full transition-all duration-500"
                style={{ width: `${(cSolved / cChallenges.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Python Track */}
          <div className="card-brutal-mint p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold font-display text-[#2F2E33]">Python Track</h4>
                <p className="text-xs font-bold text-[#2F2E33]/80">Scope, Mutation & Logic</p>
              </div>
              <span className="font-mono font-extrabold text-[#2F2E33] text-sm">
                {pySolved}/{pyChallenges.length}
              </span>
            </div>
            <div className="w-full bg-white border-2 border-[#2F2E33] h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-[#2F2E33] h-full rounded-full transition-all duration-500"
                style={{ width: `${(pySolved / pyChallenges.length) * 100}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Recent Activity Section */}
      {recentAttempts.length > 0 && (
        <div className="card-brutal p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold font-display uppercase tracking-wider text-[#2F2E33] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2F2E33]" />
              <span>Recent Activity</span>
            </h2>
            <button
              onClick={onNavigateToLibrary}
              className="text-xs font-extrabold text-[#2F2E33] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentAttempts.map((item) => (
              <div
                key={item.challenge.id}
                onClick={() => onSelectChallenge(item.challenge.id)}
                className="p-4 bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl shadow-[2px_2px_0px_#2F2E33] hover:-translate-y-0.5 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-mono font-extrabold">
                  <span className="uppercase text-[#2F2E33]">{item.challenge.language}</span>
                  {item.isCorrect ? (
                    <span className="text-[#24C566] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Solved</span>
                    </span>
                  ) : (
                    <span className="text-[#858B98]">In Progress</span>
                  )}
                </div>
                <h4 className="text-sm font-extrabold text-[#2F2E33] truncate">
                  {item.challenge.title}
                </h4>
                <div className="text-[11px] font-bold text-[#858B98]">
                  {item.totalAttempts} submission{item.totalAttempts === 1 ? '' : 's'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
