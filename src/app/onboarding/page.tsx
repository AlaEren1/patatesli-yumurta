"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Globe2, GraduationCap, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function Onboarding() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const setOnboardingData = useUserStore(state => state.setOnboardingData);

  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');
  const [saving, setSaving] = useState(false);

  // Gate behind auth
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const languages = [
    { name: 'Spanish', flag: '🇪🇸' },
    { name: 'French', flag: '🇫🇷' },
    { name: 'Japanese', flag: '🇯🇵' },
    { name: 'German', flag: '🇩🇪' },
    { name: 'Italian', flag: '🇮🇹' },
  ];

  const levels = [
    { code: 'A1', label: 'Beginner', desc: 'I am just starting.' },
    { code: 'A2', label: 'Elementary', desc: 'I know the basics.' },
    { code: 'B1', label: 'Intermediate', desc: 'I can have simple conversations.' },
    { code: 'B2', label: 'Upper Intermediate', desc: 'I can speak fluently on most topics.' },
    { code: 'C1', label: 'Advanced', desc: 'I am near native proficiency.' },
  ];

  const handleComplete = async () => {
    setSaving(true);
    // Save to Zustand (local persist)
    setOnboardingData(language, level);

    // Sync preferences to Supabase user_progress row
    if (user) {
      await supabase
        .from('user_progress')
        .upsert({ user_id: user.id, target_language: language, level }, { onConflict: 'user_id' });
    }
    setSaving(false);
    router.push('/');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl bg-[#141A29] rounded-3xl p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

        {step === 1 && (
          <div className="relative z-10 space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-6 border border-indigo-500/30">
                <Globe2 className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-extrabold text-white">What do you want to learn?</h1>
              <p className="text-slate-400 text-lg">Choose a language to start your journey.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.name}
                  onClick={() => { setLanguage(lang.name); setStep(2); }}
                  className="flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-400/50 rounded-2xl transition-all hover:shadow-lg hover:scale-[1.02]"
                >
                  <span className="text-4xl mb-3 shadow-sm rounded-full bg-white/10 w-16 h-16 flex items-center justify-center border border-white/5">{lang.flag}</span>
                  <span className="font-semibold text-slate-200">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="relative z-10 space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-6 border border-blue-500/30">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-extrabold text-white">What is your current level?</h1>
              <p className="text-slate-400 text-lg">Your library will recommend stories based on this.</p>
            </div>

            <div className="space-y-3">
              {levels.map((lvl) => (
                <button
                  key={lvl.code}
                  onClick={() => setLevel(lvl.code)}
                  className={`w-full flex items-center p-4 rounded-2xl border transition-all ${
                    level === lvl.code
                      ? 'bg-blue-500/20 border-blue-400 shadow-md ring-2 ring-blue-500/30 text-white'
                      : 'bg-white/5 border-white/10 hover:border-blue-400/50 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex-1 text-left">
                    <div className="font-bold text-lg">{lvl.code} - {lvl.label}</div>
                    <div className="text-slate-400 text-sm">{lvl.desc}</div>
                  </div>
                  {level === lvl.code && <Sparkles className="w-5 h-5 text-blue-400" />}
                </button>
              ))}
            </div>

            <div className="pt-4 flex justify-between space-x-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 font-semibold text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!level || saving}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Learning'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
