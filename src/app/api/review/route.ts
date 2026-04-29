// ================================================
// LANGME - API Route: Review/SRS Update
// POST /api/review - Update SRS after review
// ================================================

import { NextRequest, NextResponse } from 'next/server';
import { updateVocabulary, getDailyStats, updateDailyStats } from '@/lib/sheets';
import { calculateNextReview } from '@/lib/srs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wordId, currentLevel, quality } = body;

    if (!wordId || currentLevel === undefined || quality === undefined) {
      return NextResponse.json(
        { error: 'wordId, currentLevel, and quality are required' },
        { status: 400 }
      );
    }

    // Calculate next review using SRS
    const { nextLevel, nextReviewDate } = calculateNextReview(currentLevel, quality);
    const today = new Date().toISOString().split('T')[0];

    // Update the word
    await updateVocabulary(wordId, {
      srs_level: nextLevel,
      next_review: nextReviewDate,
      last_reviewed: today,
      review_count: (body.reviewCount || 0) + 1,
    });

    // Update daily stats
    const allStats = await getDailyStats();
    const todayStats = allStats.find((s) => s.date === today);

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayStats = allStats.find((s) => s.date === yesterdayStr);
    const currentStreak = todayStats
      ? todayStats.streak_count
      : (yesterdayStats ? yesterdayStats.streak_count + 1 : 1);

    await updateDailyStats({
      date: today,
      words_learned: todayStats?.words_learned || 0,
      words_reviewed: (todayStats?.words_reviewed || 0) + 1,
      streak_count: currentStreak,
    });

    return NextResponse.json({
      data: { nextLevel, nextReviewDate, streak: currentStreak },
    });
  } catch (error) {
    console.error('Failed to process review:', error);
    return NextResponse.json(
      { error: 'Failed to process review' },
      { status: 500 }
    );
  }
}
