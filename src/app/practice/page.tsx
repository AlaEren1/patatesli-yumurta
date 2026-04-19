"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BrainCircuit, CreditCard, LayoutGrid, Trash2, RotateCcw, Zap, Trophy, Timer, Edit, File, Check, X, BookOpen, Puzzle, AlarmClock } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useVocabStore } from '@/store/useVocabStore';
import { useAuth } from '@/components/AuthProvider';
import { t } from '@/lib/i18n';
import topItalianWords from '@/data/italian-top-words.json';

export default function PracticeRoom() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { hasOnboarded, targetLanguage, uiLanguage } = useUserStore();
  const { words, removeWord, syncFromSupabase } = useVocabStore();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'list' | 'flashcard' | 'matching' | 'quiz' | 'writing' | 'context' | 'top-words' | 'scramble' | 'falling'>('list');
  const [customSelectedWords, setCustomSelectedWords] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const search = new URLSearchParams(window.location.search);
    if (search.get('mode') === 'top-words') {
      setMode('top-words');
    }
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
          <span>{t('back_to_dashboard', uiLanguage)}</span>
        </Link>
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
           <div>
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 shadow-sm border border-amber-500/30">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100">{t('practice_title', uiLanguage)}</h1>
              </div>
              <p className="text-slate-400 text-lg">You have <span className="font-bold text-amber-400">{myWords.length}</span> {t('words_saved_in', uiLanguage)} {targetLanguage}.</p>
           </div>
           
            <div className="flex flex-wrap items-center bg-[#141A29] p-1 rounded-xl border border-white/5 gap-1">
               <button 
                onClick={() => setMode('list')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${mode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-sm">{t('practice_vault', uiLanguage)}</span>
              </button>
              <button 
                onClick={() => setMode('flashcard')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${mode === 'flashcard' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">{t('practice_flashcards', uiLanguage)}</span>
              </button>
              <button 
                onClick={() => setMode('matching')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${mode === 'matching' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm">{t('practice_matching', uiLanguage)}</span>
              </button>
              <button 
                onClick={() => setMode('quiz')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${mode === 'quiz' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Check className="w-4 h-4" />
                <span className="text-sm">{t('practice_quiz', uiLanguage)}</span>
              </button>
              <button 
                onClick={() => setMode('writing')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${mode === 'writing' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">{t('practice_writing', uiLanguage)}</span>
              </button>
              <button 
                onClick={() => setMode('context')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${mode === 'context' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <File className="w-4 h-4" />
                <span className="text-sm">{t('practice_context', uiLanguage)}</span>
              </button>
              <button 
                onClick={() => setMode('scramble')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${mode === 'scramble' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Puzzle className="w-4 h-4" />
                <span className="text-sm">Word Scramble</span>
              </button>
              <button 
                onClick={() => setMode('falling')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${mode === 'falling' ? 'bg-rose-500/20 text-rose-400 shadow-sm border border-rose-500/30' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <AlarmClock className="w-4 h-4" />
                <span className="text-sm">Time Attack</span>
              </button>
              {targetLanguage === 'Italian' && (
                <button 
                  onClick={() => setMode('top-words')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${mode === 'top-words' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-500 hover:text-amber-300/50'}`}
                >
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-amber-400/80">Top Vocab</span>
                </button>
              )}
           </div>

           {/* Floating Action Bar for Selected Words */}
           {customSelectedWords.length > 0 && (mode === 'list' || mode === 'top-words') && (
             <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 px-6 py-4 rounded-full shadow-2xl flex items-center space-x-6 border border-indigo-400 animate-in slide-in-from-bottom-10 fade-in duration-300">
                <span className="text-white font-bold">{customSelectedWords.length} Words Selected</span>
                <div className="flex space-x-2">
                   <button onClick={() => setMode('flashcard')} className="px-4 py-2 bg-indigo-800 hover:bg-indigo-900 text-indigo-100 rounded-xl font-bold transition-all text-sm">Flashcards</button>
                   <button onClick={() => setMode('scramble')} className="px-4 py-2 bg-indigo-800 hover:bg-indigo-900 text-indigo-100 rounded-xl font-bold transition-all text-sm">Scramble</button>
                   <button onClick={() => setMode('matching')} className="px-4 py-2 bg-indigo-800 hover:bg-indigo-900 text-indigo-100 rounded-xl font-bold transition-all text-sm">Matching</button>
                </div>
                <button onClick={() => setCustomSelectedWords([])} className="text-indigo-300 hover:text-white p-2 bg-indigo-800/50 rounded-full"><X className="w-4 h-4" /></button>
             </div>
           )}
        </header>

        {mode === 'top-words' ? (
          <TopWordsMode 
            myVaultWords={myWords} 
            customSelectedWords={customSelectedWords}
            onToggleWord={(w: any) => {
              if (customSelectedWords.some(s => s.id === w.id)) setCustomSelectedWords(prev => prev.filter(s => s.id !== w.id));
              else setCustomSelectedWords(prev => [...prev, w]);
            }}
            onClearSelection={() => setCustomSelectedWords([])}
            onStartPractice={(newMode: any) => setMode(newMode)}
          />
        ) : mode === 'list' ? (
          myWords.length === 0 ? (
            <div className="py-24 text-center text-slate-400 bg-[#141A29] rounded-3xl border border-white/5 shadow-sm">
              <BrainCircuit className="w-12 h-12 mx-auto text-amber-500/50 mb-4" />
              <p className="text-xl font-medium text-slate-300">Your Vault is empty!</p>
              <p className="mt-2 text-slate-500">Go to The Library, read a story, and click on words to save them here.</p>
              <Link href="/reading-room" className="inline-block mt-6 px-6 py-3 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl font-bold transition-all">Go to Library</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myWords.map(w => {
                 const isSelected = customSelectedWords.some(s => s.id === w.id);
                 return (
                  <div 
                    key={w.id} 
                    onClick={() => {
                      if (isSelected) setCustomSelectedWords(prev => prev.filter(s => s.id !== w.id));
                      else setCustomSelectedWords(prev => [...prev, w]);
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-start group ${isSelected ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-[#141A29] border-white/5 hover:border-indigo-500/30'}`}
                  >
                    <div className="flex space-x-4">
                      <div className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-400' : 'bg-transparent border-white/20 group-hover:border-indigo-400/50'}`}>
                         {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{w.word}</h3>
                        <p className="text-indigo-400 font-medium mb-3">{w.translation}</p>
                        <p className="text-sm text-slate-500 italic">"{w.context}"</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeWord(w.id, user.id); }} 
                      className="text-slate-600 hover:text-rose-400 transition-colors p-2 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                 );
              })}
            </div>
          )
        ) : myWords.length === 0 ? (
          <div className="py-24 text-center text-slate-400 bg-[#141A29] rounded-3xl border border-white/5 shadow-sm animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-6 border border-white/10">
                {mode === 'quiz' ? <Check className="w-8 h-8"/> : mode === 'writing' ? <Edit className="w-8 h-8"/> : mode === 'scramble' ? <Puzzle className="w-8 h-8"/> : mode === 'falling' ? <AlarmClock className="w-8 h-8"/> : <File className="w-8 h-8"/>}
              </div>
             <p className="text-xl font-bold text-slate-200 uppercase tracking-wide">Empty {mode} Challenge</p>
             <p className="mt-2 text-slate-500 max-w-md mx-auto">You need to save some words in your <b>Vault</b> before you can start the {mode} training.</p>
             <Link href="/reading-room" className="inline-block mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black transition-all shadow-lg active:scale-95">Find Words to Save</Link>
          </div>
        ) : mode === 'flashcard' ? (
          <FlashcardMode words={customSelectedWords.length > 0 ? customSelectedWords : myWords} />
        ) : mode === 'matching' ? (
          <MatchingGame words={customSelectedWords.length > 0 ? customSelectedWords : myWords} />
        ) : mode === 'quiz' ? (
          <QuizMode words={customSelectedWords.length > 0 ? customSelectedWords : myWords} />
        ) : mode === 'writing' ? (
          <WritingMode words={customSelectedWords.length > 0 ? customSelectedWords : myWords} />
        ) : mode === 'scramble' ? (
          <ScrambleMode words={customSelectedWords.length > 0 ? customSelectedWords : myWords} />
        ) : mode === 'falling' ? (
          <FallingMode words={customSelectedWords.length > 0 ? customSelectedWords : myWords} />
        ) : (
          <ContextMode words={customSelectedWords.length > 0 ? customSelectedWords : myWords} />
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

// --- NEW MODES ---

function QuizMode({ words }: { words: any[] }) {
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentWord = words[index % words.length];

  useEffect(() => {
    // Generate options
    const correct = currentWord.translation;
    const others = words
      .filter(w => w.id !== currentWord.id)
      .map(w => w.translation)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    setOptions([correct, ...others].sort(() => Math.random() - 0.5));
    setSelected(null);
    setIsCorrect(null);
  }, [index, currentWord, words]);

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === currentWord.translation;
    setIsCorrect(correct);
    
    setTimeout(() => {
       if (correct) {
         setIndex(prev => (prev + 1) % words.length);
       }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center py-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-xl bg-[#141A29] rounded-3xl border border-white/5 p-8 md:p-12 shadow-2xl relative">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2 block">Translate this word</span>
          <h2 className="text-5xl font-black text-white">{currentWord.word}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {options.map((opt, i) => {
            const isThisSelected = selected === opt;
            const isThisCorrect = opt === currentWord.translation;
            
            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={!!selected}
                className={`w-full py-5 px-6 rounded-2xl text-left font-bold text-lg transition-all border-2 flex justify-between items-center ${
                  selected 
                    ? isThisCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                      : isThisSelected
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                        : 'bg-white/5 border-transparent text-slate-600 opacity-50'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 active:scale-[0.98]'
                }`}
              >
                <span>{opt}</span>
                {selected && isThisCorrect && <Check className="w-6 h-6 text-emerald-500" />}
                {selected && isThisSelected && !isThisCorrect && <X className="w-6 h-6 text-rose-500" />}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-8 text-center animate-in slide-in-from-top-2 duration-300">
             <p className={`text-lg font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isCorrect ? 'Correct! Well done.' : `Not quite. It means "${currentWord.translation}"`}
             </p>
             {!isCorrect && (
               <button onClick={() => setIndex(prev => (prev + 1) % words.length)} className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 text-sm font-bold transition-all">
                  Try Next Word
               </button>
             )}
          </div>
        )}
      </div>
      <p className="text-slate-500 mt-8 font-medium">Word {index + 1} of {words.length}</p>
    </div>
  );
}

function WritingMode({ words }: { words: any[] }) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const currentWord = words[index % words.length];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;

    if (input.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setStatus('correct');
      setTimeout(() => {
        handleNext();
      }, 1500);
    } else {
      setStatus('incorrect');
    }
  };

  const handleNext = () => {
    setIndex(prev => (prev + 1) % words.length);
    setInput('');
    setStatus('idle');
  };

  return (
    <div className="flex flex-col items-center py-12 animate-in fade-in duration-500">
      <div className="w-full max-w-xl bg-[#141A29] rounded-3xl border border-white/5 p-8 md:p-12 shadow-2xl">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2 block">Write this word in target language</span>
          <h2 className="text-4xl font-black text-white mb-2">{currentWord.translation}</h2>
          <p className="text-slate-500 italic">"{currentWord.context}"</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              autoFocus
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status === 'correct'}
              placeholder="Type the word..."
              className={`w-full bg-white/5 border-2 rounded-2xl py-5 px-6 text-2xl font-bold text-white outline-none transition-all placeholder:text-slate-700 ${
                status === 'correct' ? 'border-emerald-500/50 bg-emerald-500/5' : 
                status === 'incorrect' ? 'border-rose-500/50 bg-rose-500/5 animate-shake' : 
                'border-white/5 focus:border-indigo-500/50 focus:bg-white/10'
              }`}
            />
            {status === 'correct' && <Check className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500" />}
          </div>

          <div className="flex gap-4">
             {status === 'incorrect' ? (
               <>
                 <button type="button" onClick={() => setStatus('idle')} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-bold transition-all border border-white/5">
                   Try Again
                 </button>
                 <button type="button" onClick={handleNext} className="flex-1 py-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-2xl font-bold transition-all border border-rose-500/30">
                   Pass
                 </button>
               </>
             ) : (
               <button 
                type="submit" 
                disabled={!input.trim() || status === 'correct'}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-xl transition-all shadow-xl active:scale-[0.98]"
               >
                 Check Answer
               </button>
             )}
          </div>
        </form>
      </div>
      
      <p className="text-slate-500 mt-8 font-medium">Card {index + 1} of {words.length}</p>
    </div>
  );
}

function ContextMode({ words }: { words: any[] }) {
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const currentWord = words[index % words.length];
  
  // Create the cloze sentence
  const clozeSentence = currentWord.context.replace(new RegExp(currentWord.word, 'gi'), '__________');

  useEffect(() => {
    const correct = currentWord.word;
    const others = words
      .filter(w => w.id !== currentWord.id)
      .map(w => w.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    setOptions([correct, ...others].sort(() => Math.random() - 0.5));
    setSelected(null);
  }, [index, currentWord, words]);

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    
    if (opt === currentWord.word) {
      setTimeout(() => {
        setIndex(prev => (prev + 1) % words.length);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center py-12 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl bg-[#141A29] rounded-3xl border border-white/5 p-8 md:p-12 shadow-2xl relative">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto mb-6 border border-emerald-500/30">
            <File className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4 block">Complete the context</span>
          <h2 className="text-2xl md:text-3xl font-medium text-slate-200 leading-relaxed">
            {clozeSentence.split('__________').map((part: string, i: number, arr: string[]) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className={`inline-block border-b-2 px-4 mx-1 min-w-[120px] transition-all ${
                    selected 
                      ? selected === currentWord.word ? 'text-emerald-400 border-emerald-500/50' : 'text-rose-400 border-rose-500/50'
                      : 'text-indigo-400 border-indigo-500/30'
                  }`}>
                    {selected || '...'}
                  </span>
                )}
              </React.Fragment>
            ))}
          </h2>
          <p className="mt-6 text-slate-500 font-medium">
             Mean: <span className="text-slate-400 italic text-lg ml-1">"{currentWord.translation}"</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {options.map((opt, i) => {
             const isThisSelected = selected === opt;
             const isThisCorrect = opt === currentWord.word;

             return (
               <button
                 key={i}
                 onClick={() => handleSelect(opt)}
                 disabled={!!selected}
                 className={`py-4 px-6 rounded-2xl font-bold text-lg transition-all border-2 ${
                  selected 
                    ? isThisCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                      : isThisSelected
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                        : 'bg-white/5 border-transparent text-slate-600 opacity-50'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 active:scale-[0.98]'
                 }`}
               >
                 {opt}
               </button>
             );
          })}
        </div>
        
        {selected && (
          <div className="mt-10 text-center animate-in fade-in duration-300">
             <button onClick={() => setIndex(prev => (prev + 1) % words.length)} className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-2 mx-auto">
                <span>{selected === currentWord.word ? 'Next Challenge' : 'Skip this word'}</span>
                <span>&rarr;</span>
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TopWordsMode({ myVaultWords, customSelectedWords, onToggleWord, onClearSelection, onStartPractice }: { myVaultWords: any[], customSelectedWords: any[], onToggleWord: any, onClearSelection: any, onStartPractice: any }) {
  const { user } = useAuth();
  const saveWord = useVocabStore(state => state.saveWord);
  const removeWord = useVocabStore(state => state.removeWord);
  const [playingGame, setPlayingGame] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Exclude some items if they want randomly mapping but we just pass top 50 
  if (playingGame) {
    return (
      <div className="space-y-6">
        <button onClick={() => setPlayingGame(false)} className="px-4 py-2 bg-white/5 rounded-xl text-slate-400 text-sm font-bold hover:bg-white/10">&larr; Back to List</button>
        <MatchingGame words={customSelectedWords && customSelectedWords.length > 0 ? customSelectedWords : topItalianWords} />
      </div>
    );
  }

  const handleToggleSave = async (item: any) => {
    setSavingId(item.id);
    const existing = myVaultWords.find(w => w.word.toLowerCase() === item.word.toLowerCase());
    
    if (existing) {
       await removeWord(existing.id, user?.id);
    } else {
       await saveWord(item.word, item.translation, item.context, 'Italian', user?.id);
    }
    
    setTimeout(() => {
      setSavingId(null);
    }, 400);
  };

  return (
    <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-gradient-to-r from-amber-500/10 to-transparent p-6 rounded-3xl border border-amber-500/20">
         <div>
           <h2 className="text-2xl font-black text-amber-500 mb-2 flex items-center gap-2">
             <Zap className="w-6 h-6" />
             Top Italian Words
           </h2>
           <p className="text-slate-400 text-sm max-w-lg">
             Mastering these common words will dramatically improve your reading comprehension.
             Select words to memorize and add them to your vault, or practice directly via a matching game.
           </p>
         </div>
         <button 
           onClick={() => setPlayingGame(true)}
           className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all flex items-center space-x-2"
         >
           <BrainCircuit className="w-5 h-5" />
           <span>Quick Match Challenge</span>
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {topItalianWords.map((item) => {
           const inVault = myVaultWords.some(w => w.word.toLowerCase() === item.word.toLowerCase());
           const isSelected = customSelectedWords && customSelectedWords.some((s: any) => s.id === item.id);
           const isSaving = savingId === item.id;
           
           return (
             <div 
               key={item.id} 
               onClick={() => onToggleWord(item)}
               className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-start group ${isSelected ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-[#141A29] border-white/5 hover:border-amber-500/30'}`}
             >
                <div className="flex space-x-4">
                  <div className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-amber-500 border-amber-400' : 'bg-transparent border-white/20 group-hover:border-amber-400/50'}`}>
                     {isSelected && <Check className="w-4 h-4 text-black" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                      {item.word}
                    </h3>
                    <p className="text-amber-400 font-medium mb-3">{item.translation}</p>
                    <p className="text-xs text-slate-500 italic leading-relaxed">"{item.context}"</p>
                  </div>
                </div>
                
                <button 
                  disabled={isSaving}
                  onClick={(e) => { e.stopPropagation(); handleToggleSave(item); }} 
                  className={`p-2 rounded-xl transition-all ${
                    inVault 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:border-white/20'
                  }`}
                  title={inVault ? 'Remove from Vault' : 'Add to Vault'}
                >
                  {isSaving ? <RotateCcw className="w-5 h-5 animate-spin" /> : (
                    inVault ? <Check className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />
                  )}
                </button>
             </div>
           );
         })}
      </div>
    </div>
  );
}

// --- NEW ACTIVE VOCAB GAMES ---

function ScrambleMode({ words }: { words: any[] }) {
  const [index, setIndex] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState<{id: string, char: string, used: boolean}[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{id: string, char: string}[]>([]);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');

  const currentWord = words[index % words.length];

  useEffect(() => {
    // Setup word
    if (!currentWord) return;
    const chars = currentWord.word.split('');
    const shuffled = chars
      .map((char: string) => ({ char, sort: Math.random() }))
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((item: any, i: number) => ({ id: `char-${i}`, char: item.char, used: false }));
    
    setShuffledLetters(shuffled);
    setSelectedLetters([]);
    setStatus('playing');
  }, [index, currentWord]);

  const handleSelectLetter = (item: {id: string, char: string, used: boolean}) => {
    if (status !== 'playing' || item.used) return;
    
    const newSelected = [...selectedLetters, { id: item.id, char: item.char }];
    setSelectedLetters(newSelected);
    
    setShuffledLetters(prev => prev.map(l => l.id === item.id ? { ...l, used: true } : l));

    if (newSelected.length === currentWord.word.length) {
      const spelledWord = newSelected.map(l => l.char).join('');
      if (spelledWord.toLowerCase() === currentWord.word.toLowerCase()) {
        setStatus('correct');
        setTimeout(() => setIndex(prev => prev + 1), 1500);
      } else {
        setStatus('wrong');
        setTimeout(() => {
          setSelectedLetters([]);
          setShuffledLetters(prev => prev.map(l => ({ ...l, used: false })));
          setStatus('playing');
        }, 1000);
      }
    }
  };

  const handleDeselectLetter = (item: {id: string, char: string}) => {
    if (status !== 'playing') return;
    setSelectedLetters(prev => prev.filter(l => l.id !== item.id));
    setShuffledLetters(prev => prev.map(l => l.id === item.id ? { ...l, used: false } : l));
  };

  if (!currentWord) return null;

  return (
    <div className="flex flex-col items-center py-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-xl bg-[#141A29] rounded-3xl border border-white/5 p-8 md:p-12 shadow-2xl relative">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2 block">Unscramble the word</span>
          <h2 className="text-4xl font-black text-amber-400 mb-2">{currentWord.translation}</h2>
          <p className="text-slate-500 italic">"{currentWord.context}"</p>
        </div>

        {/* Construction Zone */}
        <div className={`min-h-[80px] flex flex-wrap justify-center gap-2 mb-8 p-4 rounded-2xl border-2 transition-all duration-300 ${status === 'correct' ? 'border-emerald-500/50 bg-emerald-500/10' : status === 'wrong' ? 'border-rose-500/50 bg-rose-500/10 animate-shake' : 'border-white/10 bg-black/20'}`}>
           {selectedLetters.map((l) => (
             <button 
               key={l.id} 
               onClick={() => handleDeselectLetter(l)}
               className="w-12 h-14 bg-indigo-600 text-white font-black text-2xl rounded-lg flex items-center justify-center shadow-lg active:scale-95"
             >
               {l.char}
             </button>
           ))}
           {selectedLetters.length === 0 && (
             <span className="text-slate-600 font-bold self-center">Tap letters to spell</span>
           )}
        </div>

        {/* Available Letters */}
        <div className="flex flex-wrap justify-center gap-2">
          {shuffledLetters.map((l) => {
            return (
              <button 
                key={l.id} 
                disabled={l.used || status !== 'playing'}
                onClick={() => handleSelectLetter(l)}
                className={`w-14 h-16 font-black text-3xl rounded-xl flex items-center justify-center transition-all ${
                  l.used 
                    ? 'bg-transparent text-transparent border border-white/5 pointer-events-none' 
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:-translate-y-1 active:translate-y-0 active:scale-95 shadow-md hover:shadow-xl hover:border-indigo-500/50'
                }`}
              >
                {l.char}
              </button>
            );
          })}
        </div>

        {status === 'correct' && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
             <div className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-emerald-500 animate-in zoom-in spin-in-12 duration-500">
               <Check className="w-16 h-16 text-emerald-400" />
             </div>
           </div>
        )}
      </div>
      <p className="text-slate-500 mt-8 font-medium">Word {index + 1} of {words.length}</p>
    </div>
  );
}

function FallingMode({ words }: { words: any[] }) {
  const [index, setIndex] = useState(0);
  const [fallingY, setFallingY] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [isHit, setIsHit] = useState<'none' | 'correct' | 'wrong'>('none');

  const currentWord = words[index % words.length];

  // Game Loop
  useEffect(() => {
    if (gameOver || isHit !== 'none' || !currentWord) return;

    let animationFrameId: number;
    let startTimestamp: number | null = null;
    const duration = 8000; // 8 seconds to reach bottom

    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;
      const percent = (progress / duration) * 100;

      if (percent >= 100) {
        setGameOver(true);
      } else {
        setFallingY(percent);
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [index, gameOver, isHit, currentWord]);

  // Setup options
  useEffect(() => {
    if (!currentWord) return;
    const correct = currentWord.translation;
    const others = words.filter(w => w.id !== currentWord.id).sort(() => Math.random() - 0.5).slice(0, 2).map(w => w.translation);
    setOptions([correct, ...others].sort(() => Math.random() - 0.5));
  }, [currentWord, words]);

  const handleGuess = (guess: string) => {
    if (gameOver || isHit !== 'none') return;
    
    if (guess === currentWord.translation) {
      setIsHit('correct');
      setScore(s => s + 100);
      setTimeout(() => {
        setIndex(prev => prev + 1);
        setFallingY(0);
        setIsHit('none');
      }, 800);
    } else {
      setIsHit('wrong');
      setTimeout(() => {
        setGameOver(true);
      }, 800);
    }
  };

  const restartGame = () => {
    setScore(0);
    setIndex(0); // Optional shuffle words here
    setFallingY(0);
    setGameOver(false);
    setIsHit('none');
  };

  if (!currentWord) return null;

  return (
    <div className="flex flex-col items-center py-8 animate-in fade-in duration-500">
       <div className="w-full max-w-2xl bg-[#0B0F19] rounded-3xl border-2 border-white/10 h-[600px] shadow-2xl relative overflow-hidden flex flex-col">
          
          {/* Header UI */}
          <div className="flex justify-between items-center p-6 border-b border-white/5 bg-black/40 z-10">
             <div className="flex items-center space-x-2 text-rose-500">
               <Timer className="w-5 h-5" />
               <span className="font-bold tracking-widest uppercase">Time Attack</span>
             </div>
             <div className="bg-rose-500/20 px-4 py-1.5 rounded-full border border-rose-500/30 font-mono font-black text-xl text-rose-400">
                {score}
             </div>
          </div>

          {/* Fall Area */}
          <div className="flex-1 relative bg-gradient-to-b from-[#141A29] to-[#0A0D14] overflow-hidden">
             
             {!gameOver ? (
               <div 
                 className={`absolute left-0 w-full text-center transition-opacity duration-200 ${isHit === 'correct' ? 'opacity-0 scale-150 text-emerald-400 blur-sm' : isHit === 'wrong' ? 'opacity-0 scale-50 text-rose-500' : 'opacity-100 text-white'}`}
                 style={{ top: `${fallingY}%`, transform: 'translateY(-50%)' }}
               >
                  <div className="inline-block px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
                    <h2 className="text-4xl font-black tracking-tight">{currentWord.word}</h2>
                  </div>
               </div>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20 animate-in fade-in duration-300">
                 <h2 className="text-6xl font-black text-rose-500 mb-4 animate-bounce">GAME OVER</h2>
                 <p className="text-xl text-slate-300 mb-8 font-bold flex items-center gap-2">Final Score: <span className="text-3xl text-amber-400">{score}</span></p>
                 <button onClick={restartGame} className="px-8 py-4 bg-white text-black font-black text-xl rounded-2xl hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95">Play Again</button>
               </div>
             )}

             {/* Danger Zone Graphic */}
             <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-rose-500/30 to-transparent" />
          </div>

          {/* Controls */}
          <div className="p-6 bg-[#141A29] border-t border-white/10 z-10">
             <div className="grid grid-cols-3 gap-4">
               {options.map((opt, i) => (
                 <button
                   key={i}
                   disabled={gameOver || isHit !== 'none'}
                   onClick={() => handleGuess(opt)}
                   className="py-6 px-4 bg-slate-800 hover:bg-indigo-600 rounded-2xl border border-white/10 hover:border-indigo-400 font-bold text-lg text-white transition-all shadow-lg active:scale-95 truncate"
                 >
                   {opt}
                 </button>
               ))}
             </div>
          </div>
       </div>
    </div>
  );
}
