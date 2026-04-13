type Language = 'English' | 'Turkish';

const translations = {
  // Common
  'back_to_dashboard': {
    'English': 'Back to Dashboard',
    'Turkish': 'Panoya Dön'
  },
  'loading': {
    'English': 'Loading...',
    'Turkish': 'Yükleniyor...'
  },
  
  // Dashboard
  'linguaforge_title': {
    'English': 'LinguaForge.',
    'Turkish': 'LinguaForge.'
  },
  'system_language': {
    'English': 'System Language',
    'Turkish': 'Sistem Dili'
  },
  'learning_modules': {
    'English': 'Learning Modules',
    'Turkish': 'Öğrenme Modülleri'
  },
  'saved_words': {
    'English': 'Saved Words',
    'Turkish': 'Kaydedilen Kelimeler'
  },
  'stories_read': {
    'English': 'Stories Read',
    'Turkish': 'Okunan Hikayeler'
  },
  'videos_watched': {
    'English': 'Videos Watched',
    'Turkish': 'İzlenen Videolar'
  },
  'words_unit': {
    'English': 'words',
    'Turkish': 'kelime'
  },
  'stories_unit': {
    'English': 'stories',
    'Turkish': 'hikaye'
  },
  'videos_unit': {
    'English': 'videos',
    'Turkish': 'video'
  },
  
  // Module Cards
  'immersion_lab_title': {
    'English': 'Immersion Lab',
    'Turkish': 'İmmersiyon Laboratuvarı'
  },
  'immersion_lab_desc': {
    'English': 'Practice active speaking with AI personas. Receive instant grammar corrections as you chat.',
    'Turkish': 'Yapay zeka karakterleriyle aktif konuşma pratiği yapın. Sohbet ederken anında dilbilgisi düzeltmeleri alın.'
  },
  'library_title': {
    'English': 'The Library',
    'Turkish': 'Kütüphane'
  },
  'library_desc': {
    'English': 'Explore a feed of beautifully crafted stories tailored instantly for you. Contains tap-to-translate.',
    'Turkish': 'Sizin için anında özelleştirilmiş, güzelce hazırlanmış hikayeleri keşfedin. Dokun-çevir özelliğini içerir.'
  },
  'video_room_title': {
    'English': 'Video Room',
    'Turkish': 'Video Odası'
  },
  'video_room_desc': {
    'English': 'Watch YouTube videos with interactive, synchronized transcripts. Save vocab effortlessly.',
    'Turkish': 'Etkileşimli, senkronize transkriptlerle YouTube videolarını izleyin. Kelimeleri zahmetsizce kaydedin.'
  },
  'practice_title': {
    'English': 'Vocab Practice',
    'Turkish': 'Kelime Pratiği'
  },
  'practice_desc': {
    'English': 'Test yourself with games and flashcards using only the words you\'ve saved in your vault.',
    'Turkish': 'Kasanıza kaydettiğiniz kelimelerle kendinizi oyunlar ve bilgi kartlarıyla test edin.'
  },

  // Reading Room
  'library_welcome': {
    'English': 'The Library',
    'Turkish': 'Kütüphane'
  },
  'library_subtitle': {
    'English': 'Select a level-appropriate story to start your immersion journey.',
    'Turkish': 'İmmersiyon yolculuğunuza başlamak için seviyenize uygun bir hikaye seçin.'
  },
  'read_story': {
    'English': 'Read Story',
    'Turkish': 'Hikayeyi Oku'
  },

  // Practice Room
  'practice_vault': {
    'English': 'Vault',
    'Turkish': 'Kasa'
  },
  'practice_flashcards': {
    'English': 'Flashcards',
    'Turkish': 'Bilgi Kartları'
  },
  'practice_matching': {
    'English': 'Matching',
    'Turkish': 'Eşleştirme'
  },
  'practice_quiz': {
    'English': 'Quiz',
    'Turkish': 'Test'
  },
  'practice_writing': {
    'English': 'Writing',
    'Turkish': 'Yazma'
  },
  'practice_context': {
    'English': 'Context',
    'Turkish': 'Bağlam'
  },
  'words_saved_in': {
    'English': 'words saved in',
    'Turkish': 'kelime kaydedildi:'
  },

  // Immersion Lab
  'immersion_welcome': {
    'English': 'AI Immersion Lab',
    'Turkish': 'Yapay Zeka İmmersiyon Laboratuvarı'
  },
  'immersion_subtitle': {
    'English': 'Choose a scenario and start speaking. Our AI Tutor will guide you.',
    'Turkish': 'Bir senaryo seçin ve konuşmaya başlayın. Yapay zeka eğitmenimiz size rehberlik edecektir.'
  },
  'start_roleplay': {
    'English': 'Start Roleplay',
    'Turkish': 'Roleplay Başlat'
  },
  'ai_coach_feedback': {
    'English': 'AI Coach Feedback',
    'Turkish': 'YZ Eğitmen Geri Bildirimi'
  },
  'analysis': {
    'English': 'Analysis',
    'Turkish': 'Analiz'
  },
  'suggested_upgrade': {
    'English': 'Suggested Upgrade',
    'Turkish': 'Önerilen Geliştirme'
  },
  'perfect_phrasing': {
    'English': 'Perfect phrasing!',
    'Turkish': 'Mükemmel ifade!'
  },
  'exit_lab': {
    'English': 'Exit Lab',
    'Turkish': 'Laboratuvardan Çık'
  },
  'active_lab': {
    'English': 'Active Lab',
    'Turkish': 'Aktif Laboratuvar'
  },

  // Library Detailed
  'german_storybook_collection': {
    'English': 'German Storybook Collection',
    'Turkish': 'Almanca Hikaye Kitabı Koleksiyonu'
  },
  'beginner_friendly': {
    'English': 'Beginner Friendly',
    'Turkish': 'Başlangıç Seviyesi'
  },
  'cafe_in_berlin_title': {
    'English': 'Learn German with Stories: Café in Berlin',
    'Turkish': 'Hikayelerle Almanca Öğren: Café in Berlin'
  },
  'by_andre_klein': {
    'English': 'by André Klein',
    'Turkish': 'André Klein tarafından'
  },
  'interactive_chapters': {
    'English': 'interactive chapters',
    'Turkish': 'etkileşimli bölüm'
  },
  'cafe_in_berlin_desc': {
    'English': 'Follow Dino through Berlin in 10 interactive stories. Tap any word to translate and save to your vocabulary!',
    'Turkish': '10 etkileşimli hikayede Dino\'yu Berlin\'de takip edin. Çevirmek ve kelime dağarcığınıza kaydetmek için herhangi bir kelimeye dokunun!'
  },
  'reference_pdf': {
    'English': 'Reference PDF',
    'Turkish': 'Referans PDF'
  },
  'select_chapter_hint': {
    'English': 'Select a chapter to start your interactive reading session',
    'Turkish': 'Etkileşimli okuma seansınızı başlatmak için bir bölüm seçin'
  },
  'back_to_library': {
    'English': 'Back to Library',
    'Turkish': 'Kütüphaneye Dön'
  },
  'search_stories': {
    'English': 'Search stories...',
    'Turkish': 'Hikaye ara...'
  },
  'back_to_book_menu': {
    'English': 'Back to Book Menu',
    'Turkish': 'Kitap Menüsüne Dön'
  },
  'previous_chapter': {
    'English': 'Previous Chapter',
    'Turkish': 'Önceki Bölüm'
  },
  'next_chapter': {
    'English': 'Next Chapter',
    'Turkish': 'Sonraki Bölüm'
  },
  'chapter': {
    'English': 'Chapter',
    'Turkish': 'Bölüm'
  },

  // Dictionary
  'save_word': {
    'English': 'Save Word',
    'Turkish': 'Kelimeyi Kaydet'
  },
  'saved': {
    'English': 'Saved!',
    'Turkish': 'Kaydedildi!'
  },
  'translating_to': {
    'English': 'Translating to English...',
    'Turkish': 'Türkçeye çevriliyor...'
  }
};

export type TranslationKey = keyof typeof translations;

export const t = (key: TranslationKey, language: Language): string => {
  return translations[key]?.[language] || key;
};
