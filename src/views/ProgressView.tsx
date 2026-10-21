import React, { useState } from 'react';
import { Award, Target, Flame, CheckCircle2, RotateCcw, AlertTriangle, Code2, BarChart2, ExternalLink, Zap } from 'lucide-react';
import { UserProgress } from '../types';
import { LevelInfo } from '../utils/storage';
import { CHALLENGES, ALL_CATEGORIES } from '../data/challenges';
import { ResetModal } from '../components/ResetModal';

interface ProgressViewProps {
  progress: UserProgress;
  levelInfo: LevelInfo;
  accuracyPercent: number;
  onResetProgress: () => void;
  onSelectChallenge: (id: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progress,
  levelInfo,
  accuracyPercent,
  onResetProgress,
  onSelectChallenge
}) => {
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const cTotal = CHALLENGES.filter((c) => c.language === 'c').length;
  const pyTotal = CHALLENGES.filter((c) => c.language === 'python').length;
  const cSolved = CHALLENGES.filter((c) => c.language === 'c' && progress.completedChallengeIds.includes(c.id)).length;
  const pySolved = CHALLENGES.filter((c) => c.language === 'python' && progress.completedChallengeIds.includes(c.id)).length;

  const categoryStats = ALL_CATEGORIES.map((cat) => {
    const catChallenges = CHALLENGES.filter((c) => c.category === cat);
    const catTotal = catChallenges.length;
    const catSolved = catChallenges.filter((c) => progress.completedChallengeIds.includes(c.id)).length;
    const percent = catTotal > 0 ? Math.round((catSolved / catTotal) * 100) : 0;
    return { category: cat, total: catTotal, solved: catSolved, percent };
  });

  const attemptsList = Object.entries(progress.attempts).map(([challengeId, attempt]) => {
    const challenge = CHALLENGES.find((c) => c.id === challengeId);
    return {
      challengeId,
      challengeTitle: challenge ? challenge.title : challengeId,
      language: challenge ? challenge.language : 'c',
      isCorrect: attempt.isCorrect,
      totalAttempts: attempt.totalAttempts,
      timestamp: attempt.timestamp
    };
  }).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#24C566] border-2 border-[#2F2E33] rounded-full shadow-[2px_2px_0px_#2F2E33] text-xs font-extrabold text-[#2F2E33] mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Real Local Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#2F2E33]">
            Progress & Achievements
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#858B98] mt-1">
            Persisted progress calculated from your verified challenge submissions.
          </p>
        </div>

        <button
          onClick={() => setResetModalOpen(true)}
          className="px-3.5 py-2 text-xs font-extrabold text-[#2F2E33] bg-[#FFB8B0] border-2 border-[#2F2E33] rounded-xl shadow-[2px_2px_0px_#2F2E33] hover:-translate-y-0.5 active:translate-y-0 transition-transform flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Progress</span>
        </button>
      </div>

      {/* Charcoal Milestone Section */}
      <div className="card-brutal-dark p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-[#24C566] text-[#2F2E33] font-mono font-extrabold text-xs rounded-lg border-2 border-[#2F2E33]">
              LEVEL {levelInfo.levelNumber}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-2">
              {levelInfo.title}
            </h2>
          </div>

          <div className="text-right font-mono">
            <div className="text-3xl font-extrabold text-[#24C566]">{progress.totalXp} XP</div>
            <div className="text-xs text-slate-300 font-bold">Total Earned</div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-extrabold text-slate-200">
            <span>Level Progress</span>
            <span>{levelInfo.progressPercent}% to next level</span>
          </div>
          <div className="h-3 bg-slate-800 border-2 border-white rounded-full p-0.5 overflow-hidden">
            <div className="h-full bg-[#24C566] rounded-full" style={{ width: `${levelInfo.progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="card-brutal-mint p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase">
            <span>Solved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono">
            {progress.completedChallengeIds.length}/{CHALLENGES.length}
          </div>
          <div className="text-xs font-bold">
            {Math.round((progress.completedChallengeIds.length / CHALLENGES.length) * 100)}% Complete
          </div>
        </div>

        <div className="card-brutal-blue p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase">
            <span>Accuracy</span>
            <Target className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono">
            {accuracyPercent}%
          </div>
          <div className="text-xs font-bold">
            Diagnosis Ratio
          </div>
        </div>

        <div className="card-brutal-coral p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase">
            <span>Streak</span>
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono">
            {progress.streakDays} Days
          </div>
          <div className="text-xs font-bold">
            {progress.activeHistory.length} Active Days
          </div>
        </div>

        <div className="card-brutal-lavender p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase">
            <span>Level</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono">
            Lvl {levelInfo.levelNumber}
          </div>
          <div className="text-xs font-bold truncate">
            {levelInfo.title}
          </div>
        </div>

      </div>

      {/* Language Track Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="card-brutal-coral p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold font-display">C Language Track</h3>
            <span className="font-mono font-extrabold text-sm">{cSolved}/{cTotal} Solved</span>
          </div>
          <div className="w-full bg-white border-2 border-[#2F2E33] h-3 rounded-full p-0.5 overflow-hidden">
            <div className="bg-[#2F2E33] h-full rounded-full" style={{ width: `${(cSolved / cTotal) * 100}%` }} />
          </div>
        </div>

        <div className="card-brutal-mint p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold font-display">Python 3 Track</h3>
            <span className="font-mono font-extrabold text-sm">{pySolved}/{pyTotal} Solved</span>
          </div>
          <div className="w-full bg-white border-2 border-[#2F2E33] h-3 rounded-full p-0.5 overflow-hidden">
            <div className="bg-[#2F2E33] h-full rounded-full" style={{ width: `${(pySolved / pyTotal) * 100}%` }} />
          </div>
        </div>

      </div>

      {/* Activity Log */}
      <div className="card-brutal p-6 space-y-4">
        <h2 className="text-lg font-extrabold font-display text-[#2F2E33]">
          Activity Log
        </h2>

        {attemptsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold text-[#2F2E33]">
              <thead>
                <tr className="border-b-2 border-[#2F2E33] uppercase text-[10px] font-mono">
                  <th className="py-2.5 px-3">Challenge</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Attempts</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b border-[#2F2E33]/20">
                {attemptsList.map((row) => (
                  <tr key={row.challengeId} className="hover:bg-[#FFF9F4]">
                    <td className="py-3 px-3 font-extrabold">{row.challengeTitle}</td>
                    <td className="py-3 px-3 font-mono uppercase">{row.language}</td>
                    <td className="py-3 px-3">
                      {row.isCorrect ? (
                        <span className="text-[#24C566] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Solved</span>
                        </span>
                      ) : (
                        <span className="text-[#858B98]">In Progress</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">{row.totalAttempts}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectChallenge(row.challengeId)}
                        className="btn-primary text-[10px] !py-1 !px-2.5"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs font-bold text-[#858B98]">
            No activity recorded yet. Complete challenges from the library to build your log!
          </div>
        )}
      </div>

      <ResetModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={onResetProgress}
      />
    </div>
  );
};
