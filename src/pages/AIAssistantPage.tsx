import React, { useState } from 'react';
import { api } from '../services/api';
import { ProviderProfile } from '../types';
import { BookingModal } from '../components/BookingModal';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw,
  Info
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

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Welcome to the HumanHelp AI Discovery Assistant.\n\nI can help you pinpoint the exact verified specialist you need. I never fabricate providers, fake reviews, or invent ratings — all suggestions come directly from our active database of verified professionals.\n\nWhat kind of human assistance are you looking for today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<ProviderProfile | null>(null);

  const sampleQuestions = [
    'I need an electrician for an EV charger installation',
    'Find a calculus tutor under $70/hr who offers online sessions',
    'Emergency plumber for leaking pipe with rapid response',
    'Mesh Wi-Fi network technician for home dead-zones',
    'Companion care for elderly parent requiring daily errands'
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
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Unable to reach the service discovery engine. Please try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleBookFromCard = async (providerId: string) => {
    try {
      const p = await api.providers.getById(providerId);
      setSelectedProviderForBooking(p);
    } catch (err) {
      alert('Failed to load provider: ' + err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Intelligent Provider Matcher</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          AI Service Discovery Assistant
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Describe what you need in plain natural language. Our assistant checks real provider credentials, pricing, and availability.
        </p>
      </div>

      {/* Main Chat Box */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[640px]">
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="max-w-[85%] space-y-3">
                <div
                  className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs'
                  }`}
                >
                  {m.text}
                </div>

                {/* Sourced provider cards */}
                {m.matchedProviders && m.matchedProviders.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {m.matchedProviders.map((prov) => (
                      <div
                        key={prov.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prov.avatarUrl}
                            alt={prov.businessName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {prov.businessName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-slate-800 dark:text-slate-200">{prov.rating}</span>
                              <span>({prov.reviewCount} reviews)</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{prov.matchReason}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block">From</span>
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">${prov.startingRate}/hr</span>
                          </div>
                          <button
                            onClick={() => handleBookFromCard(prov.id)}
                            className="btn-primary py-1.5 px-3.5 text-xs font-semibold"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-600" />
              <span>Analyzing requirements against real provider schedules...</span>
            </div>
          )}
        </div>

        {/* Sample prompt pills */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-400 font-medium shrink-0">Try asking:</span>
          {sampleQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:text-brand-600 transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your service requirements (e.g. 'I need an electrician for tomorrow afternoon')..."
            className="flex-1 input-field py-2.5 text-xs"
          />
          <button
            onClick={() => handleSend()}
            disabled={isTyping || !input.trim()}
            className="btn-primary py-2.5 px-5 text-xs font-bold"
          >
            <Send className="w-4 h-4" />
            <span>Match</span>
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedProviderForBooking && (
        <BookingModal
          provider={selectedProviderForBooking}
          onClose={() => setSelectedProviderForBooking(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
