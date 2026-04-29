// ================================================
// LANGME - API Route: Vocabulary Update/Delete
// PUT /api/vocabulary/[id] - Update word
// DELETE /api/vocabulary/[id] - Delete word
// ================================================

import { NextRequest, NextResponse } from 'next/server';
import { updateVocabulary, deleteVocabulary } from '@/lib/sheets';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await updateVocabulary(id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update word:', error);
    return NextResponse.json(
      { error: 'Failed to update word' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteVocabulary(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete word:', error);
    return NextResponse.json(
      { error: 'Failed to delete word' },
      { status: 500 }
    );
  }
}
