"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BrainCircuit, CreditCard, LayoutGrid, Trash2, RotateCcw, Zap, Trophy, Timer } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useVocabStore } from '@/store/useVocabStore';
import { useAuth } from '@/components/AuthProvider';

export default function PracticeRoom() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { hasOnboarded, targetLanguage } = useUserStore();
  const { words, removeWord, syncFromSupabase } = useVocabStore();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'list' | 'flashcard' | 'matching'>('list');

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
              <button 
                onClick={() => setMode('matching')}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all ${mode === 'matching' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Zap className="w-4 h-4" />
                <span>Matching</span>
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
        ) : mode === 'flashcard' ? (
          <FlashcardMode words={myWords} />
        ) : (
          <MatchingGame words={myWords} />
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

interface Tile {
  id: string;
  wordId: string;
  content: string;
  type: 'word' | 'translation';
}

function MatchingGame({ words }: { words: any[] }) {
  const [status, setStatus] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selections, setSelections] = useState<Tile[]>([]);
  const [matches, setMatches] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finishedTime, setFinishedTime] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const startGame = (count: number) => {
    // Determine actual count (cannot exceed available words)
    const actualCount = count === -1 ? words.length : Math.min(count, words.length);
    
    // Pick random words
    const shuffledWords = [...words].sort(() => Math.random() - 0.5).slice(0, actualCount);
    
    // Create pairs
    const gameTiles: Tile[] = [];
    shuffledWords.forEach(w => {
      gameTiles.push({
        id: `word-${w.id}`,
        wordId: w.id,
        content: w.word,
        type: 'word'
      });
      gameTiles.push({
        id: `trans-${w.id}`,
        wordId: w.id,
        content: w.translation,
        type: 'translation'
      });
    });

    // Shuffle tiles
    setTiles(gameTiles.sort(() => Math.random() - 0.5));
    setMatches([]);
    setSelections([]);
    setScore(0);
    setStartTime(Date.now());
    setStatus('playing');
  };

  const handleTileClick = (tile: Tile) => {
    if (isChecking || matches.includes(tile.wordId) || selections.some(s => s.id === tile.id)) return;

    const newSelections = [...selections, tile];
    setSelections(newSelections);

    if (newSelections.length === 2) {
      setIsChecking(true);
      const [first, second] = newSelections;

      if (first.wordId === second.wordId && first.type !== second.type) {
        // Match!
        setTimeout(() => {
          setMatches(prev => [...prev, first.wordId]);
          setSelections([]);
          setScore(prev => prev + 1);
          setIsChecking(false);

          if (matches.length + 1 === tiles.length / 2) {
            setFinishedTime(Date.now());
            setStatus('finished');
          }
        }, 400);
      } else {
        // Mismatch
        setTimeout(() => {
          setSelections([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  if (status === 'setup') {
    return (
      <div className="py-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-[#141A29] p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl max-w-2xl w-full text-center">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400 mx-auto mb-8 border border-indigo-500/30">
            <Zap className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Matching Game</h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Test your memory! Match the target language words with their translations as fast as you can.
          </p>

          <div className="space-y-6">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Select Number of Pairs</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[5, 10, 15, -1].map((n) => {
                const label = n === -1 ? 'All' : n;
                const disabled = n !== -1 && words.length < n;
                return (
                  <button
                    key={n}
                    disabled={disabled}
                    onClick={() => setSelectedCount(n)}
                    className={`py-4 rounded-2xl font-bold transition-all border ${
                      selectedCount === n 
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]' 
                        : disabled 
                          ? 'bg-white/5 border-transparent text-slate-700 cursor-not-allowed'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => startGame(selectedCount)}
              disabled={words.length < 5}
              className="w-full mt-8 py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-black text-xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              Start Game
            </button>
            {words.length < 5 && (
              <p className="text-rose-400 text-sm font-medium">You need at least 5 words to play.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    const timeTaken = Math.floor(((finishedTime || 0) - (startTime || 0)) / 1000);
    return (
      <div className="py-12 flex flex-col items-center animate-in zoom-in-95 duration-500">
        <div className="bg-[#141A29] p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
          {/* Confetti-like background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[100px] rounded-full"></div>
          
          <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 mx-auto mb-8 border-4 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-bounce">
            <Trophy className="w-12 h-12" />
          </div>
          
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Magnificent!</h2>
          <p className="text-indigo-400 font-bold text-xl mb-10">You've matched all pairs!</p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-center text-slate-500 mb-2 space-x-2">
                <Timer className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Time</span>
              </div>
              <p className="text-3xl font-black text-white">{timeTaken}<span className="text-sm ml-1 text-slate-400">s</span></p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-center text-slate-500 mb-2 space-x-2">
                <BrainCircuit className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Pairs</span>
              </div>
              <p className="text-3xl font-black text-white">{tiles.length / 2}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setStatus('setup')}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98]"
            >
              Play Again
            </button>
            <button 
              onClick={() => window.location.reload()} // Quick way to go back to list
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-bold transition-all border border-white/5"
            >
              Back to Vault
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center space-x-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Progress</p>
            <p className="text-2xl font-black text-white tracking-tight">{matches.length} / {tiles.length / 2}</p>
          </div>
          <div className="h-10 w-px bg-white/10 hidden md:block"></div>
          <button 
            onClick={() => setStatus('setup')}
            className="text-slate-500 hover:text-slate-300 transition-colors text-sm font-bold flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Abandon Game</span>
          </button>
        </div>
        
        <div className="bg-amber-500/10 border border-amber-500/20 px-6 py-3 rounded-2xl flex items-center space-x-4 shadow-sm">
           <Timer className="w-5 h-5 text-amber-500" />
           <span className="text-xl font-mono font-black text-amber-400 tabular-nums">
              {Math.floor(((startTime ? Date.now() - startTime : 0)) / 1000)}s
           </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tiles.map((tile) => {
          const isMatched = matches.includes(tile.wordId);
          const isSelected = selections.some(s => s.id === tile.id);
          const isIncorrect = selections.length === 2 && !isMatched && isSelected;
          
          return (
            <button
              key={tile.id}
              disabled={isMatched || isChecking}
              onClick={() => handleTileClick(tile)}
              className={`
                h-32 p-4 rounded-2xl border-2 transition-all duration-300 text-center flex items-center justify-center font-bold text-lg leading-tight break-words
                ${isMatched 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500/50 scale-95 opacity-50' 
                  : isSelected 
                    ? isIncorrect
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-shake'
                      : 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] scale-105 z-10'
                    : 'bg-[#141A29] border-white/5 text-slate-300 hover:border-white/20 hover:bg-[#1A2235]'
                }
              `}
            >
              {tile.content}
              {isMatched && (
                <div className="absolute top-2 right-2">
                   <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                      <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                   </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Dynamic styles for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
