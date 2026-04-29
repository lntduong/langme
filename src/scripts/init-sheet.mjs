// Script to initialize Google Sheet headers
// Run: node src/scripts/init-sheet.mjs

import { google } from 'googleapis';

const SHEET_ID = '13W3dYQggccIMmfUjPtka7PFZ1UvPJ__bwqLzvOEgAIc';
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function initSheet() {
  console.log('🔧 Initializing Google Sheet...');

  // 1. Clear old data and insert headers for Vocabulary
  try {
    // First, read existing data
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Vocabulary!A1:N',
    });

    const rows = existingData.data.values || [];
    console.log(`📊 Found ${rows.length} existing rows in Vocabulary`);

    // Check if first row is already a header
    const isHeader = rows.length > 0 && rows[0][0] === 'ID';

    if (!isHeader) {
      console.log('📝 Adding header row...');

      // Clear the sheet first
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: 'Vocabulary!A:N',
      });

      // Write header + existing data
      const header = ['ID', 'Word', 'English', 'Chinese', 'Pinyin', 'ExampleEN', 'ExampleZH', 'Category', 'CreatedAt', 'LastReviewed', 'NextReview', 'SRSLevel', 'ReviewCount'];
      const allRows = [header, ...rows];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'Vocabulary!A1',
        valueInputOption: 'RAW',
        requestBody: { values: allRows },
      });

      console.log('✅ Vocabulary sheet initialized with headers!');
    } else {
      console.log('✅ Vocabulary sheet already has headers');
    }
  } catch (error) {
    console.error('❌ Error with Vocabulary sheet:', error.message);
  }

  // 2. Initialize UserStats sheet
  try {
    const existingStats = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'UserStats!A1:D',
    });

    const statsRows = existingStats.data.values || [];
    const hasStatsHeader = statsRows.length > 0 && statsRows[0][0] === 'Date';

    if (!hasStatsHeader) {
      console.log('📝 Adding UserStats header row...');

      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: 'UserStats!A:D',
      });

      const header = ['Date', 'WordsLearned', 'WordsReviewed', 'StreakCount'];
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'UserStats!A1',
        valueInputOption: 'RAW',
        requestBody: { values: [header, ...statsRows] },
      });

      console.log('✅ UserStats sheet initialized with headers!');
    } else {
      console.log('✅ UserStats sheet already has headers');
    }
  } catch (error) {
    console.error('❌ Error with UserStats sheet:', error.message);
  }

  console.log('\n🎉 Done! Your Google Sheet is ready.');
}

initSheet();
