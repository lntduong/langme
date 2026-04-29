// ================================================
// LANGME - Google Sheets Client
// Server-side only - used in API routes
// ================================================

import { google } from 'googleapis';
import { CONFIG } from './config';
import type { VocabularyEntry, DailyStats } from '@/types';
import type { PushSubscription } from 'web-push';

function getAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  const parsed = JSON.parse(credentials);
  return new google.auth.GoogleAuth({
    credentials: parsed,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

// --- Vocabulary Operations ---

export async function getAllVocabulary(): Promise<VocabularyEntry[]> {
  const sheets = getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: CONFIG.sheets.spreadsheetId,
    range: `${CONFIG.sheets.vocabularySheet}!A2:N`,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows.map((row) => ({
    id: row[0] || '',
    word: row[1] || '',
    english: row[2] || '',
    chinese: row[3] || '',
    pinyin: row[4] || '',
    example_en: row[5] || '',
    example_zh: row[6] || '',
    category: row[7] || 'other',
    created_at: row[8] || '',
    last_reviewed: row[9] || '',
    next_review: row[10] || '',
    srs_level: parseInt(row[11] || '0', 10),
    review_count: parseInt(row[12] || '0', 10),
  }));
}

export async function addVocabulary(entry: Omit<VocabularyEntry, 'id' | 'last_reviewed' | 'next_review' | 'srs_level' | 'review_count'>): Promise<VocabularyEntry> {
  const sheets = getSheets();
  const id = `word_${Date.now()}`;
  const now = new Date().toISOString().split('T')[0];

  const newEntry: VocabularyEntry = {
    id,
    ...entry,
    created_at: now,
    last_reviewed: '',
    next_review: now, // Due immediately
    srs_level: 0,
    review_count: 0,
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId: CONFIG.sheets.spreadsheetId,
    range: `${CONFIG.sheets.vocabularySheet}!A:N`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        newEntry.id,
        newEntry.word,
        newEntry.english,
        newEntry.chinese,
        newEntry.pinyin,
        newEntry.example_en,
        newEntry.example_zh,
        newEntry.category,
        newEntry.created_at,
        newEntry.last_reviewed,
        newEntry.next_review,
        newEntry.srs_level.toString(),
        newEntry.review_count.toString(),
      ]],
    },
  });

  return newEntry;
}

export async function updateVocabulary(id: string, updates: Partial<VocabularyEntry>): Promise<void> {
  const sheets = getSheets();

  // Find the row index
  const allWords = await getAllVocabulary();
  const rowIndex = allWords.findIndex((w) => w.id === id);
  if (rowIndex === -1) throw new Error(`Word ${id} not found`);

  const updated = { ...allWords[rowIndex], ...updates };
  const sheetRow = rowIndex + 2; // +2 because of header row and 1-indexed

  await sheets.spreadsheets.values.update({
    spreadsheetId: CONFIG.sheets.spreadsheetId,
    range: `${CONFIG.sheets.vocabularySheet}!A${sheetRow}:N${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        updated.id,
        updated.word,
        updated.english,
        updated.chinese,
        updated.pinyin,
        updated.example_en,
        updated.example_zh,
        updated.category,
        updated.created_at,
        updated.last_reviewed,
        updated.next_review,
        updated.srs_level.toString(),
        updated.review_count.toString(),
      ]],
    },
  });
}

export async function deleteVocabulary(id: string): Promise<void> {
  const sheets = getSheets();

  // Find the row index
  const allWords = await getAllVocabulary();
  const rowIndex = allWords.findIndex((w) => w.id === id);
  if (rowIndex === -1) throw new Error(`Word ${id} not found`);

  // Get spreadsheet info to find the sheet ID
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: CONFIG.sheets.spreadsheetId,
  });

  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === CONFIG.sheets.vocabularySheet
  );

  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
    throw new Error('Sheet not found');
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: CONFIG.sheets.spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheet.properties.sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex + 1, // +1 for header
            endIndex: rowIndex + 2,
          },
        },
      }],
    },
  });
}

// --- Stats Operations ---

export async function getDailyStats(): Promise<DailyStats[]> {
  const sheets = getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: CONFIG.sheets.spreadsheetId,
    range: `${CONFIG.sheets.statsSheet}!A2:D`,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows.map((row) => ({
    date: row[0] || '',
    words_learned: parseInt(row[1] || '0', 10),
    words_reviewed: parseInt(row[2] || '0', 10),
    streak_count: parseInt(row[3] || '0', 10),
  }));
}

export async function updateDailyStats(stats: DailyStats): Promise<void> {
  const sheets = getSheets();
  const allStats = await getDailyStats();
  const existingIndex = allStats.findIndex((s) => s.date === stats.date);

  if (existingIndex >= 0) {
    const sheetRow = existingIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: CONFIG.sheets.spreadsheetId,
      range: `${CONFIG.sheets.statsSheet}!A${sheetRow}:D${sheetRow}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          stats.date,
          stats.words_learned.toString(),
          stats.words_reviewed.toString(),
          stats.streak_count.toString(),
        ]],
      },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: CONFIG.sheets.spreadsheetId,
      range: `${CONFIG.sheets.statsSheet}!A:D`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          stats.date,
          stats.words_learned.toString(),
          stats.words_reviewed.toString(),
          stats.streak_count.toString(),
        ]],
      },
    });
  }
}

// --- Push Subscriptions Operations ---

export async function getAllSubscriptions(): Promise<PushSubscription[]> {
  const sheets = getSheets();
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.sheets.spreadsheetId,
      range: `${CONFIG.sheets.subscriptionsSheet || 'Subscriptions'}!A2:B`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    return rows.map((row) => JSON.parse(row[1]));
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
}

export async function saveSubscription(subscription: PushSubscription): Promise<void> {
  const sheets = getSheets();
  const subString = JSON.stringify(subscription);
  const endpoint = subscription.endpoint;
  
  try {
    const allSubs = await getAllSubscriptions();
    const existingIndex = allSubs.findIndex((s) => s.endpoint === endpoint);

    if (existingIndex >= 0) {
      // Update existing
      const sheetRow = existingIndex + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG.sheets.spreadsheetId,
        range: `${CONFIG.sheets.subscriptionsSheet || 'Subscriptions'}!A${sheetRow}:B${sheetRow}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            endpoint,
            subString,
          ]],
        },
      });
    } else {
      // Append new
      await sheets.spreadsheets.values.append({
        spreadsheetId: CONFIG.sheets.spreadsheetId,
        range: `${CONFIG.sheets.subscriptionsSheet || 'Subscriptions'}!A:B`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            endpoint,
            subString,
          ]],
        },
      });
    }
  } catch (error) {
    console.error('Error saving subscription:', error);
    throw error;
  }
}
