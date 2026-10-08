import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Send,
  Bot,
  User,
  Copy,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Code2,
  Wand2,
  FileCode,
  Layers,
  ChevronDown,
} from 'lucide-react';
import type { SkillRecord } from '../types/skill';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  codeBlocks?: string[];
}

interface GeminiChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
  onApplySkillMarkdown?: (markdown: string) => void;
  activeSkill?: SkillRecord | null;
}

const STARTER_PROMPTS = [
  {
    title: 'Draft a New Skill',
    prompt: 'Help me draft a complete production-grade SKILL.md for a GitHub pull request reviewer.',
  },
  {
    title: 'Convert to 4-Layer Strobes',
    prompt: 'How do I architect an automated penetration testing skill using the Strobes 4-Layer methodology and SQLite state?',
  },
  {
    title: 'Audit Zero-Pill Discipline',
    prompt: 'What are the rules of Zero-Pill discipline in skill authoring, and how do I remove empty conversational fluff?',
  },
  {
    title: 'Design Parameters Schema',
    prompt: 'Generate an explicit parametersSchema with type constraints for an automated cloud infrastructure validator.',
  },
];

export const GeminiChatBot: React.FC<GeminiChatBotProps> = ({
  isOpen,
  onToggle,
  onApplySkillMarkdown,
  activeSkill,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hello! I'm your **Gemini Skill Architect Copilot** powered by \`gemini-3.8-flash\`.

I can help you:
- **Design & scaffold new skills** conforming to the 4 architecture standards
- **Structure parameter schemas & triggers** for autonomous tool selection
- **Enforce Zero-Pill discipline** and progressive disclosure rules
- **Audit existing SKILL.md files** for schema invariance

What kind of agent skill would you like to build today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Extract code blocks from text
  const extractCodeBlocks = (text: string): string[] => {
    const blocks: string[] = [];
    const regex = /```(?:markdown|yaml|typescript|json)?([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[1] && match[1].trim().length > 0) {
        blocks.push(match[1].trim());
      }
    }
    return blocks;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputValue).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const conversationPayload = messages
        .filter((m) => m.id !== 'welcome')
        .concat(userMessage)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Optional active skill context
      const context = activeSkill
        ? {
            activeSkillName: activeSkill.name,
            activeSkillTitle: activeSkill.title,
            activeSkillCategory: activeSkill.category,
            activeSkillDescription: activeSkill.description,
            activeSkillRuntime: activeSkill.runtime,
          }
        : undefined;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationPayload,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || 'No response returned from Gemini.';
      const codeBlocks = extractCodeBlocks(replyText);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ Failed to get a response from Gemini: ${err?.message || 'Network error'}. Please verify server connection and try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBlockId(id);
    setTimeout(() => setCopiedBlockId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: `Chat history cleared. What skill or architecture question can I help you with?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Button (FAB) when chat is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white rounded-full shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105 cursor-pointer border border-white/20 active:scale-95"
          title="Open Gemini Skill Architect Copilot"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
          </div>
          <span className="font-semibold text-xs tracking-wide">Gemini Copilot</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/20 text-white">
            Gemini GenAI
          </span>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 backdrop-blur-xl ${
            isExpanded
              ? 'w-[95vw] sm:w-[680px] h-[85vh] max-h-[820px]'
              : 'w-[95vw] sm:w-[460px] h-[620px]'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-0.5 flex items-center justify-center shadow-xs">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">Gemini Copilot</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    gemini-3.8-flash
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Skill Architecture &amp; SKILL.md Authoring Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Clear Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? 'Restore Size' : 'Expand View'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Bar (if a skill is selected) */}
          {activeSkill && (
            <div className="px-4 py-1.5 bg-indigo-950/40 border-b border-indigo-900/40 flex items-center justify-between text-[11px] text-indigo-300">
              <span className="flex items-center gap-1.5 truncate">
                <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">Context: <strong>{activeSkill.title}</strong> ({activeSkill.category})</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-400 shrink-0">Attached</span>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}

                  <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {/* Formatted Markdown-like Text Rendering */}
                      <div className="whitespace-pre-wrap font-sans space-y-2">
                        {msg.content}
                      </div>

                      <div
                        className={`text-[9px] font-mono mt-1 text-right ${
                          isUser ? 'text-indigo-200' : 'text-slate-500'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>

                    {/* Code Block Action Pill (if model generated markdown code) */}
                    {msg.codeBlocks && msg.codeBlocks.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {msg.codeBlocks.map((block, bIdx) => (
                          <div
                            key={bIdx}
                            className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                          >
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Generated SKILL Blueprint ({block.length} chars)</span>
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleCopyCode(block, `${msg.id}-${bIdx}`)}
                                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-md text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                              >
                                {copiedBlockId === `${msg.id}-${bIdx}` ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              {onApplySkillMarkdown && (
                                <button
                                  onClick={() => onApplySkillMarkdown(block)}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[10px] font-medium flex items-center gap-1 cursor-pointer"
                                  title="Load this generated skill directly into the Skill Authoring Studio"
                                >
                                  <Wand2 className="w-3 h-3" />
                                  <span>Apply to Editor</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl rounded-bl-xs flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>Gemini is thinking &amp; architecting...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Prompts (if chat is fresh) */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60">
              <span className="text-[10px] font-mono text-slate-400 block mb-1.5 uppercase tracking-wider">
                Quick Starters:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {STARTER_PROMPTS.map((starter, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSendMessage(starter.prompt)}
                    className="p-2 text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-[11px] text-slate-300 transition-all cursor-pointer truncate"
                  >
                    <span className="font-semibold block text-indigo-300 truncate">
                      {starter.title}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {starter.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-slate-900 border border-slate-800 focus-within:border-indigo-500/80 rounded-2xl px-3 py-2 transition-colors"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask Gemini to draft, audit, or format a skill..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-hidden disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="mt-1.5 px-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Powered by @google/genai (gemini-3.8-flash)</span>
              <span>Zero-Pill Compliant</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
