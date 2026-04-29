"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./page.module.css";
import type { AITranslation } from "@/types";
import { CONFIG } from "@/lib/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddWordPage() {
  const queryClient = useQueryClient();
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState<AITranslation | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [aiModel, setAiModel] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<"single" | "bulk">("single");

  // Form fields
  const [english, setEnglish] = useState("");
  const [chinese, setChinese] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [exampleEn, setExampleEn] = useState("");
  const [exampleZh, setExampleZh] = useState("");
  const [category, setCategory] = useState("other");

  // Bulk import
  const [bulkText, setBulkText] = useState("");
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
    status: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addMutation = useMutation({
    mutationFn: (data: Record<string, string>) =>
      fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      resetForm();
      showToast("✅ Đã thêm từ thành công!");
    },
    onError: () => {
      showToast("❌ Có lỗi xảy ra!");
    },
  });

  const resetForm = () => {
    setWord("");
    setEnglish("");
    setChinese("");
    setPinyin("");
    setExampleEn("");
    setExampleZh("");
    setCategory("other");
    setTranslation(null);
    setAiModel(null);
  };

  const handleAITranslate = async () => {
    if (!word.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.trim() }),
      });
      const result = await res.json();
      if (result.data) {
        const t = result.data as AITranslation;
        setTranslation(t);
        setEnglish(t.english);
        setChinese(t.chinese);
        setPinyin(t.pinyin);
        setExampleEn(t.example_en);
        setExampleZh(t.example_zh);
        setCategory(t.category);
        setAiModel(result.meta?.model || null);
        if (result.meta?.model === 'google-translate-free') {
          showToast('⚠️ AI hết quota, dùng Google Translate (không có ví dụ)');
        } else {
          showToast(`✅ Dịch thành công (${result.meta?.model})`);
        }
      }
    } catch {
      showToast("❌ Không thể kết nối AI");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;
    addMutation.mutate({
      word: word.trim(),
      english,
      chinese,
      pinyin,
      example_en: exampleEn,
      example_zh: exampleZh,
      category,
    });
  };

  const handleBulkImport = async () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    setBulkProgress({ current: 0, total: lines.length, status: "Đang xử lý..." });

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      setBulkProgress({
        current: i + 1,
        total: lines.length,
        status: `Đang dịch: ${line}`,
      });

      try {
        // First translate
        const transRes = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: line }),
        });
        const transData = await transRes.json();
        const t = transData.data as AITranslation | undefined;

        // Then add
        await fetch("/api/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            word: line,
            english: t?.english || "",
            chinese: t?.chinese || "",
            pinyin: t?.pinyin || "",
            example_en: t?.example_en || "",
            example_zh: t?.example_zh || "",
            category: t?.category || "other",
          }),
        });
      } catch {
        // Continue with next word
      }

      // Rate limiting delay
      if (i < lines.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    setBulkProgress(null);
    setBulkText("");
    queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    showToast(`✅ Đã import ${lines.length} từ!`);
  };

  return (
    <div className="page-content">
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className="gradient-text">Thêm từ mới</span>
        </h1>
      </header>

      {/* Tab Switch */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${tab === "single" ? styles.tabActive : ""}`}
          onClick={() => setTab("single")}
        >
          ✏️ Thêm từng từ
        </button>
        <button
          className={`${styles.tab} ${tab === "bulk" ? styles.tabActive : ""}`}
          onClick={() => setTab("bulk")}
        >
          📥 Import hàng loạt
        </button>
      </div>

      {tab === "single" ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Vietnamese Word Input */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tiếng Việt</label>
            <div className={styles.inputWithAction}>
              <input
                className="input"
                placeholder="Nhập từ tiếng Việt..."
                value={word}
                onChange={(e) => setWord(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.aiBtn}
                onClick={handleAITranslate}
                disabled={!word.trim() || isTranslating}
              >
                {isTranslating ? (
                  <span className={styles.spinner} />
                ) : (
                  "🤖 AI"
                )}
              </button>
            </div>
            {isTranslating && (
              <p className={styles.aiStatus}>
                ⏳ Đang thử các model AI...
              </p>
            )}
            {aiModel && !isTranslating && (
              <p className={styles.aiModelInfo}>
                {aiModel === 'google-translate-free'
                  ? '🌐 Google Translate (không có ví dụ)'
                  : `🤖 ${aiModel}`}
              </p>
            )}
          </div>

          {/* Translation Fields */}
          <div className={styles.translationGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>🇬🇧 English</label>
              <input
                className="input"
                placeholder="Hello"
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>🇨🇳 中文</label>
              <input
                className="input"
                placeholder="你好"
                value={chinese}
                onChange={(e) => setChinese(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Pinyin</label>
            <input
              className="input"
              placeholder="Nǐ hǎo"
              value={pinyin}
              onChange={(e) => setPinyin(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Ví dụ (EN)</label>
            <input
              className="input"
              placeholder="Hello, how are you?"
              value={exampleEn}
              onChange={(e) => setExampleEn(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Ví dụ (ZH)</label>
            <input
              className="input"
              placeholder="你好，你好吗？"
              value={exampleZh}
              onChange={(e) => setExampleZh(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Phân loại</label>
            <Select value={category} onValueChange={(val) => setCategory(val || "other")}>
              <SelectTrigger className="w-full bg-[rgba(26,26,62,0.5)] border-[rgba(255,255,255,0.06)] h-[50px] rounded-[14px] text-[0.95rem] px-4 text-white hover:bg-[rgba(36,36,80,0.8)] focus:ring-[rgba(108,92,231,0.15)] focus:ring-3 focus:border-[#6C5CE7] transition-all shadow-none">
                <SelectValue>
                  {CONFIG.categoryLabels[category as keyof typeof CONFIG.categoryLabels] || 'Chọn phân loại'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A3E] border-[rgba(255,255,255,0.06)] text-white backdrop-blur-xl rounded-[14px]">
                {CONFIG.categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="focus:bg-[#6C5CE7] focus:text-white cursor-pointer py-2 rounded-[8px] my-1 mx-1">
                    {CONFIG.categoryLabels[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Card */}
          {(english || chinese) && (
            <div className={`${styles.previewCard} animate-scale`}>
              <p className={styles.previewLabel}>Xem trước</p>
              <div className={styles.previewContent}>
                <h3 className={styles.previewWord}>{word || "..."}</h3>
                <div className={styles.previewTranslations}>
                  {english && <span>🇬🇧 {english}</span>}
                  {chinese && (
                    <span>
                      🇨🇳 {chinese} <small>({pinyin})</small>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`btn-primary ${styles.submitBtn}`}
            disabled={addMutation.isPending}
          >
            {addMutation.isPending ? "Đang thêm..." : "➕ Thêm từ"}
          </button>
        </form>
      ) : (
        /* Bulk Import Tab */
        <div className={styles.bulkSection}>
          <p className={styles.bulkDesc}>
            Nhập mỗi từ tiếng Việt trên một dòng. AI sẽ tự động dịch từng từ.
          </p>
          <textarea
            className={`input ${styles.bulkTextarea}`}
            placeholder={`Xin chào\nCảm ơn\nTạm biệt\nXin lỗi\n...`}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={10}
          />
          <div className={styles.bulkInfo}>
            <span>
              {bulkText.split("\n").filter((l) => l.trim()).length} từ
            </span>
          </div>

          {bulkProgress && (
            <div className={styles.progressBar}>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                  }}
                />
              </div>
              <p className={styles.progressText}>
                {bulkProgress.status} ({bulkProgress.current}/{bulkProgress.total})
              </p>
            </div>
          )}

          <button
            className={`btn-primary ${styles.submitBtn}`}
            onClick={handleBulkImport}
            disabled={
              !bulkText.trim() || bulkProgress !== null
            }
          >
            {bulkProgress
              ? `Đang import... ${bulkProgress.current}/${bulkProgress.total}`
              : "🚀 Bắt đầu Import"}
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
