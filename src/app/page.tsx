"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Video, BrainCircuit, Sparkles, TrendingUp, Bookmark, Globe, ChevronDown, Check, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useVocabStore } from '@/store/useVocabStore';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';

const LANGUAGES = ['Spanish', 'German', 'French', 'Italian', 'Japanese'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function Dropdown({
  value,
  options,
  onChange,
  icon,
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  icon: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md transition-all duration-200 group"
      >
        {icon}
        <span className="text-sm font-semibold text-slate-200">{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-[#141A29] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                opt === value
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {opt}
              {opt === value && <Check className="w-4 h-4 text-indigo-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { hasOnboarded, targetLanguage, level, setLanguage, setLevel, setOnboardingData, uiLanguage, setUiLanguage } = useUserStore();
  const { syncFromSupabase } = useVocabStore();
  
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ savedWords: 0, storiesRead: 0, videosWatched: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  // Auth & Onboarding Guard
  useEffect(() => {
    if (mounted && !authLoading) {
      if (!user) {
        router.push('/auth');
      } else if (!hasOnboarded) {
        router.push('/onboarding');
      }
    }
  }, [user, authLoading, hasOnboarded, mounted, router]);

  // Fetch Stats and Sync Data
  useEffect(() => {
    if (user && mounted) {
      const fetchStatsAndSync = async () => {
        setLoadingStats(true);
        try {
          // 1. Fetch user_progress
          const { data: progress, error: progressErr } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (progress) {
            setStats(prev => ({
              ...prev,
              storiesRead: progress.stories_read,
              videosWatched: progress.videos_watched,
            }));
            
            // Sync preferences to Zustand if they match local but aren't set
            if (progress.target_language && progress.level && (!targetLanguage || !level)) {
              setOnboardingData(progress.target_language, progress.level);
            }
          }

          // 2. Fetch saved_words count
          const { count, error: countErr } = await supabase
            .from('saved_words')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          if (count !== null) {
            setStats(prev => ({ ...prev, savedWords: count }));
          }

          // 3. Sync vocab store items to local state
          await syncFromSupabase(user.id);

        } catch (err) {
          console.error("Error fetching dashboard stats:", err);
        } finally {
          setLoadingStats(false);
        }
      };

      fetchStatsAndSync();
    }
  }, [user, mounted, targetLanguage, level, syncFromSupabase, setOnboardingData]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  if (!mounted || authLoading || !user || !hasOnboarded) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <header className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              {t('linguaforge_title', uiLanguage)}
            </h1>

            {/* Profile & Switchers */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mr-2">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300 truncate max-w-[120px]">{user?.email}</span>
                <button onClick={signOut} title="Sign Out" className="ml-2 hover:text-rose-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Dropdown
                  value={uiLanguage}
                  options={['English', 'Turkish']}
                  onChange={(val) => setUiLanguage(val as 'English' | 'Turkish')}
                  icon={<Sparkles className="w-4 h-4 text-purple-400" />}
                />
                <Dropdown
                  value={targetLanguage}
                  options={LANGUAGES}
                  onChange={setLanguage}
                  icon={<Globe className="w-4 h-4 text-indigo-400" />}
                />
                <Dropdown
                  value={level}
                  options={LEVELS}
                  onChange={setLevel}
                  icon={<Sparkles className="w-4 h-4 text-amber-400" />}
                />
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-400/30 transition-all duration-700 ease-in-out"></div>
            <p className="text-2xl md:text-3xl font-light italic text-slate-200 relative z-10 leading-relaxed">
              "To have another language is to possess a second soul."
            </p>
            <p className="mt-6 text-sm font-bold text-indigo-400 uppercase tracking-[0.2em] relative z-10">
              — Charlemagne
            </p>
          </div>
        </header>

        {/* User Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 ease-out fill-mode-both">
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-white/5 shadow-sm flex flex-col justify-between hover:bg-slate-800/60 transition-all duration-300">
            <div className="flex items-center space-x-3 text-emerald-400 mb-4">
              <Bookmark className="w-5 h-5" />
              <h3 className="font-semibold tracking-wide text-slate-300">{t('saved_words', uiLanguage)}</h3>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-extrabold text-slate-100">{loadingStats ? '...' : stats.savedWords.toLocaleString()}</span>
              <span className="text-slate-400 text-sm font-medium">{t('words_unit', uiLanguage)}</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-800/40 border border-white/5 shadow-sm flex flex-col justify-between hover:bg-slate-800/60 transition-all duration-300">
            <div className="flex items-center space-x-3 text-amber-400 mb-4">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-semibold tracking-wide text-slate-300">{t('stories_read', uiLanguage)}</h3>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-extrabold text-slate-100">{loadingStats ? '...' : stats.storiesRead.toLocaleString()}</span>
              <span className="text-slate-400 text-sm font-medium">{t('stories_unit', uiLanguage)}</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-800/40 border border-white/5 shadow-sm flex flex-col justify-between hover:bg-slate-800/60 transition-all duration-300">
            <div className="flex items-center space-x-3 text-pink-400 mb-4">
              <Video className="w-5 h-5" />
              <h3 className="font-semibold tracking-wide text-slate-300">{t('videos_watched', uiLanguage)}</h3>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-extrabold text-slate-100">{loadingStats ? '...' : stats.videosWatched.toLocaleString()}</span>
              <span className="text-slate-400 text-sm font-medium">{t('videos_unit', uiLanguage)}</span>
            </div>
          </div>
        </section>

        {/* Modules Navigation */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 ease-out fill-mode-both">
          <h2 className="text-2xl font-bold tracking-tight flex items-center space-x-2 text-slate-200">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            <span>{t('learning_modules', uiLanguage)}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* AI Immersion Lab Card - THE NEW PREMIUM CARD */}
            <Link href="/immersion" className="group relative block p-1 rounded-3xl bg-gradient-to-b from-purple-500/20 to-transparent hover:from-purple-500/40 transition-all duration-500 cursor-pointer overflow-hidden shadow-sm border border-white/5 lg:col-span-1">
              <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="h-full bg-[#0F1423] p-8 rounded-[1.35rem] space-y-6 relative z-10 border border-white/5">
                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                   <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-100">{t('immersion_lab_title', uiLanguage)}</h3>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-bold uppercase tracking-wider">New</span>
                   </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('immersion_lab_desc', uiLanguage)}
                  </p>
                </div>
              </div>
            </Link>

            {/* Library Card */}
            <Link href="/reading-room" className="group relative block p-1 rounded-3xl bg-gradient-to-b from-blue-500/20 to-transparent hover:from-blue-500/40 transition-all duration-500 cursor-pointer overflow-hidden shadow-sm border border-white/5">
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="h-full bg-[#0F1423] p-8 rounded-[1.35rem] space-y-6 relative z-10 border border-white/5">
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-100">{t('library_title', uiLanguage)}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('library_desc', uiLanguage)}
                  </p>
                </div>
              </div>
            </Link>

            {/* Video Room Card */}
            <Link href="/video-room" className="group relative block p-1 rounded-3xl bg-gradient-to-b from-rose-500/20 to-transparent hover:from-rose-500/40 transition-all duration-500 cursor-pointer overflow-hidden shadow-sm border border-white/5">
              <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="h-full bg-[#0F1423] p-8 rounded-[1.35rem] space-y-6 relative z-10 border border-white/5">
                <div className="w-14 h-14 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400">
                  <Video className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-100">{t('video_room_title', uiLanguage)}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('video_room_desc', uiLanguage)}
                  </p>
                </div>
              </div>
            </Link>

            {/* Practice Card */}
            <Link href="/practice" className="group relative block p-1 rounded-3xl bg-gradient-to-b from-amber-500/20 to-transparent hover:from-amber-500/40 transition-all duration-500 cursor-pointer overflow-hidden shadow-sm border border-white/5">
              <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="h-full bg-[#0F1423] p-8 rounded-[1.35rem] space-y-6 relative z-10 border border-white/5">
                <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-100">{t('practice_title', uiLanguage)}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('practice_desc', uiLanguage)}
                  </p>
                </div>
              </div>
            </Link>

            {/* Top 1000 Vocabulary Card - Italian Only */}
            {targetLanguage === 'Italian' && (
              <Link href="/practice?mode=top-words" className="group relative block p-1 rounded-3xl bg-gradient-to-b from-emerald-500/20 to-transparent hover:from-emerald-500/40 transition-all duration-500 cursor-pointer overflow-hidden shadow-sm border border-white/5 lg:col-span-2">
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                <div className="flex h-full bg-[#0F1423] p-8 rounded-[1.35rem] items-center space-x-6 relative z-10 border border-white/5">
                  <div className="w-16 h-16 shrink-0 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-100">Top 1000 Italian Vocabulary</h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider">Must Know</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Statistically proven: mastering the top 1000 words gives you 85% comprehension in daily conversations!
                    </p>
                  </div>
                </div>
              </Link>
            )}

          </div>
        </section>
      </div>
    </div>
  );
}

