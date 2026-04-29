// ================================================
// LANGME - API Route: Vocabulary CRUD
// GET /api/vocabulary - List all words
// POST /api/vocabulary - Add new word
// ================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAllVocabulary, addVocabulary } from '@/lib/sheets';

export async function GET() {
  try {
    const vocabulary = await getAllVocabulary();
    return NextResponse.json({ data: vocabulary });
  } catch (error) {
    console.error('Failed to fetch vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, english, chinese, pinyin, example_en, example_zh, category } = body;

    if (!word) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }

    const entry = await addVocabulary({
      word,
      english: english || '',
      chinese: chinese || '',
      pinyin: pinyin || '',
      example_en: example_en || '',
      example_zh: example_zh || '',
      category: category || 'other',
      created_at: new Date().toISOString().split('T')[0],
    });

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    console.error('Failed to add word:', error);
    return NextResponse.json(
      { error: 'Failed to add word' },
      { status: 500 }
    );
  }
}
