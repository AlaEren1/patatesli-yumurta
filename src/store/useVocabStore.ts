import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export interface VocabWord {
  id: string;
  word: string;
  translation: string;
  context: string;
  language: string;
  dateSaved: number;
}

interface VocabState {
  words: VocabWord[];
  saveWord: (word: string, translation: string, context: string, language: string, userId?: string) => void;
  removeWord: (id: string, userId?: string) => void;
  syncFromSupabase: (userId: string) => Promise<void>;
}

export const useVocabStore = create<VocabState>()(
  persist(
    (set) => ({
      words: [],

      saveWord: (word, translation, context, language, userId) => set((state) => {
        // Prevent exact duplicates in the same language
        if (state.words.some(w => w.word.toLowerCase() === word.toLowerCase() && w.language === language)) {
          return state;
        }

        const newWord: VocabWord = {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          word,
          translation,
          context,
          language,
          dateSaved: Date.now(),
        };

        // Sync to Supabase if user is logged in
        if (userId) {
          supabase.from('saved_words').insert({
            id: newWord.id,
            user_id: userId,
            word: newWord.word,
            translation: newWord.translation,
            context: newWord.context,
            language: newWord.language,
            date_saved: newWord.dateSaved,
          }).then(({ error }) => {
            if (error) console.error('Failed to sync word to Supabase:', error.message);
          });
        }

        return { words: [...state.words, newWord] };
      }),

      removeWord: (id, userId) => set((state) => {
        // Sync deletion to Supabase if user is logged in
        if (userId) {
          supabase.from('saved_words').delete().eq('id', id).then(({ error }) => {
            if (error) console.error('Failed to delete word from Supabase:', error.message);
          });
        }
        return { words: state.words.filter(w => w.id !== id) };
      }),

      syncFromSupabase: async (userId: string) => {
        const { data, error } = await supabase
          .from('saved_words')
          .select('*')
          .eq('user_id', userId)
          .order('date_saved', { ascending: true });

        if (error) {
          console.error('Failed to sync vocab from Supabase:', error.message);
          return;
        }

        if (data) {
          const words: VocabWord[] = data.map(row => ({
            id: row.id,
            word: row.word,
            translation: row.translation,
            context: row.context,
            language: row.language,
            dateSaved: row.date_saved,
          }));
          set({ words });
        }
      },
    }),
    {
      name: 'linguaforge-vocab-vault',
    }
  )
);
