// ================================================
// LANGME - Spaced Repetition System (SRS)
// Simplified SM-2 Algorithm
// ================================================

import { CONFIG } from './config';
import type { VocabularyEntry } from '@/types';

/**
 * Calculate next review date based on quality of answer
 * quality: 0 = forgot completely, 5 = perfect recall
 */
export function calculateNextReview(
  currentLevel: number,
  quality: number
): { nextLevel: number; nextReviewDate: string } {
  let nextLevel: number;

  if (quality < 3) {
    // Failed - reset to beginning
    nextLevel = 0;
  } else if (quality === 3) {
    // Hard - stay at same level
    nextLevel = currentLevel;
  } else {
    // Good or Easy - advance
    nextLevel = Math.min(currentLevel + 1, CONFIG.srs.intervals.length - 1);
  }

  const daysUntilNext = CONFIG.srs.intervals[nextLevel];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysUntilNext);

  return {
    nextLevel,
    nextReviewDate: nextDate.toISOString().split('T')[0],
  };
}

/**
 * Get words that are due for review today
 */
export function getDueWords(words: VocabularyEntry[]): VocabularyEntry[] {
  const today = new Date().toISOString().split('T')[0];
  return words.filter((word) => {
    if (!word.next_review) return true; // Never reviewed
    return word.next_review <= today;
  });
}

/**
 * Get mastery percentage (0-100)
 */
export function getMasteryPercentage(word: VocabularyEntry): number {
  return Math.round((word.srs_level / (CONFIG.srs.intervals.length - 1)) * 100);
}

/**
 * Get mastery label
 */
export function getMasteryLabel(srsLevel: number): string {
  if (srsLevel === 0) return 'Mới';
  if (srsLevel <= 2) return 'Đang học';
  if (srsLevel <= 4) return 'Quen thuộc';
  if (srsLevel <= 6) return 'Thành thạo';
  return 'Hoàn hảo';
}

/**
 * Get mastery color class
 */
export function getMasteryColor(srsLevel: number): string {
  if (srsLevel === 0) return '#6B6B8D';
  if (srsLevel <= 2) return '#FF7675';
  if (srsLevel <= 4) return '#FDCB6E';
  if (srsLevel <= 6) return '#74B9FF';
  return '#00B894';
}
