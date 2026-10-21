import React from 'react';
import { Bug, Home, LayoutDashboard, ArrowLeft, Terminal, Compass } from 'lucide-react';

interface NotFoundViewProps {
  onNavigateToHome: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToChallenges: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onNavigateToHome,
  onNavigateToDashboard,
  onNavigateToChallenges,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="card-brutal bg-white p-8 sm:p-12 max-w-lg w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Playful Neo-Brutalist Visual Element */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
          <div className="absolute inset-0 bg-[#FFB8B0] rounded-2xl border-[3px] border-[#2F2E33] shadow-[4px_4px_0px_#2F2E33] flex items-center justify-center">
            <Bug className="w-14 h-14 text-[#2F2E33] stroke-[2.2] animate-bounce" />
          </div>
          <div className="absolute -top-3 -right-3 px-2 py-0.5 bg-[#9AF7A0] border-2 border-[#2F2E33] rounded-full text-[10px] font-mono font-extrabold shadow-[2px_2px_0px_#2F2E33]">
            ERROR 404
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#2F2E33] tracking-tight">
            Trail Lost!
          </h1>
          <p className="text-sm font-bold text-[#858B98] leading-relaxed">
            The line of code or challenge you are looking for does not exist on this branch. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={onNavigateToHome}
            className="btn-primary py-3 px-4 text-xs font-extrabold flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          
          <button
            onClick={onNavigateToDashboard}
            className="btn-secondary py-3 px-4 text-xs font-extrabold flex items-center justify-center gap-2 bg-[#ADDCE8]"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </button>
        </div>

        <button
          onClick={onNavigateToChallenges}
          className="w-full py-2.5 px-4 text-xs font-extrabold font-mono text-[#2F2E33] hover:underline flex items-center justify-center gap-1.5"
        >
          <Compass className="w-4 h-4 text-[#24C566]" />
          <span>Or explore all debugging challenges &rarr;</span>
        </button>

      </div>
    </div>
  );
};
