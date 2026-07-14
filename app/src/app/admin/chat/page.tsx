'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, User, Bot, Clock, MessageCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { ChatMessage, ChatSession } from '@/types/car';
import { generateMessageId } from '@/lib/utils';
import { format } from 'date-fns';

export default function AdminChatPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch { /* keep current sessions */ }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/me');
        if (!res.ok) router.push('/admin/login');
      } catch { router.push('/admin/login'); }
    };
    checkAuth();
    fetchSessions();
    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, [fetchSessions, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession, sessions]);

  const activeMessages = sessions.find(s => s.customerId === activeSession)?.messages || [];
  const filteredSessions = sessions.filter(s =>
    s.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const sendReply = async () => {
    if (!reply.trim() || !activeSession || sending) return;

    const session = sessions.find(s => s.customerId === activeSession);
    if (!session) return;

    const msg: ChatMessage = {
      id: generateMessageId(),
      customerId: activeSession,
      customerName: session.customerName,
      message: reply.trim(),
      sender: 'admin',
      timestamp: new Date().toISOString(),
      read: true,
    };

    setSending(true);
    setSessions(prev => prev.map(s =>
      s.customerId === activeSession
        ? { ...s, messages: [...s.messages, msg], lastMessage: msg.message, lastTimestamp: msg.timestamp }
        : s
    ));
    setReply('');

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
    } catch { /* kept locally */ }

    setSending(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-4 px-4">
      <div className="container-max">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="flex items-center gap-2 text-gray-400 hover:text-purple-300 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </Link>
          <span className="text-gray-700">/</span>
          <h1 className="text-2xl font-bold font-[var(--font-outfit)] text-white">
            Customer <span className="gradient-text">Messages</span>
          </h1>
        </div>

        <div className="glass rounded-2xl border border-purple-900/30 overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="flex h-full">
            {/* Session List */}
            <div className="w-72 border-r border-purple-900/30 flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-purple-900/20">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-dark pl-9 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <MessageCircle className="w-12 h-12 text-purple-900 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No conversations yet</p>
                    <p className="text-xs text-gray-600 mt-1">Customers from the chat page will appear here</p>
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <button
                      key={session.customerId}
                      onClick={() => setActiveSession(session.customerId)}
                      className={`w-full text-left p-4 border-b border-purple-900/20 hover:bg-purple-600/10 transition-all ${
                        activeSession === session.customerId ? 'bg-purple-600/15 border-l-2 border-l-purple-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 gradient-purple rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {session.customerName[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-white truncate">{session.customerName}</p>
                            {session.unreadCount > 0 && (
                              <span className="w-5 h-5 gradient-purple rounded-full text-xs flex items-center justify-center text-white font-bold flex-shrink-0">
                                {session.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{session.lastMessage}</p>
                          <p className="text-xs text-gray-700 mt-1">
                            {format(new Date(session.lastTimestamp), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeSession ? (
                <>
                  {/* Chat header */}
                  <div className="p-4 border-b border-purple-900/20 flex items-center gap-3">
                    <div className="w-9 h-9 gradient-purple rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {sessions.find(s => s.customerId === activeSession)?.customerName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {sessions.find(s => s.customerId === activeSession)?.customerName}
                      </p>
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Active
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeMessages.map((msg) => (
                      <div key={msg.id} className={`flex gap-3 ${msg.sender === 'admin' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${msg.sender === 'admin' ? 'gradient-purple' : 'bg-[#1A1A2E] border border-purple-900/40'}`}>
                          {msg.sender === 'admin' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className={`max-w-[70%] flex flex-col gap-1 ${msg.sender === 'admin' ? 'items-end' : ''}`}>
                          <div className={`px-4 py-2.5 text-sm leading-relaxed ${msg.sender === 'admin' ? 'chat-bubble-customer text-white' : 'chat-bubble-admin text-gray-200'}`}>
                            {msg.message}
                          </div>
                          <div className="flex items-center gap-1 px-1 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            {format(new Date(msg.timestamp), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply input */}
                  <div className="p-4 border-t border-purple-900/20 flex gap-3">
                    <input
                      type="text"
                      placeholder="Type your reply..."
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                      className="input-dark flex-1"
                    />
                    <button
                      onClick={sendReply}
                      disabled={!reply.trim() || sending}
                      className="btn-primary px-4 py-3 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 glass rounded-full flex items-center justify-center mb-6">
                    <MessageCircle className="w-10 h-10 text-purple-900" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Select a Conversation</h3>
                  <p className="text-gray-400 text-sm">Choose a customer from the left to view and reply to their messages.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
