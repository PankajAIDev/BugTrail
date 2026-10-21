import React from 'react';
import { Terminal, ShieldCheck, Cpu, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="card-brutal p-6 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ADDCE8] border-2 border-[#2F2E33] rounded-full shadow-[2px_2px_0px_#2F2E33] text-xs font-extrabold text-[#2F2E33]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Platform Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#2F2E33]">
          How BugTrail AI Works
        </h1>
        <p className="text-xs sm:text-sm font-bold text-[#858B98] leading-relaxed">
          An interactive, zero-setup educational platform built to teach university computer science students how to identify, understand, and fix runtime bugs in C and Python.
        </p>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="card-brutal-mint p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] flex items-center justify-center text-[#2F2E33]">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-extrabold font-display text-[#2F2E33]">Active Debugging</h3>
          <p className="text-xs font-bold text-[#2F2E33] leading-relaxed">
            Replaces passive reading with interactive multi-choice root cause identification and progressive hints.
          </p>
        </div>

        <div className="card-brutal-blue p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] flex items-center justify-center text-[#2F2E33]">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-extrabold font-display text-[#2F2E33]">Curated Reliability</h3>
          <p className="text-xs font-bold text-[#2F2E33] leading-relaxed">
            Every challenge, hint, and solution is deterministically verified. Works 100% offline without mandatory API keys.
          </p>
        </div>

        <div className="card-brutal-coral p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] flex items-center justify-center text-[#2F2E33]">
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-extrabold font-display text-[#2F2E33]">AI Tutor Mentor</h3>
          <p className="text-xs font-bold text-[#2F2E33] leading-relaxed">
            Integrated server-side Gemini AI model synthesizes mental models and compiler intuition on demand.
          </p>
        </div>

      </div>

      {/* Critical System Boundaries */}
      <div className="card-brutal p-6 space-y-4">
        <h2 className="text-xl font-extrabold font-display text-[#2F2E33] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#24C566]" />
          <span>Architecture & Safety Guarantees</span>
        </h2>

        <div className="space-y-3 text-xs font-bold text-[#2F2E33]">
          <div className="p-4 bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl shadow-[2px_2px_0px_#2F2E33] space-y-1">
            <span className="font-extrabold text-[#2F2E33] text-sm">1. Verified Answers vs. AI Explanations</span>
            <p className="text-[#858B98]">
              Scoring, correct answers, and hints come strictly from our deterministic, pre-verified challenge database. 
              The Gemini AI Tutor acts as a supportive pedagogical advisor.
            </p>
          </div>

          <div className="p-4 bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl shadow-[2px_2px_0px_#2F2E33] space-y-1">
            <span className="font-extrabold text-[#2F2E33] text-sm">2. Safe Code Sandbox (No Remote Code Execution)</span>
            <p className="text-[#858B98]">
              BugTrail AI is a static analytical training environment. To protect user systems and prevent remote code execution vulnerabilities, this application does not execute arbitrary user code on the server.
            </p>
          </div>

          <div className="p-4 bg-[#FFF9F4] border-2 border-[#2F2E33] rounded-xl shadow-[2px_2px_0px_#2F2E33] space-y-1">
            <span className="font-extrabold text-[#2F2E33] text-sm">3. Zero Client-Side Secret Exposure</span>
            <p className="text-[#858B98]">
              All Gemini API requests are mediated via server-side endpoints (<code className="font-mono text-[#2F2E33] bg-[#9AF7A0] px-1 rounded">/api/explain</code>). 
              The runtime never exposes API secrets to the browser.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
