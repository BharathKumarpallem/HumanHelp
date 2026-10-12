import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Conversation, Message } from '../types';
import { Link } from 'react-router-dom';
import { 
  Send, 
  MessageSquare, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  User, 
  RefreshCw,
  Search
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user, role } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await api.messages.getConversations(user.id);
        setConversations(data);
        if (data.length > 0 && !activeConv) {
          setActiveConv(data[0]);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, [user]);

  // Load active thread messages
  useEffect(() => {
    if (!activeConv) return;
    const fetchThread = async () => {
      try {
        const msgs = await api.messages.getThread(activeConv.id);
        setMessages(msgs);
      } catch (err) {
        console.error('Failed to load thread:', err);
      }
    };
    fetchThread();
  }, [activeConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || !user) return;

    setIsSending(true);
    const textToSend = inputText;
    setInputText('');

    try {
      const newMsg = await api.messages.sendMessage({
        conversationId: activeConv.id,
        senderId: user.id,
        text: textToSend,
      });

      setMessages((prev) => [...prev, newMsg]);

      // Update last message in active conversation
      setActiveConv((prev) => prev ? { ...prev, lastMessage: textToSend } : null);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConv.id ? { ...c, lastMessage: textToSend } : c))
      );
    } catch (err) {
      alert('Failed to send message: ' + err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Secure Service Messenger
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Keep communications within HumanHelp to retain full dispute and escrow protection.
        </p>
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[680px]">
        {/* LEFT: Conversation Threads List */}
        <aside className="border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/40">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900 dark:text-white">Conversations</span>
            <span className="text-[11px] text-slate-500">{conversations.length} total</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoading ? (
              <div className="text-center py-10 text-xs text-slate-400">Loading threads...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 p-4">
                No active booking conversations.
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                const contactName = role === 'provider' ? conv.customerName : conv.providerName;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <img
                      src={conv.providerAvatar}
                      alt={contactName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {contactName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 truncate">
                        {conv.serviceTitle}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT: Active Conversation View */}
        <main className="md:col-span-2 flex flex-col h-full bg-white dark:bg-slate-900">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <img
                    src={activeConv.providerAvatar}
                    alt={activeConv.providerName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {role === 'provider' ? activeConv.customerName : activeConv.providerName}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Re: {activeConv.serviceTitle}
                    </p>
                  </div>
                </div>

                {activeConv.bookingId && (
                  <Link
                    to="/bookings"
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>View Booking</span>
                  </Link>
                )}
              </div>

              {/* Message List */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3.5 text-xs">
                {messages.map((m) => {
                  const isMine = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{m.senderName}</span>
                        <span>•</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl max-w-[80%] leading-relaxed ${
                          isMine
                            ? 'bg-brand-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message or clarify appointment details..."
                  className="flex-1 input-field py-2 text-xs"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="btn-primary py-2 px-4 text-xs font-semibold"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Select a conversation thread to view messages.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
