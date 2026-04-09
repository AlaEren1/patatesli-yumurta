"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BrainCircuit, CreditCard, LayoutGrid, Trash2, RotateCcw } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useVocabStore } from '@/store/useVocabStore';
import { useAuth } from '@/components/AuthProvider';

export default function PracticeRoom() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { hasOnboarded, targetLanguage } = useUserStore();
  const { words, removeWord, syncFromSupabase } = useVocabStore();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'list' | 'flashcard'>('list');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (!hasOnboarded) {
        router.push('/onboarding');
      }
    }
  }, [hasOnboarded, user, authLoading, mounted, router]);

  useEffect(() => {
    if (user && mounted) {
      syncFromSupabase(user.id);
    }
  }, [user, mounted, syncFromSupabase]);

  if (!mounted || authLoading || !user || !hasOnboarded) return null;

  // Filter words to only practice words in the currently selected language
  const myWords = words.filter(w => w.language === targetLanguage);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 p-6 md:p-12 font-sans animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
           <div>
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 shadow-sm border border-amber-500/30">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100">Vocab Practice</h1>
              </div>
              <p className="text-slate-400 text-lg">You have <span className="font-bold text-amber-400">{myWords.length}</span> words saved in {targetLanguage}.</p>
           </div>
           
           <div className="flex bg-[#141A29] p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setMode('list')}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all ${mode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Vault</span>
              </button>
              <button 
                onClick={() => setMode('flashcard')}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all ${mode === 'flashcard' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Flashcards</span>
              </button>
           </div>
        </header>

        {myWords.length === 0 ? (
          <div className="py-24 text-center text-slate-400 bg-[#141A29] rounded-3xl border border-white/5 shadow-sm">
            <BrainCircuit className="w-12 h-12 mx-auto text-amber-500/50 mb-4" />
            <p className="text-xl font-medium text-slate-300">Your Vault is empty!</p>
            <p className="mt-2 text-slate-500">Go to The Library, read a story, and click on words to save them here.</p>
            <Link href="/reading-room" className="inline-block mt-6 px-6 py-3 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl font-bold transition-all">Go to Library</Link>
          </div>
        ) : mode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myWords.map(w => (
              <div key={w.id} className="p-5 bg-[#141A29] rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex justify-between items-start group">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{w.word}</h3>
                  <p className="text-indigo-400 font-medium mb-3">{w.translation}</p>
                  <p className="text-sm text-slate-500 italic">"{w.context}"</p>
                </div>
                <button onClick={() => removeWord(w.id, user.id)} className="text-slate-600 hover:text-rose-400 transition-colors p-2 opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <FlashcardMode words={myWords} />
        )}
      </div>
    </div>
  );
}

function FlashcardMode({ words }: { words: any[] }) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Failsafe in case words change while in flashcard mode
  if (words.length === 0) return null;
  const currentWord = words[index % words.length];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 250);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-300">
      <div className="w-full max-w-lg [perspective:1000px]">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full h-80 transition-transform duration-500 cursor-pointer [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
        >
          {/* Front */}
          <div className={`absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-indigo-900/40 to-[#141A29] border border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl`}>
             <span className="absolute top-6 left-6 text-indigo-500/50 text-xs font-bold uppercase tracking-widest border border-indigo-500/20 px-2 py-1 rounded">Target</span>
             <h2 className="text-5xl font-extrabold text-white tracking-tight">{currentWord.word}</h2>
             <p className="mt-8 text-slate-400 italic text-lg max-w-xs leading-relaxed">"{currentWord.context}"</p>
             <p className="absolute bottom-6 text-slate-600 text-sm font-medium flex items-center space-x-2"><RotateCcw className="w-4 h-4"/> <span>Tap to flip</span></p>
          </div>
          
          {/* Back */}
          <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-amber-900/30 to-[#141A29] border border-amber-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl`}>
             <span className="absolute top-6 left-6 text-amber-500/50 text-xs font-bold uppercase tracking-widest border border-amber-500/20 px-2 py-1 rounded">English</span>
             <h2 className="text-4xl font-extrabold text-amber-400 tracking-tight">{currentWord.translation}</h2>
             <p className="absolute bottom-6 text-slate-600 text-sm font-medium flex items-center space-x-2"><RotateCcw className="w-4 h-4"/> <span>Tap to flip</span></p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-12 w-full max-w-lg">
        <button onClick={handleNext} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-bold transition-all border border-white/5 active:scale-[0.98]">
           Skip
        </button>
        <button onClick={handleNext} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-[0.98]">
           Next Word
        </button>
      </div>
      
      <p className="text-slate-500 mt-8 font-medium bg-[#141A29] px-4 py-1.5 rounded-full border border-white/5 shadow-sm">Card {index + 1} of {words.length}</p>
    </div>
  );
}
