import React, { useState } from 'react';
import { Copy, Check, FileCode, SplitSquareVertical, Bug } from 'lucide-react';
import { Language } from '../types';

interface CodeViewerProps {
  language: Language;
  faultyCode: string;
  correctedCode: string;
  isSolutionRevealed: boolean;
  bugLine?: number;
  highlightLines?: number[];
  showBugLine?: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  language,
  faultyCode,
  correctedCode,
  isSolutionRevealed,
  bugLine,
  highlightLines = [],
  showBugLine = true
}) => {
  const [activeTab, setActiveTab] = useState<'faulty' | 'corrected'>('faulty');
  const [copied, setCopied] = useState(false);

  // If solution just got revealed, user can easily flip to corrected view
  const currentCode = (isSolutionRevealed && activeTab === 'corrected') ? correctedCode : faultyCode;
  const fileName = language === 'c' 
    ? (activeTab === 'corrected' ? 'solution.c' : 'buggy_program.c')
    : (activeTab === 'corrected' ? 'solution.py' : 'buggy_script.py');

  const lines = currentCode.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Basic syntax tokenization for clean C and Python rendering
  const renderLineContent = (line: string) => {
    if (!line) return <span>&nbsp;</span>;

    // Comment line
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      return <span className="text-emerald-400/80 italic">{line}</span>;
    }

    // Keyword detection
    const keywordsC = ['#include', 'int', 'char', 'void', 'double', 'float', 'return', 'if', 'else', 'for', 'while', 'const', 'sizeof'];
    const keywordsPy = ['def', 'return', 'for', 'in', 'if', 'else', 'elif', 'try', 'except', 'as', 'import', 'from', 'True', 'False', 'None', 'print'];
    const activeKeywords = language === 'c' ? keywordsC : keywordsPy;

    // Tokenize line by words, strings, symbols
    const tokens = line.split(/(".*?"|'.*?'|\b)/g);

    return (
      <span>
        {tokens.map((token, idx) => {
          if (!token) return null;
          
          // String literal
          if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
            return <span key={idx} className="text-amber-300">{token}</span>;
          }
          // Keywords
          if (activeKeywords.includes(token.trim())) {
            return <span key={idx} className="text-indigo-400 font-semibold">{token}</span>;
          }
          // Standard function names
          if (['printf', 'scanf', 'snprintf', 'malloc', 'free', 'print', 'range', 'len', 'enumerate'].includes(token.trim())) {
            return <span key={idx} className="text-cyan-400">{token}</span>;
          }
          // Numbers
          if (/^\d+(\.\d+)?$/.test(token.trim())) {
            return <span key={idx} className="text-purple-300">{token}</span>;
          }
          return <span key={idx} className="text-slate-200">{token}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d1322] shadow-xl overflow-hidden flex flex-col h-full">
      {/* Code Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#090d16] border-b border-slate-800/80 text-xs">
        {/* Left: Tab selectors & File info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>{fileName}</span>
          </div>

          {/* Toggle between Faulty Code and Corrected Solution (if revealed) */}
          {isSolutionRevealed && (
            <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg ml-2">
              <button
                onClick={() => setActiveTab('faulty')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  activeTab === 'faulty'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Faulty Code
              </button>
              <button
                onClick={() => setActiveTab('corrected')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  activeTab === 'corrected'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Verified Fix
              </button>
            </div>
          )}
        </div>

        {/* Right: Language tag & Copy button */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            {language === 'c' ? 'C (C99/C11)' : 'Python 3'}
          </span>

          <button
            onClick={handleCopy}
            title="Copy code to clipboard"
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="p-4 overflow-x-auto flex-1 font-mono text-xs sm:text-[13px] leading-relaxed select-text">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNumber = idx + 1;
              const isBugLine = activeTab === 'faulty' && showBugLine && lineNumber === bugLine;
              const isHighlighted = activeTab === 'faulty' && showBugLine && highlightLines.includes(lineNumber);

              return (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    isBugLine
                      ? 'bg-rose-500/10'
                      : isHighlighted
                      ? 'bg-amber-500/5'
                      : 'hover:bg-slate-800/25'
                  }`}
                >
                  {/* Line Number Gutter */}
                  <td className="w-10 pr-4 text-right select-none text-slate-600 font-mono text-[11px] align-top">
                    {isBugLine ? (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                        <Bug className="w-2.5 h-2.5" />
                        {lineNumber}
                      </span>
                    ) : (
                      lineNumber
                    )}
                  </td>

                  {/* Code Line Content */}
                  <td className="pl-2 pr-4 whitespace-pre font-mono align-top text-slate-200">
                    {renderLineContent(line)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Status / Tip */}
      <div className="px-4 py-2 bg-[#090d16]/70 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          {activeTab === 'faulty' ? (
            <span className="text-rose-400/90 font-medium">● Faulty snippet loaded — inspect carefully</span>
          ) : (
            <span className="text-emerald-400 font-medium">✓ Authoritative verified solution</span>
          )}
        </span>
        <span className="font-mono">{lines.length} lines</span>
      </div>
    </div>
  );
};
