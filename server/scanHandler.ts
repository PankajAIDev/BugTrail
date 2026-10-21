import { callGeminiWithFallback, parseGeminiError, getGeminiApiKey } from './geminiService.ts';
import { ScanFinding, FindingSeverity } from '../src/types/index.ts';

export interface ScanRequestPayload {
  language: 'c' | 'python';
  code: string;
  expectedBehavior?: string;
}

// ==========================================
// SAFE DETERMINISTIC STATIC CHECKS
// ==========================================
export function runDeterministicChecks(language: 'c' | 'python', code: string): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const lines = code.split('\n');
  const totalLines = lines.length;

  if (language === 'c') {
    // 1. Missing main function check in complete program
    if (lines.length > 5 && !code.includes('main(') && !code.includes('main (') && !code.includes('main()')) {
      findings.push({
        id: 'det-c-missing-main',
        summary: 'Missing main() entry point',
        severity: 'Warning',
        bugCategory: 'Syntax & Entry Point',
        lineNumber: 1,
        lineRange: '1',
        originalCodeExcerpt: lines[0] || '',
        explanation: 'A standalone C executable requires a main() function as its primary execution entry point.',
        correctedCode: 'int main(void) {\n    // your code\n    return 0;\n}',
        whyFixWorks: 'Defines the entry function required by the C standard runtime linker.',
        confidenceLevel: '85% (High Estimate)'
      });
    }

    // 2. Line by line C checks
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      // Check scanf missing &
      const scanfMatch = trimmed.match(/scanf\s*\(\s*["'][^"']*%[diuoxX][^"']*["']\s*,\s*([a-zA-Z_]\w*)\s*\)/);
      if (scanfMatch && !scanfMatch[1].startsWith('&')) {
        findings.push({
          id: `det-c-scanf-${lineNum}`,
          summary: `Missing address-of (&) operator in scanf`,
          severity: 'Error',
          bugCategory: 'Format Specifiers & Pointers',
          lineNumber: lineNum,
          lineRange: `${lineNum}`,
          originalCodeExcerpt: line,
          explanation: `scanf expects the memory address (&${scanfMatch[1]}) to write parsed input into. Passing '${scanfMatch[1]}' without '&' passes its raw value, causing an immediate segmentation fault.`,
          correctedCode: line.replace(new RegExp(`,\\s*${scanfMatch[1]}\\s*\\)`), `, &${scanfMatch[1]})`),
          whyFixWorks: 'Supplies the memory address of the target variable to scanf for writing.',
          confidenceLevel: '95% (High Estimate)'
        });
      }

      // Check accidental single = in if statement
      if (trimmed.startsWith('if') && /if\s*\([^=!<>\n]*=[^=][^)\n]*\)/.test(trimmed)) {
        findings.push({
          id: `det-c-assign-${lineNum}`,
          summary: `Accidental assignment '=' inside conditional`,
          severity: 'Warning',
          bugCategory: 'Conditional Logic',
          lineNumber: lineNum,
          lineRange: `${lineNum}`,
          originalCodeExcerpt: line,
          explanation: `Single '=' is the assignment operator in C. The condition evaluates the assigned value rather than comparing with '=='.`,
          correctedCode: line.replace(/(\w+)\s*=\s*(\w+)/, '$1 == $2'),
          whyFixWorks: 'Replaces assignment with equality comparison.',
          confidenceLevel: '90% (High Estimate)'
        });
      }

      // Check returning address of local stack variable
      if (trimmed.startsWith('return &') && !trimmed.includes('static')) {
        findings.push({
          id: `det-c-return-stack-${lineNum}`,
          summary: 'Returning address of local stack variable',
          severity: 'Error',
          bugCategory: 'Pointers & Memory',
          lineNumber: lineNum,
          lineRange: `${lineNum}`,
          originalCodeExcerpt: line,
          explanation: 'Local stack variables are deallocated when their enclosing function returns. Returning their address creates a dangling pointer.',
          correctedCode: '// Allocate memory dynamically with malloc() or pass buffer from caller',
          whyFixWorks: 'Guarantees the referenced memory remains valid after the function frame terminates.',
          confidenceLevel: '95% (High Estimate)'
        });
      }

      // Check off-by-one loop boundary (e.g. for (int i = 0; i <= size; i++))
      const loopMatch = trimmed.match(/for\s*\(\s*int\s+(\w+)\s*=\s*0\s*;\s*\1\s*<=\s*(\w+)\s*;/);
      if (loopMatch) {
        findings.push({
          id: `det-c-off-by-one-${lineNum}`,
          summary: `Potential off-by-one buffer boundary in for-loop ('<=' instead of '<')`,
          severity: 'Warning',
          bugCategory: 'Boundary & Indexing',
          lineNumber: lineNum,
          lineRange: `${lineNum}`,
          originalCodeExcerpt: line,
          explanation: `0-indexed arrays of size N have valid indices 0 to N-1. Iterating with '<= ${loopMatch[2]}' attempts to access index ${loopMatch[2]}, which is past the buffer boundary.`,
          correctedCode: line.replace(`<= ${loopMatch[2]}`, `< ${loopMatch[2]}`),
          whyFixWorks: 'Restricts loop iterations strictly to valid 0-indexed bounds [0, size - 1].',
          confidenceLevel: '85% (High Estimate)'
        });
      }

      // Check missing semicolon on statements
      if (
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(':') &&
        !trimmed.startsWith('#') &&
        (trimmed.startsWith('return ') ||
          trimmed.startsWith('int ') ||
          trimmed.startsWith('float ') ||
          trimmed.startsWith('double ') ||
          trimmed.startsWith('char ') ||
          trimmed.includes('printf(') ||
          trimmed.includes('scanf('))
      ) {
        findings.push({
          id: `det-c-semicolon-${lineNum}`,
          summary: 'Missing terminating semicolon (;)',
          severity: 'Error',
          bugCategory: 'Syntax Error',
          lineNumber: lineNum,
          lineRange: `${lineNum}`,
          originalCodeExcerpt: line,
          explanation: 'In C, statement expressions must be explicitly terminated with a semicolon.',
          correctedCode: `${line};`,
          whyFixWorks: 'Adds the required C statement terminator.',
          confidenceLevel: '95% (High Estimate)'
        });
      }
    });

    // Check bracket balance
    let braceCount = 0;
    for (const char of code) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    if (braceCount !== 0) {
      findings.push({
        id: 'det-c-unbalanced-braces',
        summary: `Unbalanced curly braces ({ and })`,
        severity: 'Error',
        bugCategory: 'Syntax Error',
        lineNumber: totalLines,
        lineRange: `${totalLines}`,
        originalCodeExcerpt: lines[totalLines - 1] || '',
        explanation: `Found ${braceCount > 0 ? `${braceCount} unclosed open brace(s)` : `${Math.abs(braceCount)} extra closing brace(s)`}.`,
        correctedCode: braceCount > 0 ? '}\n'.repeat(braceCount) : '',
        whyFixWorks: 'Ensures all scope blocks are properly closed.',
        confidenceLevel: '99% (High Estimate)'
      });
    }
  }

  if (language === 'python') {
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      // 1. Check mutable default arguments in functions
      if (/def\s+\w+\s*\([^)]*=\s*(\[\]|\{\}|set\(\))/.test(line)) {
        findings.push({
          id: `det-py-mutable-default-${lineNum}`,
          summary: 'Mutable default argument in function signature',
          severity: 'Warning',
          bugCategory: 'Mutable Defaults',
          lineNumber: lineNum,
          lineRange: `${lineNum}`,
          originalCodeExcerpt: line,
          explanation: 'Default argument expressions in Python are evaluated once when defined. The mutable object is shared across every call, accumulating unexpected state.',
          correctedCode: line.replace(/=\s*\[\]/, '=None').replace(/=\s*\{\}/, '=None'),
          whyFixWorks: 'Sets default parameter to None and initializes a fresh collection inside the function body.',
          confidenceLevel: '95% (High Estimate)'
        });
      }

      // 2. Check bare except
      if (trimmed === 'except:') {
        findings.push({
          id: `det-py-bare-except-${lineNum}`,
          summary: 'Bare except: clause catches BaseException',
          severity: 'Suggestion',
          bugCategory: 'Exception Handling',
          lineNumber: lineNum,
          lineRange: `${lineNum}`,
          originalCodeExcerpt: line,
          explanation: 'A bare except intercepts KeyboardInterrupt, SystemExit, and memory errors, masking true failure causes.',
          correctedCode: line.replace('except:', 'except Exception:'),
          whyFixWorks: 'Catches standard application exceptions while allowing system exit signals to pass through.',
          confidenceLevel: '90% (High Estimate)'
        });
      }

      // 3. Comparison with None using == instead of is
      if (trimmed.includes('== None') || trimmed.includes('!= None')) {
        findings.push({
          id: `det-py-none-equality-${lineNum}`,
          summary: 'Comparison with None using equality operator instead of identity',
          severity: 'Suggestion',
          bugCategory: 'Identity vs Equality',
          lineNumber: lineNum,
          lineRange: `${lineNum}`,
          originalCodeExcerpt: line,
          explanation: 'Comparisons to singletons like None should always be done with "is" or "is not", never equality operators (PEP 8).',
          correctedCode: line.replace(/==\s*None/, 'is None').replace(/!=\s*None/, 'is not None'),
          whyFixWorks: 'Adheres to PEP 8 standard identity comparison for singleton None.',
          confidenceLevel: '95% (High Estimate)'
        });
      }

      // 4. Missing colon at end of block statements
      const needsColon = /^(def\s+\w+|if\s+.*|elif\s+.*|else|for\s+.*|while\s+.*|try|except.*|class\s+.*)$/;
      if (needsColon.test(trimmed) && !trimmed.endsWith(':')) {
        findings.push({
          id: `det-py-missing-colon-${lineNum}`,
          summary: 'Missing colon (:) at end of statement header',
          severity: 'Error',
          bugCategory: 'Syntax Error',
          lineNumber: lineNum,
          lineRange: `${lineNum}`,
          originalCodeExcerpt: line,
          explanation: 'Compound statement headers in Python (def, if, for, while, class) must terminate with a colon.',
          correctedCode: `${line}:`,
          whyFixWorks: 'Adds the syntactically required colon to introduce an indented block.',
          confidenceLevel: '99% (High Estimate)'
        });
      }

      // 5. Modifying list while iterating with for loop
      if (trimmed.startsWith('for ') && trimmed.includes(' in ')) {
        const loopTargetMatch = trimmed.match(/for\s+(\w+)\s+in\s+(\w+)\s*:/);
        if (loopTargetMatch) {
          const listName = loopTargetMatch[2];
          // Check following lines within the same block for remove/append
          for (let subIdx = idx + 1; subIdx < Math.min(lines.length, idx + 6); subIdx++) {
            const subLine = lines[subIdx];
            if (subLine.includes(`${listName}.remove(`) || subLine.includes(`${listName}.pop(`)) {
              findings.push({
                id: `det-py-mutate-iter-${subIdx + 1}`,
                summary: `Modifying collection '${listName}' while iterating over it`,
                severity: 'Warning',
                bugCategory: 'Collection Mutation',
                lineNumber: subIdx + 1,
                lineRange: `${subIdx + 1}`,
                originalCodeExcerpt: subLine,
                explanation: `Modifying a list's length during iteration shifts internal slice indices, causing elements to be skipped silently.`,
                correctedCode: line.replace(`in ${listName}:`, `in ${listName}[:]:`),
                whyFixWorks: `Iterate over a shallow copy (${listName}[:]) or list comprehension rather than mutating in place.`,
                confidenceLevel: '90% (High Estimate)'
              });
              break;
            }
          }
        }
      }
    });

    // 6. Mixed indentation check
    const hasTabs = lines.some((l) => l.startsWith('\t'));
    const hasSpaces = lines.some((l) => l.startsWith('    '));
    if (hasTabs && hasSpaces) {
      findings.push({
        id: 'det-py-mixed-indentation',
        summary: 'Inconsistent indentation: mixing tabs and spaces',
        severity: 'Error',
        bugCategory: 'Indentation Error',
        lineNumber: 1,
        lineRange: '1',
        originalCodeExcerpt: lines[0] || '',
        explanation: 'Python 3 disallows mixing tabs and spaces for indentation within the same file (TabError).',
        correctedCode: '# Convert all tab characters to 4 spaces',
        whyFixWorks: 'Adheres to PEP 8 standard 4-space indentation across all blocks.',
        confidenceLevel: '99% (High Estimate)'
      });
    }
  }

  return findings;
}

