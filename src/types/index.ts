// ================================================
// LANGME - Type Definitions
// ================================================

export interface VocabularyEntry {
  id: string;
  word: string;         // Tiếng Việt
  english: string;      // Tiếng Anh
  chinese: string;      // Tiếng Trung (Giản thể)
  pinyin: string;       // Phiên âm
  example_en: string;   // Câu ví dụ tiếng Anh
  example_zh: string;   // Câu ví dụ tiếng Trung
  category: string;     // Phân loại (greeting, food, travel...)
  created_at: string;   // ISO date string
  last_reviewed: string;// ISO date string  
  next_review: string;  // ISO date string (SRS)
  srs_level: number;    // 0-8 (Spaced Repetition level)
  review_count: number; // Tổng số lần ôn
}

export interface DailyStats {
  date: string;         // YYYY-MM-DD
  words_learned: number;
  words_reviewed: number;
  streak_count: number;
}

export interface UserProfile {
  total_words: number;
  current_streak: number;
  longest_streak: number;
  words_mastered: number; // srs_level >= 5
  today_reviewed: number;
  today_target: number;
}

export interface ReviewResult {
  wordId: string;
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0=again, 5=easy
}

export interface AITranslation {
  english: string;
  chinese: string;
  pinyin: string;
  example_en: string;
  example_zh: string;
  category: string;
}

export type ReviewMode = 'vi_to_en' | 'vi_to_zh' | 'en_to_vi' | 'zh_to_vi' | 'mixed';

export type AppTab = 'home' | 'learn' | 'dictionary' | 'add';
