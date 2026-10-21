import React, { useRef, useEffect } from 'react';
import { Copy, Trash2, Clipboard, Check, Terminal } from 'lucide-react';
import { FindingSeverity, Language } from '../types';

export interface LineHighlight {
  line: number;
  severity: FindingSeverity;
  summary?: string;
}

interface CodeEditorProps {
  language: Language;
  value: string;
  onChange: (value: string) => void;
  lineHighlights?: LineHighlight[];
  selectedLine?: number | null;
  onSelectLine?: (line: number) => void;
  readOnly?: boolean;
  maxChars?: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  lineHighlights = [],
  selectedLine = null,
  onSelectLine,
  readOnly = false,
  maxChars = 25000,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineGutterRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [pasteNotice, setPasteNotice] = React.useState<string | null>(null);

  // Split lines
  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Sync scrolling between textarea and line gutter
  const handleScroll = () => {
    if (textareaRef.current && lineGutterRef.current) {
      lineGutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Scroll to selected line if it changes
  useEffect(() => {
    if (selectedLine && textareaRef.current) {
      const lineHeight = 24; // approx px per line with leading-6
      const targetScroll = (selectedLine - 3) * lineHeight;
      textareaRef.current.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [selectedLine]);

  // Handle Tab key indentation in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !readOnly) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '    '; // 4 spaces for C and Python PEP8

      const newValue = value.substring(0, start) + spaces + value.substring(end);
      onChange(newValue);

      // Restore cursor position after state update
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      }, 0);
    }
  };

  const handleCopyCode = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePasteCode = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChange(clipText.slice(0, maxChars));
        setPasteNotice('Code pasted from clipboard!');
        setTimeout(() => setPasteNotice(null), 2500);
      }
    } catch {
      // If browser clipboard permission blocked, focus the textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
        setPasteNotice('Press Ctrl+V (or Cmd+V) to paste directly into the editor');
        setTimeout(() => setPasteNotice(null), 3500);
      }
    }
  };

  const handleClear = () => {
    onChange('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Create a lookup map for line highlights
  const highlightMap = React.useMemo(() => {
    const map = new Map<number, LineHighlight>();
    for (const h of lineHighlights) {
      // Highest severity wins if multiple findings on same line
      const existing = map.get(h.line);
      if (!existing || (existing.severity !== 'Error' && h.severity === 'Error')) {
        map.set(h.line, h);
      }
    }
    return map;
  }, [lineHighlights]);

  return (
    <div className="rounded-xl border border-slate-800 bg-[#090d16] shadow-xl overflow-hidden flex flex-col focus-within:border-indigo-500/60 transition-colors">
      {/* Editor Header Bar */}
      <div className="px-4 py-2.5 bg-[#0e1628] border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="font-mono font-semibold text-slate-200">
            {language === 'c' ? 'main.c' : 'script.py'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-medium tracking-wider bg-slate-800 text-slate-400">
            {language.toUpperCase()}
          </span>
          {pasteNotice && (
            <span className="text-[11px] text-emerald-400 font-medium animate-in fade-in">
              {pasteNotice}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePasteCode}
            title="Paste from clipboard"
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-md transition-colors font-medium text-[11px]"
          >
            <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
            <span>Paste</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            disabled={!value}
            title="Copy all code"
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-md transition-colors font-medium text-[11px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!value}
            title="Clear editor code"
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 disabled:opacity-40 rounded-md transition-colors font-medium text-[11px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Code Editor Main Body */}
      <div className="relative flex flex-1 min-h-[380px] max-h-[560px] bg-[#070b12] overflow-hidden font-mono text-sm">
        {/* Line Numbers Gutter */}
        <div
          ref={lineGutterRef}
          aria-hidden="true"
          className="w-14 shrink-0 py-3 select-none text-right pr-3 font-mono text-xs border-r border-slate-800/80 bg-[#0a0f1d] overflow-hidden"
          style={{ height: '100%' }}
        >
          {Array.from({ length: lineCount }).map((_, i) => {
            const lineNum = i + 1;
            const highlight = highlightMap.get(lineNum);
            const isSelected = selectedLine === lineNum;

            let indicatorColor = 'text-slate-600';
            let dot = null;

            if (highlight) {
              if (highlight.severity === 'Error') {
                indicatorColor = 'text-rose-400 font-bold';
                dot = <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-1" />;
              } else if (highlight.severity === 'Warning') {
                indicatorColor = 'text-amber-400 font-bold';
                dot = <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />;
              } else {
                indicatorColor = 'text-sky-400 font-bold';
                dot = <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 mr-1" />;
              }
            } else if (isSelected) {
              indicatorColor = 'text-indigo-400 font-semibold';
            }

            return (
              <div
                key={lineNum}
                onClick={() => onSelectLine && onSelectLine(lineNum)}
                className={`h-6 leading-6 flex items-center justify-end cursor-pointer transition-colors ${indicatorColor} ${
                  isSelected ? 'bg-indigo-950/40 -mr-3 pr-3' : ''
                }`}
                title={highlight ? `${highlight.severity}: ${highlight.summary || 'Issue on this line'}` : `Line ${lineNum}`}
              >
                {dot}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Textarea Editor */}
        <div className="relative flex-1 h-full overflow-hidden">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            placeholder={
              language === 'c'
                ? `#include <stdio.h>\n\nint main(void) {\n    // Paste or write your C code here...\n    return 0;\n}`
                : `def solve():\n    # Paste or write your Python code here...\n    pass\n`
            }
            className="w-full h-full min-h-[380px] max-h-[560px] py-3 px-4 bg-transparent text-slate-100 placeholder:text-slate-600 font-mono text-sm leading-6 resize-none focus:outline-none overflow-auto whitespace-pre tab-4"
          />
        </div>
      </div>

      {/* Editor Status Bar */}
      <div className="px-4 py-2 bg-[#0a0f1d] border-t border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span>{lineCount} lines</span>
          <span className="text-slate-700">·</span>
          <span>
            {value.length.toLocaleString()} / {maxChars.toLocaleString()} characters
          </span>
          {highlightMap.size > 0 && (
            <>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-slate-400">
                  {highlightMap.size} flagged line{highlightMap.size === 1 ? '' : 's'}
                </span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            Tab key indents 4 spaces
          </span>
          <span className="font-mono uppercase text-indigo-400 font-semibold">{language}</span>
        </div>
      </div>
    </div>
  );
};
