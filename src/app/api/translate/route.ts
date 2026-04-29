// ================================================
// LANGME - API Route: AI Translation
// POST /api/translate
// Multi-model failover with status reporting
// ================================================

import { NextRequest, NextResponse } from 'next/server';
import { translateWord } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word } = body;

    if (!word) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }

    const translation = await translateWord(word);
    const { _model, ...data } = translation;

    return NextResponse.json({
      data,
      meta: {
        model: _model,
        hasExamples: !!(data.example_en || data.example_zh),
      },
    });
  } catch (error) {
    console.error('Failed to translate:', error);
    return NextResponse.json(
      { error: 'Failed to translate word' },
      { status: 500 }
    );
  }
}
