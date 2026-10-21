import React, { useState } from 'react';
import {
  Sparkles,
  Bug,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Info,
  Wand2,
  Code2,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  FileCode2,
  ArrowRight
} from 'lucide-react';
import { Language, ScanFinding, FindingSeverity } from '../types';
import { CodeEditor, LineHighlight } from '../components/CodeEditor';

interface SampleBug {
  id: string;
  label: string;
  language: Language;
  description: string;
  expectedBehavior: string;
  code: string;
}

const SAMPLE_BUGS: SampleBug[] = [
  {
    id: 'c-scanf-missing-amp',
    label: 'C: scanf missing & (Segfault)',
    language: 'c',
    description: 'Passing variable value instead of memory address to scanf format string %d',
    expectedBehavior: 'Read user age from terminal and print confirmation',
    code: `#include <stdio.h>

int main(void) {
    int age = 0;
    printf("Please enter your age: ");
    // Missing & operator causes invalid memory write
    scanf("%d", age);
    printf("You are %d years old.\\n", age);
    return 0;
}`
  },
  {
    id: 'c-off-by-one-loop',
    label: 'C: Off-by-one boundary',
    language: 'c',
    description: 'Iterating up to <= length instead of < length causing memory buffer overflow',
    expectedBehavior: 'Compute total sum of 5 elements in array',
    code: `#include <stdio.h>

int main(void) {
    int scores[5] = {10, 20, 30, 40, 50};
    int total = 0;

    for (int i = 0; i <= 5; i++) {
        total += scores[i];
    }

    printf("Total score: %d\\n", total);
    return 0;
}`
  },
  {
    id: 'py-mutable-default',
    label: 'Python: Mutable default arg',
    language: 'python',
    description: 'Default list expression [] is evaluated once and reused across all function calls',
    expectedBehavior: 'Create an independent cart for each customer session',
    code: `def add_to_cart(item, cart=[]):
    """Adds item to customer cart with default empty list."""
    cart.append(item)
    return cart

alice_cart = add_to_cart("Laptop")
print("Alice:", alice_cart)

bob_cart = add_to_cart("Mouse")
print("Bob:", bob_cart)
`
  }
];

