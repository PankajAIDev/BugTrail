import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Check,
  Eye,
  RefreshCw,
  Award,
  Sparkles,
  Info,
  Bug
} from 'lucide-react';
import { Challenge } from '../types';
import { CHALLENGES } from '../data/challenges';
import { CodeViewer } from '../components/CodeViewer';
import { HintDrawer } from '../components/HintDrawer';
import { AiTutorDrawer } from '../components/AiTutorDrawer';

interface WorkspaceViewProps {
  challengeId: string;
  isCompleted: boolean;
  hintsRevealedCount: number;
  onNavigateToLibrary: () => void;
  onSelectChallenge: (id: string) => void;
  onRecordSubmission: (
    challengeId: string,
    isCorrect: boolean,
    optionId: string,
    xpReward: number
  ) => void;
  onRevealHint: (challengeId: string, level: number) => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  challengeId,
  isCompleted,
  hintsRevealedCount,
  onNavigateToLibrary,
  onSelectChallenge,
  onRecordSubmission,
  onRevealHint
}) => {
  const challenge = CHALLENGES.find((c) => c.id === challengeId) || CHALLENGES[0];

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'correct' | 'incorrect'
  >(isCompleted ? 'correct' : 'idle');
  const [isSolutionRevealed, setIsSolutionRevealed] = useState(isCompleted);

  React.useEffect(() => {
    setSelectedOptionId(null);
    setSubmissionStatus(isCompleted ? 'correct' : 'idle');
    setIsSolutionRevealed(isCompleted);
  }, [challengeId, isCompleted]);

  const currentIndex = CHALLENGES.findIndex((c) => c.id === challenge.id);
  const nextChallenge =
    currentIndex < CHALLENGES.length - 1 ? CHALLENGES[currentIndex + 1] : null;

  const handleSubmitAnswer = () => {
    if (!selectedOptionId) return;

    const isCorrect = selectedOptionId === challenge.correctOptionId;
    setSubmissionStatus(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setIsSolutionRevealed(true);
    }

    onRecordSubmission(challenge.id, isCorrect, selectedOptionId, challenge.xpReward);
  };

  const handleRetry = () => {
    setSelectedOptionId(null);
    setSubmissionStatus('idle');
  };

  const handleRevealSolution = () => {
    setIsSolutionRevealed(true);
  };

  const handleUnlockNextHint = () => {
    const nextLevel = Math.min(3, hintsRevealedCount + 1);
    onRevealHint(challenge.id, nextLevel);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="card-brutal p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <button
            onClick={onNavigateToLibrary}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2F2E33] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Challenge Catalog</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#2F2E33]">
              {challenge.title}
            </h1>
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs font-extrabold text-[#2F2E33] bg-[#9AF7A0] border-2 border-[#2F2E33] px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_#2F2E33]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Solved</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-extrabold text-[#2F2E33]">
            <span className={`px-2 py-0.5 rounded border-2 border-[#2F2E33] uppercase ${challenge.language === 'c' ? 'bg-[#FFB8B0]' : 'bg-[#9AF7A0]'}`}>
              {challenge.language}
            </span>
            <span className="px-2 py-0.5 rounded border-2 border-[#2F2E33] bg-[#E5E0FA]">
              {challenge.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded border-2 border-[#2F2E33] bg-[#ADDCE8]">
              {challenge.category}
            </span>
            <span className="px-2 py-0.5 rounded border-2 border-[#2F2E33] bg-[#24C566]">
              +{challenge.xpReward} XP
            </span>
          </div>
        </div>

        {nextChallenge && (
          <button
            onClick={() => onSelectChallenge(nextChallenge.id)}
            className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5 shrink-0"
          >
            <span>Next Scenario</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Main Split Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Task Info & Code Viewer */}
        <div className="lg:col-span-7 space-y-4 w-full min-w-0">
          
          <div className="card-brutal p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#2F2E33] uppercase">
              <Info className="w-4 h-4 text-[#24C566]" />
              <span>Objective</span>
            </div>
            <p className="text-xs font-bold text-[#2F2E33] leading-relaxed">
              {challenge.description}
            </p>
          </div>

          <div className="min-h-[380px] w-full min-w-0">
            <CodeViewer
              language={challenge.language}
              faultyCode={challenge.faultyCode}
              correctedCode={challenge.correctedCode}
              isSolutionRevealed={isSolutionRevealed}
              bugLine={challenge.bugLine}
              highlightLines={challenge.highlightLines}
              showBugLine={isSolutionRevealed || hintsRevealedCount >= 2 || submissionStatus !== 'idle'}
            />
          </div>

          <HintDrawer
            hints={challenge.hints}
            revealedCount={hintsRevealedCount}
            onRevealNext={handleUnlockNextHint}
          />
        </div>

        {/* Right Column: Multiple Choice Options & Tutor */}
        <div className="lg:col-span-5 space-y-4 w-full min-w-0">
          
          <div className="card-brutal p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#E4E1DF]">
              <h2 className="text-base font-extrabold font-display text-[#2F2E33]">
                Diagnose the Bug
              </h2>
              <span className="text-xs font-mono font-bold text-[#858B98]">
                Select 1 option
              </span>
            </div>

            {/* Answer Choices */}
            <div className="space-y-3">
              {challenge.options.map((option, idx) => {
                const isSelected = selectedOptionId === option.id;
                const isCorrectOption = option.id === challenge.correctOptionId;
                const showCorrectHighlight = isSolutionRevealed && isCorrectOption;
                const showWrongHighlight =
                  submissionStatus === 'incorrect' && isSelected;

                let cardStyle = 'bg-white border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]';
                if (showCorrectHighlight) {
                  cardStyle = 'bg-[#9AF7A0] border-2 border-[#2F2E33] shadow-[4px_4px_0px_#2F2E33]';
                } else if (showWrongHighlight) {
                  cardStyle = 'bg-[#FFB8B0] border-2 border-[#2F2E33] shadow-[4px_4px_0px_#2F2E33]';
                } else if (isSelected) {
                  cardStyle = 'bg-[#ADDCE8] border-2 border-[#2F2E33] shadow-[4px_4px_0px_#2F2E33]';
                }

                return (
                  <button
                    key={option.id}
                    disabled={isSolutionRevealed && submissionStatus === 'correct'}
                    onClick={() => {
                      setSelectedOptionId(option.id);
                      if (submissionStatus === 'incorrect') {
                        setSubmissionStatus('idle');
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all text-xs flex items-start gap-3 ${cardStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#2F2E33] text-white font-mono font-extrabold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>

                    <div className="flex-1 space-y-1">
                      <p className="font-bold text-[#2F2E33] leading-relaxed">{option.text}</p>
                      {isSolutionRevealed && (
                        <p className="text-[11px] font-medium text-[#2F2E33] pt-1 border-t border-[#2F2E33]/20">
                          {option.explanation}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                {submissionStatus !== 'correct' && (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOptionId}
                    className="btn-primary text-xs py-2.5 px-4"
                  >
                    <span>Validate Answer</span>
                  </button>
                )}

                {submissionStatus === 'incorrect' && (
                  <button
                    onClick={handleRetry}
                    className="btn-secondary text-xs py-2.5 px-3.5 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                )}
              </div>

              {!isSolutionRevealed ? (
                <button
                  onClick={handleRevealSolution}
                  className="px-3 py-2 text-xs font-extrabold text-[#2F2E33] hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Reveal Solution</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSubmissionStatus('idle');
                    setSelectedOptionId(null);
                    setIsSolutionRevealed(false);
                  }}
                  className="px-3 py-2 text-xs font-extrabold text-[#2F2E33] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Correct State Banner */}
            {submissionStatus === 'correct' && (
              <div className="card-brutal-mint p-4 text-xs font-bold text-[#2F2E33] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-extrabold font-display text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Correct Diagnosis!</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold bg-[#2F2E33] text-white px-2 py-0.5 rounded">
                    +{challenge.xpReward} XP
                  </span>
                </div>
                <p className="text-xs leading-relaxed">
                  Verified solution and root cause explanation unlocked.
                </p>
                {nextChallenge && (
                  <button
                    onClick={() => onSelectChallenge(nextChallenge.id)}
                    className="btn-primary text-xs py-2 px-3.5 mt-1 flex items-center gap-1.5"
                  >
                    <span>Next: {nextChallenge.title}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>
            )}

            {/* Incorrect State Banner */}
            {submissionStatus === 'incorrect' && (
              <div className="card-brutal-coral p-4 text-xs font-bold text-[#2F2E33] space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-sm">
                  <XCircle className="w-5 h-5" />
                  <span>Incorrect Answer</span>
                </div>
                <p className="text-xs leading-relaxed">
                  That choice does not fix the underlying bug. Review the progressive hints on the left!
                </p>
              </div>
            )}
          </div>

          {/* Root Cause Card */}
          {isSolutionRevealed && (
            <div className="card-brutal p-5 space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-[#24C566] flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Verified Root Cause & Fix</span>
              </h3>
              <p className="text-xs font-bold text-[#2F2E33] leading-relaxed">
                {challenge.rootCause}
              </p>
              <div className="p-3 bg-[#E4E1DF] rounded-xl text-xs font-bold text-[#2F2E33]">
                <strong>Expected Behavior:</strong> {challenge.expectedBehavior}
              </div>
            </div>
          )}

          {/* AI Tutor Drawer */}
          <AiTutorDrawer
            challenge={challenge}
            isUnlocked={isSolutionRevealed || submissionStatus === 'correct'}
          />

        </div>
      </div>
    </div>
  );
};
