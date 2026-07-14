'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, Bot, Phone, Clock } from 'lucide-react';
import { ChatMessage } from '@/types/car';
import { generateCustomerId, generateMessageId } from '@/lib/utils';
import { format } from 'date-fns';

const STORAGE_KEY = 'travelnj_customer_id';
const NAME_KEY = 'travelnj_customer_name';

const QUICK_REPLIES = [
  "What cars are currently available?",
  "Do you offer financing options?",
  "Can I schedule a test drive?",
  "What documents are required for purchase?",
  "Do you accept trade-ins?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize customer identity
  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_KEY);
    const storedName = localStorage.getItem(NAME_KEY);
    if (storedId) setCustomerId(storedId);
    if (storedName) { setCustomerName(storedName); setNameSet(true); }
  }, []);

  const startChat = () => {
    if (!customerName.trim()) return;
    const id = generateCustomerId();
    localStorage.setItem(STORAGE_KEY, id);
    localStorage.setItem(NAME_KEY, customerName);
    setCustomerId(id);
    setNameSet(true);

    // Welcome message from admin
    const welcome: ChatMessage = {
      id: generateMessageId(),
      customerId: id,
      customerName,
      message: `👋 Hi ${customerName}! Welcome to TravelNJoy. I'm here to help you find your perfect car. How can I assist you today?`,
      sender: 'admin',
      timestamp: new Date().toISOString(),
      read: true,
    };
    setMessages([welcome]);
  };

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!nameSet || !customerId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?customerId=${customerId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages?.length > 0) {
            setMessages(data.messages);
          }
        }
      } catch { /* use local state */ }
    };

    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [nameSet, customerId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const msg: ChatMessage = {
      id: generateMessageId(),
      customerId,
      customerName,
      message: input.trim(),
      sender: 'customer',
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, msg]);
    setInput('');
    setSending(true);

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
    } catch { /* message displayed locally */ }

    setSending(false);
    inputRef.current?.focus();
  };

  const sendQuickReply = (text: string) => {
    setInput(text);
    setTimeout(sendMessage, 100);
  };

  if (!nameSet) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="w-full max-w-md">
          {/* Decorative */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 gradient-purple rounded-full flex items-center justify-center mx-auto mb-4 glow animate-pulse-glow">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-[var(--font-outfit)] text-white mb-2">
              Chat with <span className="gradient-text">Us</span>
            </h1>
            <p className="text-gray-400">
              Get instant answers from our car experts. Tell us your name to begin.
            </p>
          </div>

          <div className="glass rounded-2xl p-8 border border-purple-900/30">
            <label className="text-sm text-purple-300 font-medium block mb-3">Your Name</label>
            <input
              type="text"
              placeholder="Enter your name..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startChat()}
              className="input-dark mb-4 text-lg"
              autoFocus
            />
            <button
              onClick={startChat}
              disabled={!customerName.trim()}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Chatting →
            </button>

            <div className="mt-6 pt-5 border-t border-purple-900/30 flex items-center gap-3">
              <Phone className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <p className="text-sm text-gray-400">
                Prefer a call? Reach us at{' '}
                <a href="tel:+919999999999" className="text-purple-400 hover:text-purple-300">
                  +91 99999 99999
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-6 px-4">
      <div className="container-max">
        <div className="max-w-3xl mx-auto">
          {/* Chat header */}
          <div className="glass rounded-t-2xl border border-purple-900/30 border-b-0 p-4 flex items-center gap-4">
            <div className="w-12 h-12 gradient-purple rounded-full flex items-center justify-center glow-sm">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-white">TravelNJoy Support</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">Online — typically replies instantly</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <User className="w-4 h-4" />
              {customerName}
            </div>
          </div>

          {/* Messages */}
          <div
            className="bg-[#0D0D18] border border-purple-900/30 border-t-0 border-b-0"
            style={{ height: '55vh', overflowY: 'auto' }}
          >
            <div className="p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'customer' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold ${
                      msg.sender === 'admin' ? 'gradient-purple' : 'bg-purple-900/50 border border-purple-600/40'
                    }`}
                  >
                    {msg.sender === 'admin' ? <Bot className="w-4 h-4" /> : customerName[0]?.toUpperCase()}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[75%] ${msg.sender === 'customer' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div
                      className={`px-4 py-3 text-sm leading-relaxed ${
                        msg.sender === 'customer' ? 'chat-bubble-customer text-white' : 'chat-bubble-admin text-gray-200'
                      }`}
                    >
                      {msg.message}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 px-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(msg.timestamp), 'h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="bg-[#0D0D18] border border-purple-900/30 border-t-0 border-b-0 px-4 pb-3">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => {
                      setInput(qr);
                    }}
                    className="text-xs px-3 py-1.5 glass border border-purple-900/40 rounded-full text-purple-300 hover:bg-purple-600/20 transition-all"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="glass rounded-b-2xl border border-purple-900/30 border-t-0 p-4 flex gap-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              className="input-dark flex-1"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="btn-primary px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
