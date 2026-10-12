import React, { useState } from 'react';
import { api } from '../services/api';
import { ProviderProfile } from '../types';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Star,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  matchedProviders?: Array<{
    id: string;
    businessName: string;
    tagline: string;
    rating: number;
    reviewCount: number;
    startingRate: number;
    verificationBadgeLabel: string;
    avatarUrl: string;
    matchReason: string;
  }>;
}

interface AIAssistantWidgetProps {
  onSelectProviderForBooking?: (provider: ProviderProfile) => void;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({ onSelectProviderForBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello! I am your HumanHelp Service Discovery Assistant. Tell me what service you need (e.g. *'I need an electrician for an EV charger'*, *'Math tutor under $70/hr'*, or *'Wi-Fi diagnostic'*) and I will match you with real, verified professionals.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    'Need an electrician for tripped breaker',
    'Calculus tutor under $70/hr',
    'Whole-home mesh Wi-Fi network setup',
    'Companion care for elderly parent'
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsTyping(true);

    try {
      const response = await api.ai.chat(textToSend);
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        matchedProviders: response.matchedProviders,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'I encountered an error connecting to the discovery engine. Please try again or browse categories manually.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleBookFromCard = async (providerId: string) => {
    try {
      const fullProvider = await api.providers.getById(providerId);
      if (onSelectProviderForBooking) {
        onSelectProviderForBooking(fullProvider);
        setIsOpen(false);
      }
    } catch (err) {
      alert('Could not open booking modal: ' + err);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 text-white dark:bg-brand-600 dark:hover:bg-brand-500 hover:bg-slate-800 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-slate-700/50"
          title="Open AI Service Discovery Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-teal-300 animate-pulse" />
          </div>
          <span className="font-semibold text-xs tracking-wide">AI Matcher</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </button>
      )}

      {/* Floating window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md h-[580px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 text-teal-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">AI Service Matcher</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Real Data • Zero Hallucinations</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2.5`}>
                  <div
                    className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      m.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-br-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Matched provider cards */}
                  {m.matchedProviders && m.matchedProviders.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {m.matchedProviders.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-brand-500 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 mb-2">
                            <img
                              src={p.avatarUrl}
                              alt={p.businessName}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                                {p.businessName}
                              </h5>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{p.rating}</span>
                                <span>({p.reviewCount} reviews)</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mb-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{p.matchReason}</span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              ${p.startingRate}/hr
                            </span>
                            <button
                              onClick={() => handleBookFromCard(p.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-2xs"
                            >
                              <span>Book Now</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-500" />
                <span>Checking verified provider database...</span>
              </div>
            )}
          </div>

          {/* Quick prompt suggestions */}
          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {samplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:text-brand-600 transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask: 'Electrician for EV charger under $100'..."
              className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
