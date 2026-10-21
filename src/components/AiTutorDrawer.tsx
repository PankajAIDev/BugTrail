import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Copy,
  Check,
  HelpCircle,
  Lock,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { Challenge } from '../types';

interface AiTutorDrawerProps {
  challenge: Challenge;
  isUnlocked: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isAi?: boolean;
  notice?: string;
}

const QUICK_PROMPTS = [
  'Why does this bug happen in practice?',
  'What is the compiler doing here?',
  'How do senior coders avoid this?',
  'What unit tests catch this defect?'
];

export const AiTutorDrawer: React.FC<AiTutorDrawerProps> = ({
  challenge,
  isUnlocked
}) => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setUserQuestion('');
    setLoading(false);
  }, [challenge.id]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const getFallbackText = (query?: string) => {
    let specificAnswer = '';
    if (query) {
      specificAnswer = `**In response to your inquiry ("${query}"):**\nThis issue directly stems from ${challenge.category} in ${challenge.language.toUpperCase()}.\n\n`;
    }

    return `${specificAnswer}### 1. Root Cause Analysis
${challenge.rootCause}

### 2. Expected Program Behavior
${challenge.expectedBehavior}

### 3. Key Mental Model
In ${challenge.language.toUpperCase()}, the runtime executes syntactic instructions verbatim. When writing ${challenge.category.toLowerCase()} logic, always ensure boundary constraints and explicit references are verified before dereferencing or indexing.`;
  };

  const fetchAiExplanation = async (customPrompt?: string) => {
    const promptToSend = customPrompt || userQuestion.trim();
    if (!promptToSend && messages.length > 0) return;

    setLoading(true);

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `ai-${Date.now() + 1}`;

    if (promptToSend) {
      setMessages((prev) => [
        ...prev,
        { id: userMessageId, role: 'user', text: promptToSend }
      ]);
      setUserQuestion('');
    }

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          language: challenge.language,
          title: challenge.title,
          faultyCode: challenge.faultyCode,
          correctedCode: challenge.correctedCode,
          rootCause: challenge.rootCause,
          userQuestion: promptToSend || undefined,
          conversationHistory: historyPayload
        })
      });

      const data = await response.json();

      if (data.success && data.explanation) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: 'assistant',
            text: data.explanation,
            isAi: Boolean(data.isAiGenerated),
            notice: data.notice
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: 'assistant',
            text: getFallbackText(promptToSend),
            isAi: false,
            notice: data.error || 'Showing verified offline curriculum tutor explanation.'
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          text: getFallbackText(promptToSend),
          isAi: false,
          notice: 'Network offline. Showing verified curriculum tutor explanation.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="card-brutal-lavender p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#2F2E33]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] flex items-center justify-center text-[#2F2E33]">
            <Bot className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold font-display text-[#2F2E33]">
              Ask AI Tutor
            </h3>
            <p className="text-[11px] font-bold text-[#2F2E33]/80">
              Interactive Coding Mentor
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs font-extrabold text-[#2F2E33] hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Body */}
      <div className="space-y-4">
        {!isUnlocked && messages.length === 0 && (
          <div className="p-4 bg-white border-2 border-[#2F2E33] rounded-xl shadow-[2px_2px_0px_#2F2E33] text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E5E0FA] border-2 border-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] flex items-center justify-center mx-auto text-[#2F2E33]">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-[#2F2E33]">
                Tutor Ready to Assist
              </h4>
              <p className="text-[11px] font-bold text-[#858B98]">
                Submit your diagnosis or click Reveal Solution to unlock full AI tutor breakdowns.
              </p>
            </div>
            <button
              onClick={() => fetchAiExplanation('Can you provide a conceptual hint about this category without giving away the answer?')}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 mx-auto"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ask Conceptual Hint</span>
            </button>
          </div>
        )}

        {isUnlocked && messages.length === 0 && !loading && (
          <div className="text-center space-y-3">
            <p className="text-xs font-bold text-[#2F2E33]">
              Have questions about why this bug manifests or how the compiler operates?
            </p>

            <button
              onClick={() => fetchAiExplanation()}
              disabled={loading}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Tutor Breakdown</span>
            </button>

            <div className="pt-2 flex flex-wrap gap-1.5 justify-center">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => fetchAiExplanation(prompt)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border-2 border-[#2F2E33] text-[11px] font-extrabold text-[#2F2E33] shadow-[2px_2px_0px_#2F2E33] hover:-translate-y-0.5 active:translate-y-0 transition-transform"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] font-extrabold text-[#2F2E33] mb-1">
                    {isUser ? 'You' : 'AI Tutor'}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs font-bold leading-relaxed border-2 border-[#2F2E33] shadow-[3px_3px_0px_#2F2E33] max-w-[90%] whitespace-pre-wrap ${
                      isUser ? 'bg-white text-[#2F2E33]' : 'bg-[#FFF9F4] text-[#2F2E33]'
                    }`}
                  >
                    {msg.notice && (
                      <div className="mb-2 p-2 bg-[#FFB8B0] border border-[#2F2E33] rounded-lg text-[10px] font-bold text-[#2F2E33]">
                        {msg.notice}
                      </div>
                    )}
                    <div>{msg.text}</div>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="p-3 bg-white border-2 border-[#2F2E33] rounded-xl text-xs font-bold text-[#2F2E33] animate-pulse">
                ⚡ Tutor is generating explanation...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {(messages.length > 0 || isUnlocked) && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (userQuestion.trim()) fetchAiExplanation();
            }}
            className="flex items-center gap-2 pt-2 border-t-2 border-[#2F2E33]"
          >
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 text-xs bg-white border-2 border-[#2F2E33] rounded-xl font-bold text-[#2F2E33] focus:outline-none focus:ring-2 focus:ring-[#24C566] shadow-[2px_2px_0px_#2F2E33]"
            />
            <button
              type="submit"
              disabled={loading || !userQuestion.trim()}
              className="btn-primary text-xs !py-2 !px-3 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
