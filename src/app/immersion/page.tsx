"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MessageSquare, 
  Plane, 
  Coffee, 
  Users, 
  Send, 
  Sparkles, 
  ChevronRight, 
  Info,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { useAuth } from '@/components/AuthProvider';
import TapToTranslateText from '@/components/TapToTranslateText';
import { t } from '@/lib/i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  initialMessage: string;
  color: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'airport',
    title: 'Airport Check-in',
    description: 'Practice checking in your luggage and flight details with a staff member.',
    icon: <Plane className="w-6 h-6" />,
    initialMessage: "¡Hola! Bienvenido al aeropuerto. ¿A dónde viaja hoy y tiene su pasaporte listo?",
    color: 'blue'
  },
  {
    id: 'cafe',
    title: 'Modern Café',
    description: 'Order your favorite drink and pastry in a bustling city café.',
    icon: <Coffee className="w-6 h-6" />,
    initialMessage: "¡Buenos días! ¿Qué le gustaría tomar hoy? Tenemos café recién hecho y pasteles deliciosos.",
    color: 'amber'
  },
  {
    id: 'friend',
    title: 'Meeting a Friend',
    description: 'Catch up with a friend you haven\'t seen in a while and talk about plans.',
    icon: <Users className="w-6 h-6" />,
    initialMessage: "¡Oye! ¡Tanto tiempo sin verte! ¿Cómo has estado? ¿Qué planes tienes para el fin de semana?",
    color: 'emerald'
  }
];

export default function ImmersionLab() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { hasOnboarded, targetLanguage, level, uiLanguage } = useUserStore();
  
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{ analysis: string, correction: string | null } | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !authLoading) {
      if (!user) router.push('/auth');
      else if (!hasOnboarded) router.push('/onboarding');
    }
  }, [user, authLoading, hasOnboarded, mounted, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!mounted || authLoading || !user || !hasOnboarded) return null;

  const startScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([{ role: 'assistant', content: scenario.initialMessage }]);
    setLastFeedback(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !selectedScenario) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          scenario: selectedScenario.title,
          language: targetLanguage,
          level: level,
          uiLanguage: uiLanguage
        })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      setLastFeedback({ analysis: data.analysis, correction: data.correction });
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  if (!selectedScenario) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-200 p-6 md:p-12 font-sans animate-in fade-in duration-500">
        <div className="max-w-4xl mx-auto space-y-12">
          <Link href="/" className="inline-flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            <span>{t('back_to_dashboard', uiLanguage)}</span>
          </Link>

          <header className="text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400 mx-auto shadow-lg border border-indigo-500/30">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{t('immersion_welcome', uiLanguage)}</h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              {t('immersion_subtitle', uiLanguage)}
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => startScenario(s)}
                className="group relative flex flex-col items-start p-8 bg-[#141A29] rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl text-left"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border transition-colors ${
                  s.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  s.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">{s.description}</p>
                <div className="flex items-center text-indigo-400 font-bold text-sm">
                  <span>{t('start_roleplay', uiLanguage)}</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B0F19] flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Sidebar Control / Coach Info */}
      <aside className="w-full md:w-80 bg-[#0F1423] border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="flex items-center justify-between md:flex-col md:items-start md:gap-4">
          <button 
            onClick={() => setSelectedScenario(null)}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('exit_lab', uiLanguage)}</span>
          </button>
          
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                {selectedScenario.icon}
             </div>
             <div>
                <h2 className="text-sm font-bold text-white leading-tight">{selectedScenario.title}</h2>
                <div className="flex items-center space-x-1 text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-0.5">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span>{t('active_lab', uiLanguage)}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="h-px bg-white/5 hidden md:block"></div>

        {/* Coach Feedback Section */}
        <div className="space-y-4">
           <div className="flex items-center space-x-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">{t('ai_coach_feedback', uiLanguage)}</h3>
           </div>
           
           {!lastFeedback ? (
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-500 text-sm italic leading-relaxed">
                Send a message to receive instant coaching and grammar corrections.
             </div>
           ) : (
             <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                   <div className="flex items-center space-x-2 text-indigo-300">
                      <Info className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{t('analysis', uiLanguage)}</span>
                   </div>
                   <p className="text-sm text-slate-300 leading-relaxed font-medium">{lastFeedback.analysis}</p>
                </div>
                
                {lastFeedback.correction && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="flex items-center space-x-2 text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">{t('suggested_upgrade', uiLanguage)}</span>
                    </div>
                    <p className="text-sm text-amber-200/90 leading-relaxed underline decoration-amber-500/30 underline-offset-4">{lastFeedback.correction}</p>
                  </div>
                )}

                {lastFeedback && !lastFeedback.correction && (
                   <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm text-emerald-400 font-bold">{t('perfect_phrasing', uiLanguage)}</span>
                   </div>
                )}
             </div>
           )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-grow flex flex-col relative bg-[#0B0F19]">
        
        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth"
        >
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-3xl ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl' 
                  : 'bg-[#141A29] border border-white/10 rounded-tl-none shadow-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <TapToTranslateText text={msg.content} />
                ) : (
                  <p className="text-lg leading-relaxed">{msg.content}</p>
                )}
              </div>
              <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex flex-col items-start animate-pulse">
               <div className="bg-[#141A29] border border-white/10 p-5 rounded-3xl rounded-tl-none flex space-x-2 items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></div>
               </div>
               <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">AI Thinking...</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 md:p-12 pt-0">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center space-x-3 bg-[#141A29] p-2 pr-4 rounded-3xl border border-white/10 focus-within:border-indigo-500/50 transition-all shadow-2xl"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Reply in ${targetLanguage}...`}
              className="flex-grow bg-transparent border-none focus:ring-0 text-slate-200 py-4 px-6 text-lg placeholder:text-slate-600"
              disabled={isTyping || !selectedScenario}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:bg-slate-800 shadow-lg active:scale-95"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
          <div className="mt-4 flex justify-center items-center space-x-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
             <div className="flex items-center space-x-2">
                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                <span>Pro Immersion Mode</span>
             </div>
             <div className="flex items-center space-x-2">
                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                <span>Real-time Corrections</span>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
