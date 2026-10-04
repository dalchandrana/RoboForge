import React, { useState, useEffect, useRef } from 'react';
import {
  type CoachMessage,
  type HintLevel,
  type CoachContext,
  type OllamaStatus,
  checkHardwareSafety,
  checkOllamaHealth,
  streamCoachChat,
  getAuthoredHints,
  buildContextSummary,
  HINT_LEVEL_NAMES,
} from '@roboforge/coach';
import { Button, Badge, Callout } from '@roboforge/ui';

interface CoachPanelProps {
  context?: CoachContext;
  onNavigateLesson?: (lessonId: string) => void;
}

export const CoachPanel: React.FC<CoachPanelProps> = ({ context }) => {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm your RoboForge Socratic AI Coach 🤖. I'm here to help guide you through circuits and robotics by asking questions, providing hints, and helping you discover solutions on your own! What are you working on right now?",
      timestamp: Date.now(),
      hintLevel: 1,
    },
  ]);

  const [input, setInput] = useState('');
  const [hintLevel, setHintLevel] = useState<HintLevel>(1);
  const [aiOffMode, setAiOffMode] = useState(false);
  const [showContextInspector, setShowContextInspector] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.2:3b');
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({
    available: false,
    installedModels: [],
    recommendedModelInstalled: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check Ollama health on mount
  useEffect(() => {
    async function checkHealth() {
      const status = await checkOllamaHealth();
      setOllamaStatus(status);
      if (status.installedModels.length > 0 && !status.installedModels.includes(selectedModel)) {
        setSelectedModel(status.installedModels[0]!);
      }
    }
    checkHealth();
  }, [selectedModel]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isGenerating) return;

    setInput('');

    // 1. Hardware Safety Guardrail Check
    const safetyCheck = checkHardwareSafety(query);
    if (!safetyCheck.isSafe) {
      const userMsg: CoachMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query,
        timestamp: Date.now(),
      };
      const safetyMsg: CoachMessage = {
        id: `safety-${Date.now()}`,
        role: 'safety_alert',
        content: safetyCheck.safetyGuidance || 'High-voltage or hazardous activity detected.',
        timestamp: Date.now() + 1,
      };
      setMessages(prev => [...prev, userMsg, safetyMsg]);
      return;
    }

    const userMessage: CoachMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
      hintLevel,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    // 2. Handle AI-Off Mode or Ollama Offline
    if (aiOffMode || !ollamaStatus.available) {
      const authoredHint = getAuthoredHints(query, hintLevel);
      const assistantMessage: CoachMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: authoredHint,
        timestamp: Date.now() + 1,
        hintLevel,
        modelUsed: aiOffMode ? 'Authored Hints (AI-Off)' : 'Authored Fallback',
      };
      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsGenerating(false);
      }, 400);
      return;
    }

    // 3. Local Ollama Streaming Generation
    const assistantMessageId = `assistant-${Date.now()}`;
    const initialAssistantMessage: CoachMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      hintLevel,
      modelUsed: selectedModel,
      isStreaming: true,
    };

    setMessages(prev => [...prev, initialAssistantMessage]);

    try {
      await streamCoachChat(
        {
          model: selectedModel,
          hintLevel,
          context,
          messages: [...messages, userMessage],
          onToken: token => {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMessageId ? { ...m, content: m.content + token } : m,
              ),
            );
          },
        },
        'http://127.0.0.1:11434',
      );
    } catch {
      // Fallback gracefully to authored hints if connection drops mid-stream
      const fallback = getAuthoredHints(query, hintLevel);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessageId
            ? {
                ...m,
                content:
                  m.content ||
                  `[Local AI Unavailable]: ${fallback}\n\n(Tip: Run 'ollama serve' or enable AI-Off mode).`,
                isStreaming: false,
              }
            : m,
        ),
      );
    } finally {
      setIsGenerating(false);
      setMessages(prev =>
        prev.map(m => (m.id === assistantMessageId ? { ...m, isStreaming: false } : m)),
      );
    }
  };

  const contextSummary = buildContextSummary(
    context || {
      lessonTitle: 'Module 1: Electricity Basics',
      lessonId: 'm01-l01',
    },
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto bg-surface border border-border-subtle rounded-2xl shadow-xl overflow-hidden font-sans">
      {/* Top Header & Settings Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-subtle border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="Coach robot">
            💬
          </span>
          <div>
            <h2 className="text-base font-bold text-text-main flex items-center gap-2">
              Socratic AI Coach
              <Badge
                variant={aiOffMode ? 'secondary' : ollamaStatus.available ? 'success' : 'warning'}
              >
                {aiOffMode
                  ? 'AI-Off Mode'
                  : ollamaStatus.available
                    ? `Ollama: ${selectedModel}`
                    : 'Ollama Offline'}
              </Badge>
            </h2>
            <p className="text-xs text-text-muted">
              100% private, on-device mentoring. Guiding questions, never spoilers.
            </p>
          </div>
        </div>

        {/* AI-Off Mode Toggle & Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setAiOffMode(!aiOffMode)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              aiOffMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                : 'bg-surface text-text-muted hover:text-text-main border border-border-subtle'
            }`}
          >
            {aiOffMode ? '✓ AI-Off Mode Active' : 'Enable AI-Off'}
          </button>

          <button
            type="button"
            onClick={() => setShowContextInspector(!showContextInspector)}
            className="px-3 py-1.5 rounded-xl font-medium bg-surface text-text-muted hover:text-text-main border border-border-subtle transition-all"
          >
            {showContextInspector ? 'Hide Context' : '👁️ What I Can See'}
          </button>
        </div>
      </div>

      {/* Hint Ladder Bar (Level 0 to 4) */}
      <div className="bg-surface px-4 py-2.5 border-b border-border-subtle flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-text-muted">Hint Level:</span>
          <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-xl border border-border-subtle">
            {([0, 1, 2, 3, 4] as const).map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => setHintLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  hintLevel === lvl
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-text-muted hover:text-text-main'
                }`}
                title={HINT_LEVEL_NAMES[lvl].title}
              >
                L{lvl}
              </button>
            ))}
          </div>
        </div>
        <div className="text-text-muted italic truncate max-w-md hidden sm:inline">
          {HINT_LEVEL_NAMES[hintLevel].description}
        </div>
      </div>

      {/* Transparent Context Inspector (Collapsible) */}
      {showContextInspector && (
        <div className="p-4 bg-slate-900 border-b border-slate-700 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <span>Transparent RAG Context Passed to Prompt</span>
            <span>Zero telemetry</span>
          </div>
          <pre className="whitespace-pre-wrap text-slate-200 leading-relaxed">{contextSummary}</pre>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.role === 'safety_alert' ? (
              <div className="w-full max-w-2xl">
                <Callout type="safety" title="⚠️ Hardware Safety Intercept">
                  {msg.content}
                </Callout>
              </div>
            ) : (
              <div
                className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed space-y-2 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-sky-500 text-white rounded-tr-sm'
                    : 'bg-surface-subtle text-text-main border border-border-subtle rounded-tl-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 font-mono mb-1">
                  <span>{msg.role === 'user' ? 'You' : 'RoboForge Coach'}</span>
                  {msg.hintLevel !== undefined && msg.role === 'assistant' && (
                    <span className="bg-slate-800/40 px-1.5 py-0.5 rounded">
                      Level {msg.hintLevel} Hint
                    </span>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-sky-400 animate-pulse ml-1 align-middle"></span>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-surface-subtle border-t border-border-subtle flex flex-wrap gap-1.5 text-xs">
        <span className="text-text-muted text-[11px] self-center mr-1">Suggestions:</span>
        {[
          'Why is my LED not lighting up?',
          'What is the formula for current limiting?',
          'Explain closed circuit loop',
          'What happens during short circuit?',
        ].map((chip, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(chip)}
            className="px-2.5 py-1 rounded-lg bg-surface border border-border-subtle hover:border-sky-500/50 hover:text-sky-400 text-text-muted transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 bg-surface border-t border-border-subtle flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask a question about your circuit or lesson (e.g. 'Why did my LED burn out?')..."
          className="flex-1 bg-surface-subtle border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <Button
          variant="primary"
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || isGenerating}
        >
          {isGenerating ? 'Thinking...' : 'Ask Coach'}
        </Button>
      </div>
    </div>
  );
};
