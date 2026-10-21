import React from 'react';
import {
  Bug,
  Terminal,
  Sparkles,
  ArrowRight,
  Code2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Award,
  Flame,
  Search,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { CHALLENGES } from '../data/challenges';

interface LandingViewProps {
  onStartDebugging: () => void;
  onExploreChallenges: () => void;
  onOpenScanner: () => void;
  onSelectChallenge: (id: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartDebugging,
  onExploreChallenges,
  onOpenScanner,
  onSelectChallenge,
  onOpenAuth
}) => {
  const cChallenges = CHALLENGES.filter((c) => c.language === 'c').slice(0, 3);
  const pyChallenges = CHALLENGES.filter((c) => c.language === 'python').slice(0, 3);

  return (
    <div className="space-y-16 pb-12">
      
      {/* HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
        
        {/* Left Hero Content */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Mint Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#9AF7A0] border-2 border-[#2F2E33] rounded-full shadow-[2px_2px_0px_#2F2E33] text-xs font-extrabold text-[#2F2E33]">
            <span className="w-2 h-2 rounded-full bg-[#24C566] border border-[#2F2E33] animate-ping" />
            <span>New: Guided AI C & Python Debugging</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-[#2F2E33] leading-[1.1]">
            Find the Bug.{' '}
            <span className="bg-[#24C566] text-[#2F2E33] px-3 py-1 rounded-2xl border-2 border-[#2F2E33] shadow-[4px_4px_0px_#2F2E33] inline-block mt-1">
              Understand the Fix.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#2F2E33] font-medium max-w-2xl leading-relaxed">
            Master real computer science debugging through interactive code challenges, progressive hints, line-by-line static scans, and an empathetic AI tutor.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onStartDebugging}
              className="btn-primary text-base py-3.5 px-6 flex items-center gap-2"
            >
              <span>Start Debugging Free</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={onExploreChallenges}
              className="btn-secondary text-base py-3.5 px-6 flex items-center gap-2"
            >
              <Code2 className="w-5 h-5 stroke-[2.5]" />
              <span>Browse Challenges</span>
            </button>
          </div>

          {/* Real Compact Metrics */}
          <div className="pt-6 border-t-2 border-[#E4E1DF] grid grid-cols-3 gap-4 max-w-lg">
            <div>
              <div className="text-2xl font-extrabold font-display text-[#2F2E33]">12+</div>
              <div className="text-xs font-bold text-[#858B98]">Verified Bug Scenarios</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold font-display text-[#2F2E33]">C & Python</div>
              <div className="text-xs font-bold text-[#858B98]">CS Core Curriculum</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold font-display text-[#2F2E33]">100% Free</div>
              <div className="text-xs font-bold text-[#858B98]">Open Interactive Tool</div>
            </div>
          </div>
        </div>

        {/* Right Hero Interactive HTML/CSS Layered Illustration */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            
            {/* Main Code Card Container */}
            <div className="bg-white border-[2.5px] border-[#2F2E33] rounded-3xl p-5 shadow-[8px_8px_0px_#2F2E33] relative z-10 space-y-4">
              
              {/* Card Window Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#E4E1DF]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FFB8B0] border border-[#2F2E33]" />
                  <div className="w-3 h-3 rounded-full bg-[#ADDCE8] border border-[#2F2E33]" />
                  <div className="w-3 h-3 rounded-full bg-[#9AF7A0] border border-[#2F2E33]" />
                </div>
                <span className="text-xs font-mono font-extrabold text-[#2F2E33] bg-[#E5E0FA] px-2.5 py-0.5 rounded-full border border-[#2F2E33]">
                  scanf_bug.c
                </span>
              </div>

              {/* Code Snippet with Highlighted Bug Line */}
              <div className="bg-[#2F2E33] text-white p-4 rounded-2xl font-mono text-xs space-y-1.5 border-2 border-[#2F2E33] shadow-[3px_3px_0px_#2F2E33]">
                <div className="text-slate-400">// Interactive Debugging Preview</div>
                <div><span className="text-indigo-300">int</span> main() {'{'}</div>
                <div className="pl-4 text-slate-300">int number;</div>
                
                {/* Coral Bug Highlighted Line */}
                <div className="pl-4 py-1 px-2 bg-[#FFB8B0] text-[#2F2E33] font-bold rounded-lg flex items-center justify-between border border-[#2F2E33]">
                  <span>scanf("%d", number);</span>
                  <span className="text-[10px] uppercase font-mono font-extrabold bg-[#2F2E33] text-white px-1.5 py-0.5 rounded">
                    BUG: Missing &
                  </span>
                </div>

                <div className="pl-4 text-slate-300">return 0;</div>
                <div>{'}'}</div>
              </div>

              {/* Progress Bar inside Illustration */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-extrabold text-[#2F2E33]">
                  <span>Challenge Progress</span>
                  <span className="font-mono text-[#24C566]">65% Completed</span>
                </div>
                <div className="h-3 bg-[#E4E1DF] border-2 border-[#2F2E33] rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-[#24C566] rounded-full w-[65%]" />
                </div>
              </div>

              {/* Continue Action Button inside Illustration */}
              <button
                onClick={onStartDebugging}
                className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Floating Accent Badge 1: Top Right Coral Bug Tag */}
            <div className="absolute -top-4 -right-4 z-20 bg-[#FFB8B0] border-[2.5px] border-[#2F2E33] rounded-2xl p-3 shadow-[4px_4px_0px_#2F2E33] hidden sm:flex items-center gap-2 animate-bounce">
              <Bug className="w-5 h-5 text-[#2F2E33]" />
              <span className="text-xs font-extrabold text-[#2F2E33]">Segfault Detected!</span>
            </div>

            {/* Floating Accent Badge 2: Bottom Left Mint Star Tag */}
            <div className="absolute -bottom-4 -left-4 z-20 bg-[#9AF7A0] border-[2.5px] border-[#2F2E33] rounded-2xl p-3 shadow-[4px_4px_0px_#2F2E33] hidden sm:flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#2F2E33]" />
              <span className="text-xs font-extrabold text-[#2F2E33]">+100 XP Awarded</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION 1: CHALLENGE LIBRARY PREVIEW */}
      <section className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ADDCE8] border-2 border-[#2F2E33] rounded-full shadow-[2px_2px_0px_#2F2E33] text-xs font-extrabold text-[#2F2E33] mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>CS Core Curriculum</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#2F2E33]">
              Featured Debug Challenges
            </h2>
            <p className="text-sm font-bold text-[#858B98] mt-1">
              Select a real student bug scenario, analyze the code, and apply the correct fix.
            </p>
          </div>

          <button
            onClick={onExploreChallenges}
            className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View All 12 Challenges</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...cChallenges.slice(0, 2), ...pyChallenges.slice(0, 1)].map((challenge) => (
            <div
              key={challenge.id}
              onClick={() => onSelectChallenge(challenge.id)}
              className="card-brutal p-5 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2F2E33] cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 text-xs font-mono font-extrabold uppercase rounded-lg border-2 border-[#2F2E33] ${
                    challenge.language === 'c' ? 'bg-[#FFB8B0]' : 'bg-[#9AF7A0]'
                  }`}>
                    {challenge.language.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-lg bg-[#E5E0FA] border-2 border-[#2F2E33]">
                    {challenge.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold font-display text-[#2F2E33] group-hover:text-[#24C566] transition-colors">
                  {challenge.title}
                </h3>

                <p className="text-xs font-bold text-[#858B98] line-clamp-2">
                  {challenge.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t-2 border-[#E4E1DF] flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold text-[#2F2E33]">
                  +{challenge.xpReward} XP
                </span>
                <span className="text-xs font-extrabold text-[#24C566] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Debug Challenge &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE SECTION 2: CODE SCANNER PREVIEW */}
      <section className="card-brutal-blue p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-[#2F2E33] rounded-full shadow-[2px_2px_0px_#2F2E33] text-xs font-extrabold text-[#2F2E33]">
              <Sparkles className="w-3.5 h-3.5 text-[#24C566]" />
              <span>Instant Code Scanner</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#2F2E33]">
              Paste Your Code. Find Any Bug.
            </h2>

            <p className="text-sm font-bold text-[#2F2E33] leading-relaxed">
              Got a segfault, infinite loop, or syntax error in your C or Python assignment? Paste your source code into BugTrail Scanner to receive instant line-by-line static analysis and AI-assisted verified fixes.
            </p>

            <button
              onClick={onOpenScanner}
              className="btn-primary text-sm py-3 px-5 flex items-center gap-2"
            >
              <span>Try Code Scanner Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-white border-[2.5px] border-[#2F2E33] rounded-2xl p-4 shadow-[4px_4px_0px_#2F2E33] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#E4E1DF]">
                <span className="font-extrabold text-[#2F2E33]">Scanner Result Preview</span>
                <span className="px-2 py-0.5 bg-[#FFB8B0] border border-[#2F2E33] rounded text-[10px] font-bold">
                  1 Error Found
                </span>
              </div>

              <div className="bg-[#2F2E33] text-white p-3 rounded-xl space-y-1">
                <div className="text-emerald-400"># Line 4: Format Specifier Error</div>
                <div className="text-slate-300">printf("Val: %s", integer_var);</div>
              </div>

              <div className="p-3 bg-[#E5E0FA] border-2 border-[#2F2E33] rounded-xl text-[#2F2E33] text-[11px] font-sans font-bold">
                <strong>Explanation:</strong> Passing integer to %s expects a string pointer address, causing an immediate crash or garbled output. Use %d instead.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION 3: DARK EDUCATION SECTION inspired by LearnHub bottom */}
      <section className="card-brutal-dark p-8 sm:p-12 space-y-8">
        <div className="max-w-3xl space-y-3">
          <span className="px-3 py-1 bg-[#24C566] text-[#2F2E33] font-extrabold text-xs rounded-lg border-2 border-[#2F2E33] shadow-[2px_2px_0px_#000000] inline-block">
            Pedagogical Platform
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Designed for CS Students & Self-Taught Coders
          </h2>
          <p className="text-sm font-medium text-slate-300 leading-relaxed">
            Unlike simple solutions providers, BugTrail AI teaches you how to think like a seasoned software developer through guided clues, mental models, and line-level reasoning.
          </p>
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#2F2E33] border-2 border-white rounded-2xl p-5 shadow-[4px_4px_0px_#000000] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB8B0] border-2 border-white text-[#2F2E33] flex items-center justify-center font-extrabold text-lg">
              1
            </div>
            <h3 className="text-lg font-extrabold font-display text-white">Identify the Defect</h3>
            <p className="text-xs text-slate-300 font-medium">
              Read real student code snippets containing subtle bugs, memory errors, or boundary flaws.
            </p>
          </div>

          <div className="bg-[#2F2E33] border-2 border-white rounded-2xl p-5 shadow-[4px_4px_0px_#000000] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#ADDCE8] border-2 border-white text-[#2F2E33] flex items-center justify-center font-extrabold text-lg">
              2
            </div>
            <h3 className="text-lg font-extrabold font-display text-white">Follow Clues & Hints</h3>
            <p className="text-xs text-slate-300 font-medium">
              Unlock progressive hints or ask AI Tutor specific questions to build intuition without spoiling the answer.
            </p>
          </div>

          <div className="bg-[#2F2E33] border-2 border-white rounded-2xl p-5 shadow-[4px_4px_0px_#000000] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#9AF7A0] border-2 border-white text-[#2F2E33] flex items-center justify-center font-extrabold text-lg">
              3
            </div>
            <h3 className="text-lg font-extrabold font-display text-white">Master the Fix</h3>
            <p className="text-xs text-slate-300 font-medium">
              Apply verified fixes, earn XP rewards, maintain daily streaks, and level up your software skills.
            </p>
          </div>
        </div>

        {/* Final CTA inside Dark Section */}
        <div className="pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-bold text-slate-200">
            Ready to debug your first code snippet?
          </div>
          <button
            onClick={onStartDebugging}
            className="btn-primary text-sm py-3 px-6 shrink-0"
          >
            Get Started Now — It's Free
          </button>
        </div>
      </section>

    </div>
  );
};