// ==========================================
// GEMINI DEEP ANALYSIS
// ==========================================
export async function handleScanCode(payload: ScanRequestPayload) {
  // 1. Input validation
  if (!payload || !payload.code || !payload.code.trim()) {
    return {
      success: false,
      findings: [],
      hasBugs: false,
      summaryMessage: 'No code provided. Please paste or write code in the editor to scan.',
      isAiGenerated: false,
      error: 'Code cannot be empty.'
    };
  }

  if (payload.code.length > 25000) {
    return {
      success: false,
      findings: [],
      hasBugs: false,
      summaryMessage: 'Code snippet exceeds maximum supported length (25,000 characters).',
      isAiGenerated: false,
      error: 'Code exceeds 25,000 characters limit.'
    };
  }

  const language = payload.language === 'python' ? 'python' : 'c';
  const code = payload.code;
  const userIntent = payload.expectedBehavior?.trim();

  // 2. Run deterministic pre-checks
  const deterministicFindings = runDeterministicChecks(language, code);

  // 3. Check for API key
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    const hasBugs = deterministicFindings.length > 0;
    return {
      success: true,
      findings: deterministicFindings,
      hasBugs,
      summaryMessage: hasBugs
        ? `Identified ${deterministicFindings.length} issue(s) via local static analysis. Note: GEMINI_API_KEY is not configured on this server, so deep AI semantic analysis was skipped.`
        : 'Local static analysis did not identify obvious syntax or logic defects. Note: GEMINI_API_KEY is not configured on this server for deep AI semantic analysis.',
      isAiGenerated: false
    };
  }

  // 4. Prompt Gemini for structured bug findings
  try {
    const prompt = `You are BugTrail AI Scanner, an expert code analyzer for university students writing ${language.toUpperCase()}.
Analyze this code for syntax errors, logical bugs, memory bugs, boundary mistakes, resource leaks, or bad practices.

Pasted Code:
\`\`\`${language}
${code}
\`\`\`

${userIntent ? `Student's Expected Behavior:\n"${userIntent}"\n` : ''}

Instructions:
1. Identify all genuine bugs, probable logic errors, syntax mistakes, or dangerous behaviors.
2. If there are NO detectable bugs or defects, return an empty array [].
3. For each finding, return a JSON object with:
   - "summary": A concise title (e.g. "Missing & in scanf", "Off-by-one loop boundary")
   - "severity": Must be exactly one of: "Error", "Warning", or "Suggestion"
   - "bugCategory": e.g. "Memory Management", "Syntax Error", "Logic Bug", "Indexing", "Types"
   - "lineNumber": Exact 1-indexed line number where the issue occurs, or null if uncertain.
   - "lineRange": A string like "5" or "5-7", or null if uncertain.
   - "originalCodeExcerpt": The exact line or lines from the input code that cause the problem.
   - "explanation": Beginner-friendly explanation of why this bug manifests.
   - "correctedCode": The minimal corrected replacement line or lines.
   - "whyFixWorks": Why this fix resolves the problem.
   - "confidenceLevel": An estimated percentage like "95% (High Estimate)" or "80% (Medium Estimate)".

Return ONLY a valid JSON array of objects. Do not wrap in markdown quotes if possible, or use \`\`\`json.`;

    const aiResult = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction: 'You are an automated code analysis engine. Output strictly a JSON array of bug findings matching the requested schema.',
      responseMimeType: 'application/json',
      temperature: 0.2,
      timeoutMs: 25000
    });

    let rawText = aiResult.text.trim();
    // Clean potential markdown fences
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsedFindings: any[] = [];
    try {
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) {
        parsedFindings = parsed;
      } else if (parsed && Array.isArray(parsed.findings)) {
        parsedFindings = parsed.findings;
      }
    } catch {
      // JSON parse error handled gracefully
    }

    // Sanitize and validate model findings
    const totalLines = code.split('\n').length;
    const sanitizedAiFindings: ScanFinding[] = parsedFindings.map((f, idx) => {
      let lineNum: number | null = null;
      if (typeof f.lineNumber === 'number' && f.lineNumber >= 1 && f.lineNumber <= totalLines) {
        lineNum = Math.floor(f.lineNumber);
      }

      let severity: FindingSeverity = 'Warning';
      if (f.severity === 'Error' || f.severity === 'Suggestion') {
        severity = f.severity;
      }

      return {
        id: `ai-finding-${idx + 1}`,
        summary: String(f.summary || 'Potential Issue Detected'),
        severity,
        bugCategory: String(f.bugCategory || 'Code Logic'),
        lineNumber: lineNum,
        lineRange: f.lineRange ? String(f.lineRange) : (lineNum ? String(lineNum) : null),
        originalCodeExcerpt: String(f.originalCodeExcerpt || ''),
        explanation: String(f.explanation || 'Issue detected by AI analysis.'),
        correctedCode: String(f.correctedCode || ''),
        whyFixWorks: String(f.whyFixWorks || 'Resolves the identified issue.'),
        confidenceLevel: String(f.confidenceLevel || '85% (Estimated)')
      };
    });

    // Merge deterministic findings with AI findings (deduplicating by line number and category)
    const combinedFindings: ScanFinding[] = [...deterministicFindings];
    for (const aiFinding of sanitizedAiFindings) {
      const duplicate = combinedFindings.some(
        (df) => df.lineNumber && df.lineNumber === aiFinding.lineNumber && df.bugCategory === aiFinding.bugCategory
      );
      if (!duplicate) {
        combinedFindings.push(aiFinding);
      }
    }

    // Sort findings by severity: Error first, then Warning, then Suggestion
    const severityOrder: Record<FindingSeverity, number> = { Error: 1, Warning: 2, Suggestion: 3 };
    combinedFindings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const hasBugs = combinedFindings.length > 0;
    const summaryMessage = hasBugs
      ? `Analysis complete. Found ${combinedFindings.length} potential issue${combinedFindings.length === 1 ? '' : 's'}. Review the findings and apply verified fixes below.`
      : 'No likely bugs or critical defects were detected by the scanner. Note: Automated analysis cannot guarantee 100% bug-free behavior across all execution paths.';

    return {
      success: true,
      findings: combinedFindings,
      hasBugs,
      summaryMessage,
      isAiGenerated: true
    };
  } catch (err: any) {
    // If AI fails, return deterministic findings with clear status message
    const errorMsg = parseGeminiError(err);
    const hasBugs = deterministicFindings.length > 0;
    return {
      success: true,
      findings: deterministicFindings,
      hasBugs,
      summaryMessage: hasBugs
        ? `Identified ${deterministicFindings.length} issue(s) via local static checks. Deep AI scan encountered: ${errorMsg}`
        : `Deep AI analysis service unavailable (${errorMsg}). No basic syntax defects found by local pre-check.`,
      isAiGenerated: false,
      error: errorMsg
    };
  }
}
