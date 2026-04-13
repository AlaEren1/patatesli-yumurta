import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  hasOnboarded: boolean;
  targetLanguage: string;
  level: string;
  uiLanguage: 'English' | 'Turkish';
  setOnboardingData: (language: string, level: string) => void;
  setLanguage: (language: string) => void;
  setLevel: (level: string) => void;
  setUiLanguage: (lang: 'English' | 'Turkish') => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      targetLanguage: '',
      level: '',
      uiLanguage: 'English',
      setOnboardingData: (language, level) => set({ hasOnboarded: true, targetLanguage: language, level }),
      setLanguage: (language) => set({ targetLanguage: language }),
      setLevel: (level) => set({ level }),
      setUiLanguage: (lang) => set({ uiLanguage: lang }),
      resetUser: () => set({ hasOnboarded: false, targetLanguage: '', level: '', uiLanguage: 'English' })
    }),
    {
      name: 'linguaforge-user-storage',
    }
  )
);
