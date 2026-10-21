import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { Hint } from '../types';

interface HintDrawerProps {
  hints: [Hint, Hint, Hint];
  revealedCount: number;
  onRevealNext: () => void;
}

export const HintDrawer: React.FC<HintDrawerProps> = ({
  hints,
  revealedCount,
  onRevealNext
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const canRevealMore = revealedCount < 3;

  return (
    <div className="card-brutal-blue p-4 space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] flex items-center justify-center text-[#2F2E33]">
            <Lightbulb className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold font-display text-[#2F2E33]">
              Progressive Hints
            </h3>
            <p className="text-[11px] font-bold text-[#2F2E33]/80">
              {revealedCount === 0 ? '3 clues available' : `${revealedCount} of 3 hints unlocked`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {revealedCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-lg bg-[#9AF7A0] border-2 border-[#2F2E33] text-xs font-mono font-extrabold text-[#2F2E33]">
              {revealedCount}/3
            </span>
          )}
          {isOpen ? <ChevronUp className="w-5 h-5 text-[#2F2E33]" /> : <ChevronDown className="w-5 h-5 text-[#2F2E33]" />}
        </div>
      </button>

      {isOpen && (
        <div className="pt-2 border-t-2 border-[#2F2E33] space-y-3">
          <div className="space-y-2">
            {hints.map((hint, idx) => {
              const isUnlocked = idx < revealedCount;
              const hintLevel = idx + 1;

              return (
                <div
                  key={hint.level}
                  className={`p-3 rounded-xl border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] ${
                    isUnlocked ? 'bg-white text-[#2F2E33]' : 'bg-[#E4E1DF] text-[#858B98]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-[#2F2E33] flex items-center gap-1.5">
                      {isUnlocked ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#24C566]" />
                          <span>Hint {hintLevel}: {hint.title}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-[#858B98]" />
                          <span>Hint {hintLevel}: Locked Clue</span>
                        </>
                      )}
                    </span>
                  </div>

                  {isUnlocked ? (
                    <p className="text-xs font-bold text-[#2F2E33] leading-relaxed">
                      {hint.content}
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-[#858B98] italic">
                      Unlock this hint for progressive guidance.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-bold text-[#2F2E33]">
              No XP penalty for hints.
            </span>

            {canRevealMore ? (
              <button
                onClick={onRevealNext}
                className="btn-primary text-xs !py-1.5 !px-3"
              >
                <span>Unlock Hint {revealedCount + 1}</span>
              </button>
            ) : (
              <span className="text-xs font-extrabold text-[#24C566]">
                ✓ All hints revealed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
