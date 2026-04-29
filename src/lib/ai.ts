// ================================================
// LANGME - AI Translation Service
// Multi-model failover with free Google Translate fallback
// Smart caching: remembers which model works
// ================================================

import OpenAI from 'openai';
import { CONFIG } from './config';
import type { AITranslation } from '@/types';

/**
 * List of AI models to try in order of preference.
 * If one fails (429/quota/error), automatically tries the next.
 * Prioritized by: speed → quality → cost
 */
const AI_MODELS = [
  // Gemini Flash (fast, free)
  'gemini-2.5-flash',
  'gemini-3-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-exp',
  // Gemini Pro
  'gemini-3-pro-low',
  'gemini-3-pro',
  'gemini-3.1-pro',
  // Claude models
  'claude-haiku-4',
  'claude-sonnet-4-5',
  'claude-sonnet-4-6',
  // GPT models
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-3.5-turbo',
];

/**
 * In-memory cache: remember which model last succeeded
 * so we try it first next time (avoid wasting time on dead models)
 */
let lastSuccessfulModel: string | null = null;
let failedModels: Map<string, number> = new Map(); // model → timestamp of failure
const FAILURE_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes before retrying a failed model

function getOpenAIClient() {
  return new OpenAI({
    apiKey: CONFIG.ai.apiKey,
    baseURL: CONFIG.ai.baseUrl,
    timeout: 30000, // 30s per model attempt (reduced from 60s)
  });
}

/**
 * Get ordered list of models, prioritizing last successful one
 */
function getOrderedModels(): string[] {
  const now = Date.now();
  
  // Filter out recently failed models
  const availableModels = AI_MODELS.filter((model) => {
    const failedAt = failedModels.get(model);
    if (!failedAt) return true;
    // Allow retry after cooldown
    if (now - failedAt > FAILURE_COOLDOWN_MS) {
      failedModels.delete(model);
      return true;
    }
    return false;
  });

  // Put last successful model first
  if (lastSuccessfulModel && availableModels.includes(lastSuccessfulModel)) {
    return [
      lastSuccessfulModel,
      ...availableModels.filter((m) => m !== lastSuccessfulModel),
    ];
  }

  return availableModels;
}

const TRANSLATION_PROMPT = (word: string) => `Dịch từ/cụm từ tiếng Việt sau sang tiếng Anh và tiếng Trung (giản thể):

"${word}"

Trả về JSON theo format:
{
  "english": "bản dịch tiếng Anh",
  "chinese": "bản dịch tiếng Trung giản thể",
  "pinyin": "phiên âm pinyin có dấu thanh",
  "example_en": "một câu ví dụ ngắn bằng tiếng Anh sử dụng từ này",
  "example_zh": "một câu ví dụ ngắn bằng tiếng Trung sử dụng từ này",
  "category": "phân loại (greeting/food/travel/business/daily/emotion/nature/technology/education/other)"
}`;

/**
 * Try translating with a specific AI model
 */
async function tryModelTranslation(
  openai: OpenAI,
  model: string,
  word: string
): Promise<AITranslation> {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'Bạn là trợ lý dịch thuật chuyên nghiệp. Hãy trả về JSON chính xác theo format yêu cầu, không thêm text nào khác.',
      },
      {
        role: 'user',
        content: TRANSLATION_PROMPT(word),
      },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || '{}';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI response does not contain valid JSON');
  }
  return JSON.parse(jsonMatch[0]) as AITranslation;
}

// ================================================
// Free Google Translate Fallback (no examples)
// ================================================

async function freeTranslate(text: string, targetLang: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data?.[0]?.[0]?.[0] || '';
  } catch {
    return '';
  }
}

async function getPinyin(chinese: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=rm&q=${encodeURIComponent(chinese)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data?.[0]?.[0]?.[3] || '';
  } catch {
    return '';
  }
}

async function translateWithFreeAPI(word: string): Promise<AITranslation> {
  const [english, chinese] = await Promise.all([
    freeTranslate(word, 'en'),
    freeTranslate(word, 'zh-CN'),
  ]);
  const pinyin = await getPinyin(chinese);

  return {
    english,
    chinese,
    pinyin,
    example_en: '',
    example_zh: '',
    category: 'other',
  };
}

// ================================================
// Main Translation Function (multi-model failover)
// ================================================

/**
 * Translate a Vietnamese word to English and Chinese.
 * Strategy:
 *   1. Try last successful model first (cached)
 *   2. Try remaining AI models, skipping recently failed ones
 *   3. If ALL AI models fail → fallback to free Google Translate (no examples)
 */
export async function translateWord(word: string): Promise<AITranslation & { _model?: string }> {
  const openai = getOpenAIClient();
  const models = getOrderedModels();

  if (models.length === 0) {
    console.warn('⚠️ All AI models are in cooldown. Using Google Translate.');
    const result = await translateWithFreeAPI(word);
    return { ...result, _model: 'google-translate-free' };
  }

  // Try each AI model in sequence
  for (const model of models) {
    try {
      console.log(`🤖 Trying model: ${model}...`);
      const result = await tryModelTranslation(openai, model, word);
      console.log(`✅ Success with model: ${model}`);
      
      // Cache success
      lastSuccessfulModel = model;
      
      return { ...result, _model: model };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const isQuotaError = msg.includes('429') || msg.includes('quota') || msg.includes('exhausted') || msg.includes('rate');
      
      console.warn(`❌ Model ${model} failed: ${msg.substring(0, 80)}...`);
      
      // Mark as failed with timestamp
      if (isQuotaError) {
        failedModels.set(model, Date.now());
      }
    }
  }

  // All AI models failed - use free Google Translate
  console.warn(`⚠️ All ${models.length} AI models failed. Falling back to Google Translate (no examples).`);
  const result = await translateWithFreeAPI(word);
  return { ...result, _model: 'google-translate-free' };
}

/**
 * Batch translate multiple words
 */
export async function translateWords(words: string[]): Promise<AITranslation[]> {
  const results: AITranslation[] = [];

  for (const word of words) {
    try {
      const translation = await translateWord(word);
      results.push(translation);
    } catch {
      results.push({
        english: '',
        chinese: '',
        pinyin: '',
        example_en: '',
        example_zh: '',
        category: 'other',
      });
    }
  }

  return results;
}