export const ScannerView: React.FC = () => {
  const [language, setLanguage] = useState<Language>('c');
  const [code, setCode] = useState<string>(SAMPLE_BUGS[0].code);
  const [expectedBehavior, setExpectedBehavior] = useState<string>(SAMPLE_BUGS[0].expectedBehavior);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [findings, setFindings] = useState<ScanFinding[] | null>(null);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [copiedFindingId, setCopiedFindingId] = useState<string | null>(null);
  const [fixSuccessNotice, setFixSuccessNotice] = useState<string | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(null);

  const currentLanguageSamples = SAMPLE_BUGS.filter((s) => s.language === language);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    const firstSample = SAMPLE_BUGS.find((s) => s.language === lang);
    if (firstSample) {
      setCode(firstSample.code);
      setExpectedBehavior(firstSample.expectedBehavior);
    } else {
      setCode('');
      setExpectedBehavior('');
    }
    setFindings(null);
    setSummaryMessage(null);
    setSelectedFindingId(null);
    setActiveLine(null);
  };

  const handleLoadSample = (sample: SampleBug) => {
    setLanguage(sample.language);
    setCode(sample.code);
    setExpectedBehavior(sample.expectedBehavior);
    setFindings(null);
    setSummaryMessage(null);
    setSelectedFindingId(null);
    setActiveLine(null);
    setFixSuccessNotice(`Loaded sample: "${sample.label}"`);
    setTimeout(() => setFixSuccessNotice(null), 3000);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsScanning(true);
    setFindings(null);
    setSummaryMessage(null);
    setSelectedFindingId(null);
    setActiveLine(null);
    setFixSuccessNotice(null);

    setScanStep('Validating syntax & running static checks...');

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          expectedBehavior: expectedBehavior.trim() ? expectedBehavior.trim() : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setFindings(data.findings || []);
        setSummaryMessage(data.summaryMessage || 'Analysis complete.');
        setIsAiGenerated(Boolean(data.isAiGenerated));

        if (data.findings && data.findings.length > 0) {
          const first = data.findings[0];
          setSelectedFindingId(first.id);
          if (first.lineNumber) {
            setActiveLine(first.lineNumber);
          }
        }
      } else {
        setFindings([]);
        setSummaryMessage(data.error || 'Failed to complete code scan.');
        setIsAiGenerated(false);
      }
    } catch {
      setFindings([]);
      setSummaryMessage('Network connection failed. Could not reach server analysis endpoint.');
      setIsAiGenerated(false);
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const handleCopyFix = async (finding: ScanFinding) => {
    if (!finding.correctedCode) return;
    try {
      await navigator.clipboard.writeText(finding.correctedCode);
      setCopiedFindingId(finding.id);
      setTimeout(() => setCopiedFindingId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleApplyFix = (finding: ScanFinding) => {
    if (!finding.correctedCode) return;

    const lines = code.split('\n');

    if (finding.lineNumber && finding.lineNumber >= 1 && finding.lineNumber <= lines.length) {
      const lineIdx = finding.lineNumber - 1;
      lines[lineIdx] = finding.correctedCode;
      const updatedCode = lines.join('\n');
      setCode(updatedCode);
      setActiveLine(finding.lineNumber);
      setFixSuccessNotice(`Applied fix to line ${finding.lineNumber}!`);
      setTimeout(() => setFixSuccessNotice(null), 3500);
      return;
    }

    if (finding.originalCodeExcerpt && code.includes(finding.originalCodeExcerpt)) {
      const updatedCode = code.replace(finding.originalCodeExcerpt, finding.correctedCode);
      setCode(updatedCode);
      setFixSuccessNotice('Applied fix to editor!');
      setTimeout(() => setFixSuccessNotice(null), 3500);
      return;
    }

    setFixSuccessNotice('Could not locate exact line in code. Please copy and paste the fix.');
    setTimeout(() => setFixSuccessNotice(null), 4000);
  };

  const lineHighlights: LineHighlight[] = React.useMemo(() => {
    if (!findings) return [];
    const highlights: LineHighlight[] = [];
    for (const f of findings) {
      if (f.lineNumber && f.lineNumber > 0) {
        highlights.push({
          line: f.lineNumber,
          severity: f.severity,
          summary: f.summary
        });
      }
    }
    return highlights;
  }, [findings]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="card-brutal p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#24C566] border-2 border-[#2F2E33] rounded-full shadow-[2px_2px_0px_#2F2E33] text-xs font-extrabold text-[#2F2E33] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#2F2E33]" />
            <span>Instant Scanner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#2F2E33]">
            Let's Find That Bug
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-bold text-[#858B98]">
            Paste C or Python code to receive instant static analysis and AI-assisted verified fixes.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-[#E4E1DF] border-2 border-[#2F2E33] rounded-2xl shadow-[2px_2px_0px_#2F2E33]">
          <button
            onClick={() => handleSelectLanguage('c')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
              language === 'c'
                ? 'bg-[#24C566] text-[#2F2E33] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]'
                : 'text-[#2F2E33]'
            }`}
          >
            C Language
          </button>
          <button
            onClick={() => handleSelectLanguage('python')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
              language === 'python'
                ? 'bg-[#24C566] text-[#2F2E33] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33]'
                : 'text-[#2F2E33]'
            }`}
          >
            Python 3
          </button>
        </div>
      </div>

      {/* Sample Bug Selector */}
      <div className="card-brutal-blue p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#2F2E33] font-bold">
          <Wand2 className="w-4 h-4 shrink-0" />
          <span>Load Example Bug:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentLanguageSamples.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              className="px-3 py-1.5 bg-white border-2 border-[#2F2E33] rounded-xl text-[#2F2E33] font-extrabold text-xs shadow-[2px_2px_0px_#2F2E33] hover:-translate-y-0.5 active:translate-y-0 transition-transform flex items-center gap-1"
            >
              <span>{sample.label}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Code Editor */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2F2E33] mb-1.5">
              What did you expect the code to do? (Optional)
            </label>
            <input
              type="text"
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              placeholder="e.g. Read an integer from terminal and calculate square"
              className="w-full px-4 py-2.5 bg-white border-2 border-[#2F2E33] rounded-xl text-xs font-bold text-[#2F2E33] focus:outline-none focus:ring-2 focus:ring-[#24C566] shadow-[2px_2px_0px_#2F2E33]"
            />
          </div>

          <CodeEditor
            language={language}
            value={code}
            onChange={(val) => {
              setCode(val);
              setFixSuccessNotice(null);
            }}
            lineHighlights={lineHighlights}
            selectedLine={activeLine}
            onSelectLine={(line) => setActiveLine(line)}
          />

          {fixSuccessNotice && (
            <div className="card-brutal-mint p-3 text-xs font-extrabold text-[#2F2E33] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{fixSuccessNotice}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isScanning || !code.trim()}
              className="btn-primary text-xs py-3 px-6 flex items-center gap-2"
            >
              {isScanning ? (
                <span className="animate-spin font-mono">⚡ Scanning...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Code</span>
                </>
              )}
            </button>

            <div className="text-xs font-bold text-[#858B98] flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#24C566]" />
              <span>Untrusted static code analysis (never executed)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Findings */}
        <div className="lg:col-span-5 space-y-4">
          
          {findings === null && !isScanning && (
            <div className="card-brutal p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#9AF7A0] border-2 border-[#2F2E33] shadow-[3px_3px_0px_#2F2E33] flex items-center justify-center mx-auto text-[#2F2E33]">
                <Bug className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-extrabold font-display text-[#2F2E33]">
                Ready to Analyze Your Code
              </h3>
              <p className="text-xs font-bold text-[#858B98] max-w-sm mx-auto leading-relaxed">
                Click <strong>Analyze Code</strong> to run deterministic pre-checks and AI-assisted bug diagnosis.
              </p>
            </div>
          )}

          {findings !== null && (
            <div className="card-brutal p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#E4E1DF]">
                <span className="text-sm font-extrabold font-display text-[#2F2E33]">Scan Findings</span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-extrabold bg-[#24C566] border-2 border-[#2F2E33]">
                  {findings.length} Finding{findings.length === 1 ? '' : 's'}
                </span>
              </div>

              <p className="text-xs font-bold text-[#2F2E33]">
                {summaryMessage}
              </p>

              {findings.map((finding) => (
                <div
                  key={finding.id}
                  onClick={() => {
                    setSelectedFindingId(finding.id);
                    if (finding.lineNumber) setActiveLine(finding.lineNumber);
                  }}
                  className={`p-4 rounded-xl border-2 border-[#2F2E33] shadow-[3px_3px_0px_#2F2E33] space-y-2 cursor-pointer transition-all ${
                    finding.severity === 'Error'
                      ? 'bg-[#FFB8B0]'
                      : finding.severity === 'Warning'
                      ? 'bg-[#E5E0FA]'
                      : 'bg-[#ADDCE8]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#2F2E33]">
                    <span className="uppercase font-mono">{finding.severity} · {finding.bugCategory}</span>
                    <span className="font-mono">
                      {finding.lineNumber ? `Line ${finding.lineNumber}` : 'Line Location Uncertain'}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-[#2F2E33] font-display">
                    {finding.summary}
                  </h4>

                  <p className="text-xs font-bold text-[#2F2E33] leading-relaxed">
                    {finding.explanation}
                  </p>

                  {finding.correctedCode && (
                    <div className="pt-2">
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider block mb-1">
                        Corrected Code:
                      </span>
                      <pre className="p-2 bg-[#2F2E33] text-white rounded-lg font-mono text-xs overflow-x-auto">
                        {finding.correctedCode}
                      </pre>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#2F2E33]/20">
                    <span className="text-[10px] font-mono font-bold text-[#2F2E33]">
                      Confidence: {finding.confidenceLevel}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyFix(finding);
                        }}
                        className="px-2.5 py-1 text-xs font-extrabold bg-white border border-[#2F2E33] rounded-lg shadow-[1px_1px_0px_#2F2E33]"
                      >
                        {copiedFindingId === finding.id ? 'Copied!' : 'Copy Fix'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyFix(finding);
                        }}
                        className="btn-primary text-xs !py-1 !px-2.5"
                      >
                        Apply Fix
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
