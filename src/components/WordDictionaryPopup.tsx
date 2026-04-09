"use client";
import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Globe, Loader2, X } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useVocabStore } from '@/store/useVocabStore';
import { useAuth } from '@/components/AuthProvider';

interface Props {
  word: string;
  context: string;
  onClose: () => void;
  style: React.CSSProperties;
}

export default function WordDictionaryPopup({ word, context, onClose, style }: Props) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { targetLanguage } = useUserStore();
  const { user } = useAuth();
  const saveWord = useVocabStore(state => state.saveWord);

  useEffect(() => {
    async function fetchTranslation() {
      setLoading(true);
      try {
        const langMap: Record<string, string> = {
          'Spanish': 'es',
          'French': 'fr',
          'German': 'de',
          'Italian': 'it',
          'Japanese': 'ja'
        };
        const langCode = langMap[targetLanguage] || 'es'; // default to Spanish if undefined
        
        // Free Translation API (MyMemory)
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${langCode}|en`);
        const data = await res.json();
        
        if (data && data.responseData && data.responseData.translatedText) {
          // Sometimes it returns the exact same word if it fails, handle loosely
          let result = data.responseData.translatedText;
          setTranslation(result);
        } else {
          setTranslation("Translation not found.");
        }
      } catch (err) {
        console.error("Failed to translate:", err);
        setTranslation("Error fetching translation.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchTranslation();
  }, [word, targetLanguage]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    
    try {
       if (translation) {
         saveWord(word, translation, context, targetLanguage, user?.id);
       }
       setTimeout(() => {
         setSaved(true);
         setIsSaving(false);
       }, 400);
    } catch(e) {
       console.error("Save failed", e);
       setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div 
        style={style} 
        className="fixed z-50 w-72 p-5 rounded-2xl bg-[#141A29] border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200"
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Globe className="w-5 h-5" />
            <h4 className="font-bold text-xl tracking-tight text-white">{word}</h4>
          </div>

          <div className="min-h-[3rem] py-2">
            {loading ? (
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Translating to English...</span>
              </div>
            ) : (
              <div className="text-slate-200 text-lg font-medium leading-relaxed">
                {translation}
              </div>
            )}
          </div>

          <button 
            disabled={loading || saved || isSaving}
            onClick={handleSave}
            className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-medium transition-all duration-300 ${
              saved 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
            } disabled:opacity-70`}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saved ? (
              <>
                <BookmarkCheck className="w-5 h-5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Bookmark className="w-5 h-5" />
                <span>Save Word</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
