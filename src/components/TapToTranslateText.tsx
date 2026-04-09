"use client";
import React, { useState } from 'react';
import WordDictionaryPopup from './WordDictionaryPopup';

interface TapToTranslateTextProps {
  text: string;
}

export default function TapToTranslateText({ text }: TapToTranslateTextProps) {
  const [selectedWord, setSelectedWord] = useState<{ word: string, context: string, x: number, y: number } | null>(null);

  const handleWordClick = (word: string, e: React.MouseEvent) => {
    let posX = e.clientX + 15;
    let posY = e.clientY + 15;
    
    // Ensure the popup doesn't bleed off the right edge of the screen
    if (window.innerWidth - posX < 300) {
      posX = window.innerWidth - 300 - 15;
    }

    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    const context = sentences.find(s => s.includes(word)) || text;

    setSelectedWord({
      word: word.replace(/[.,;!?()'"]/g, ''), // clean punctuation from word
      context: context.trim(),
      x: posX,
      y: posY
    });
  };

  const chunks = text.split(/(\s+|[.,;!?()'"]+)/).filter(Boolean);

  return (
    <div className="relative text-lg md:text-xl leading-relaxed text-slate-300 max-w-none prose prose-invert">
      {chunks.map((chunk, i) => {
        if (/^\s+$/.test(chunk) || /^[.,;!?()'"]+$/.test(chunk)) {
          if (chunk === '\n') return <br key={i} />;
          return <span key={i} className="text-slate-500">{chunk}</span>;
        }
        
        return (
          <span 
            key={i} 
            onClick={(e) => handleWordClick(chunk, e)}
            className="cursor-pointer hover:bg-indigo-500/30 hover:text-white rounded px-1 transition-colors duration-200 relative inline-block text-slate-200 font-medium"
          >
            {chunk}
          </span>
        );
      })}

      {selectedWord && (
        <WordDictionaryPopup
          word={selectedWord.word}
          context={selectedWord.context}
          style={{ top: selectedWord.y, left: selectedWord.x }}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
}
