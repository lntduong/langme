// ================================================
// LANGME - Configuration
// ================================================

export const CONFIG = {
  // AI Proxy Configuration
  ai: {
    baseUrl: process.env.NEXT_PUBLIC_AI_BASE_URL || 'http://100.100.66.15:8045/v1',
    apiKey: process.env.AI_API_KEY || 'sk-antigravity',
    model: process.env.AI_MODEL || 'gemini-2.5-flash',
    timeout: 60000,
  },

  // Google Sheets Configuration
  sheets: {
    spreadsheetId: process.env.GOOGLE_SHEET_ID || '',
    vocabularySheet: 'Vocabulary',
    statsSheet: 'UserStats',
    subscriptionsSheet: 'Subscriptions',
  },

  // SRS Configuration (Spaced Repetition)
  srs: {
    intervals: [0, 1, 3, 7, 14, 30, 60, 120, 240], // Days between reviews per level
    dailyTarget: 20, // Words to review per day
  },

  // App Configuration  
  app: {
    name: 'LangMe',
    description: 'Learn English & Chinese',
    version: '1.0.0',
  },

  // Categories
  categories: [
    'greeting', 'food', 'travel', 'business', 'daily',
    'emotion', 'nature', 'technology', 'education', 'other',
  ] as const,

  categoryLabels: {
    greeting: '👋 Chào hỏi',
    food: '🍜 Ẩm thực',
    travel: '✈️ Du lịch',
    business: '💼 Công việc',
    daily: '🏠 Hàng ngày',
    emotion: '💭 Cảm xúc',
    nature: '🌿 Tự nhiên',
    technology: '💻 Công nghệ',
    education: '📚 Giáo dục',
    other: '📌 Khác',
  } as Record<string, string>,
} as const;
