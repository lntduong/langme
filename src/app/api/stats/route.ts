// ================================================
// LANGME - API Route: Stats
// GET /api/stats - Get user profile stats
// ================================================

import { NextResponse } from 'next/server';
import { getAllVocabulary, getDailyStats } from '@/lib/sheets';
import { getDueWords } from '@/lib/srs';
import { CONFIG } from '@/lib/config';
import type { UserProfile } from '@/types';

export async function GET() {
  try {
    const [vocabulary, dailyStats] = await Promise.all([
      getAllVocabulary(),
      getDailyStats(),
    ]);

    const today = new Date().toISOString().split('T')[0];
    const todayStats = dailyStats.find((s) => s.date === today);
    const dueWords = getDueWords(vocabulary);

    const profile: UserProfile = {
      total_words: vocabulary.length,
      current_streak: todayStats?.streak_count || 0,
      longest_streak: Math.max(0, ...dailyStats.map((s) => s.streak_count)),
      words_mastered: vocabulary.filter((w) => w.srs_level >= 5).length,
      today_reviewed: todayStats?.words_reviewed || 0,
      today_target: CONFIG.srs.dailyTarget,
    };

    return NextResponse.json({
      data: {
        profile,
        dueCount: dueWords.length,
        recentWords: vocabulary.slice(-5).reverse(),
        dailyStats: dailyStats,
      },
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
