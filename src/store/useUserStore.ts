import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  hasOnboarded: boolean;
  targetLanguage: string;
  level: string;
  setOnboardingData: (language: string, level: string) => void;
  setLanguage: (language: string) => void;
  setLevel: (level: string) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      targetLanguage: '',
      level: '',
      setOnboardingData: (language, level) => set({ hasOnboarded: true, targetLanguage: language, level }),
      setLanguage: (language) => set({ targetLanguage: language }),
      setLevel: (level) => set({ level }),
      resetUser: () => set({ hasOnboarded: false, targetLanguage: '', level: '' })
    }),
    {
      name: 'linguaforge-user-storage',
    }
  )
);
