import { callGeminiWithFallback, parseGeminiError, getGeminiApiKey } from './geminiService.ts';

export interface ExplainRequestPayload {
  language: string;
  title: string;
  faultyCode: string;
  correctedCode: string;
  rootCause: string;
  userQuestion?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; text: string }>;
}

/**
 * Deterministic pedagogical tutor fallback generator.
 * Runs 100% locally when no Gemini API key is present or when offline.
 */
function generateCurriculumTutorExplanation(payload: ExplainRequestPayload): string {
  const q = payload.userQuestion?.trim().toLowerCase();
  const lang = payload.language.toUpperCase();

  let contextSpecificAnswer = '';
  if (q) {
    if (q.includes('why') || q.includes('how') || q.includes('cause')) {
      contextSpecificAnswer = `**Regarding your question ("${payload.userQuestion}"):**\nThis issue stems directly from how ${lang} handles underlying execution semantics. Specifically:\n${payload.rootCause}\n\n`;
    } else if (q.includes('fix') || q.includes('prevent') || q.includes('avoid')) {
      contextSpecificAnswer = `**How to prevent this in practice:**\nAlways follow defensive programming conventions in ${lang}. Ensure variables, memory allocations, and boundary conditions are explicitly bounded and verified before use.\n\n`;
    } else {
      contextSpecificAnswer = `**Inquiry context:** Addressing "${payload.userQuestion}" in ${lang}:\n`;
    }
  }

  return `${contextSpecificAnswer}### 1. Root Cause Breakdown
${payload.rootCause}

### 2. Beginner Mental Model Pitfall
Beginner programmers frequently assume the program will automatically infer developer intent. In ${lang}, the compiler/runtime strictly executes syntactic instructions verbatim without inferring missing memory references or runtime guards.

### 3. How the Verified Solution Works
\`\`\`${payload.language}
${payload.correctedCode}
\`\`\`
The corrected version resolves the defect by providing explicit, safe semantics that adhere to language standards and prevent undefined behavior or unhandled exceptions.

### 4. Debugger Pro-Tip
When diagnosing bugs like this in ${lang}, inspect the variable addresses, state modifications, and loop invariants one step prior to the failure line using standard debugging tools (e.g., GDB/LLDB for C, pdb or breakpoint() for Python).`;
}

export async function handleExplain(payload: ExplainRequestPayload) {
  // 1. Validate payload
  if (!payload || !payload.title || !payload.faultyCode) {
    return {
      success: false,
      error: 'Invalid request: missing challenge context.',
      isAiGenerated: false
    };
  }

  // 2. Limit excessive input sizes
  const totalLength = (payload.faultyCode || '').length + (payload.userQuestion || '').length;
  if (totalLength > 15000) {
    return {
      success: false,
      error: 'Request exceeds maximum allowed size (15KB). Please submit a shorter question.',
      isAiGenerated: false
    };
  }

  // 3. Check for API key
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      success: true,
      explanation: generateCurriculumTutorExplanation(payload),
      isAiGenerated: false,
      notice: 'API key not configured in this environment. Showing verified curriculum explanation from BugTrail AI offline engine.'
    };
  }

  // 4. Call Gemini AI Tutor
  try {
    const studentQuery = payload.userQuestion?.trim();
    
    // Build conversation context if available
    let historyContext = '';
    if (payload.conversationHistory && payload.conversationHistory.length > 0) {
      historyContext = '\nPrevious Tutor Conversation Context:\n' +
        payload.conversationHistory
          .slice(-4)
          .map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
          .join('\n') + '\n';
    }

    const prompt = `You are BugTrail AI Tutor, an empathetic and pedagogical programming instructor for college computer science students learning C and Python debugging.

Challenge Title: ${payload.title}
Target Language: ${payload.language.toUpperCase()}

Verified Root Cause:
${payload.rootCause}

Faulty Code Excerpt:
\`\`\`${payload.language}
${payload.faultyCode}
\`\`\`

Authoritative Correct Fix:
\`\`\`${payload.language}
${payload.correctedCode}
\`\`\`
${historyContext}
Student's Inquiry:
${studentQuery ? `"${studentQuery}"` : 'Explain the underlying issue and provide intuitive mental models for debugging it.'}

Pedagogical Guidelines:
1. Explain the concepts step-by-step with clear, accessible mental models (no overly academic jargon).
2. Answer the student's specific question directly if one was provided.
3. Highlight common mental pitfalls that cause beginners to make this mistake.
4. Keep the response structured, supportive, and engaging using clean markdown bullet points.`;

    const result = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction: 'You are BugTrail AI Tutor, an expert computer science debugging mentor. Guide students step-by-step with intuition, guiding questions, and clear mental models.',
      temperature: 0.35,
      timeoutMs: 25000
    });

    return {
      success: true,
      explanation: result.text,
      isAiGenerated: true
    };
  } catch (err: any) {
    // Graceful fallback to curriculum explanation if AI call fails
    return {
      success: true,
      explanation: generateCurriculumTutorExplanation(payload),
      isAiGenerated: false,
      notice: `AI service unavailable (${parseGeminiError(err)}). Showing verified offline curriculum explanation.`
    };
  }
}
