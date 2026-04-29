"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./page.module.css";
import type { VocabularyEntry } from "@/types";
import { getMasteryColor, getMasteryLabel } from "@/lib/srs";
import { CONFIG } from "@/lib/config";

export default function DictionaryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingWord, setEditingWord] = useState<VocabularyEntry | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ data: VocabularyEntry[] }>({
    queryKey: ["vocabulary"],
    queryFn: () => fetch("/api/vocabulary").then((r) => r.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/vocabulary/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...updates }: Partial<VocabularyEntry> & { id: string }) =>
      fetch(`/api/vocabulary/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      setEditingWord(null);
    },
  });

  const words = data?.data || [];
  const filtered = words.filter((w) => {
    const matchSearch =
      !search ||
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.english.toLowerCase().includes(search.toLowerCase()) ||
      w.chinese.includes(search) ||
      w.pinyin.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === "all" || w.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const speakWord = (text: string, lang: "en" | "zh") => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "en" ? "en-US" : "zh-CN";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="page-content">
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className="gradient-text">Từ vựng</span>
        </h1>
        <span className={styles.count}>{filtered.length} từ</span>
      </header>

      {/* Search */}
      <div className={styles.searchBar}>
        <svg
          className={styles.searchIcon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm từ vựng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearBtn} onClick={() => setSearch("")}>
            ✕
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className={styles.categories}>
        <button
          className={`${styles.categoryBtn} ${
            selectedCategory === "all" ? styles.categoryActive : ""
          }`}
          onClick={() => setSelectedCategory("all")}
        >
          Tất cả
        </button>
        {CONFIG.categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.categoryBtn} ${
              selectedCategory === cat ? styles.categoryActive : ""
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {CONFIG.categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Word List */}
      {isLoading ? (
        <div className={styles.loadingList}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔍</span>
          <p>{search ? "Không tìm thấy kết quả" : "Chưa có từ nào"}</p>
        </div>
      ) : (
        <div className={styles.wordList}>
          {filtered.map((word, idx) => (
            <div
              key={word.id}
              className={`${styles.wordCard} animate-in`}
              style={{ animationDelay: `${Math.min(idx * 0.03, 0.3)}s` }}
            >
              <div
                className={styles.wordCardHeader}
                onClick={() =>
                  setExpandedId(expandedId === word.id ? null : word.id)
                }
              >
                <div className={styles.wordInfo}>
                  <div className={styles.wordRow}>
                    <span className={styles.wordVi}>{word.word}</span>
                    <span
                      className={styles.masteryBadge}
                      style={{
                        backgroundColor: `${getMasteryColor(word.srs_level)}15`,
                        color: getMasteryColor(word.srs_level),
                        borderColor: `${getMasteryColor(word.srs_level)}30`,
                      }}
                    >
                      {getMasteryLabel(word.srs_level)}
                    </span>
                  </div>
                  <div className={styles.translations}>
                    <span className={styles.transEn}>
                      🇬🇧 {word.english}
                    </span>
                    <span className={styles.transZh}>
                      🇨🇳 {word.chinese}
                      <span className={styles.pinyin}> ({word.pinyin})</span>
                    </span>
                  </div>
                </div>
                <svg
                  className={`${styles.expandIcon} ${
                    expandedId === word.id ? styles.expanded : ""
                  }`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {expandedId === word.id && (
                <div className={styles.wordExpanded}>
                  {word.example_en && (
                    <div className={styles.example}>
                      <span className={styles.exampleLabel}>EN:</span>
                      <span>{word.example_en}</span>
                      <button
                        className={styles.speakBtn}
                        onClick={() => speakWord(word.english, "en")}
                      >
                        🔊
                      </button>
                    </div>
                  )}
                  {word.example_zh && (
                    <div className={styles.example}>
                      <span className={styles.exampleLabel}>ZH:</span>
                      <span>{word.example_zh}</span>
                      <button
                        className={styles.speakBtn}
                        onClick={() => speakWord(word.chinese, "zh")}
                      >
                        🔊
                      </button>
                    </div>
                  )}
                  <div className={styles.wordMeta}>
                    <span className={styles.metaItem}>
                      📅 {word.created_at}
                    </span>
                    <span className={styles.metaItem}>
                      🔄 Ôn {word.review_count} lần
                    </span>
                  </div>
                  <div className={styles.wordActions}>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, padding: "8px 12px", fontSize: "0.85rem" }}
                      onClick={() => setEditingWord(word)}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="btn-danger"
                      style={{ flex: 1 }}
                      onClick={() => {
                        if (confirm(`Xóa từ "${word.word}"?`)) {
                          deleteMutation.mutate(word.id);
                        }
                      }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingWord && (
        <div className={styles.modalOverlay} onClick={() => setEditingWord(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Chỉnh sửa từ</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateMutation.mutate({
                  id: editingWord.id,
                  word: formData.get("word") as string,
                  english: formData.get("english") as string,
                  chinese: formData.get("chinese") as string,
                  pinyin: formData.get("pinyin") as string,
                  example_en: formData.get("example_en") as string,
                  example_zh: formData.get("example_zh") as string,
                  category: formData.get("category") as string,
                });
              }}
            >
              <div className={styles.formGroup}>
                <label>Tiếng Việt</label>
                <input className="input" name="word" defaultValue={editingWord.word} />
              </div>
              <div className={styles.formGroup}>
                <label>English</label>
                <input className="input" name="english" defaultValue={editingWord.english} />
              </div>
              <div className={styles.formGroup}>
                <label>中文</label>
                <input className="input" name="chinese" defaultValue={editingWord.chinese} />
              </div>
              <div className={styles.formGroup}>
                <label>Pinyin</label>
                <input className="input" name="pinyin" defaultValue={editingWord.pinyin} />
              </div>
              <div className={styles.formGroup}>
                <label>Example (EN)</label>
                <input className="input" name="example_en" defaultValue={editingWord.example_en} />
              </div>
              <div className={styles.formGroup}>
                <label>Example (ZH)</label>
                <input className="input" name="example_zh" defaultValue={editingWord.example_zh} />
              </div>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select className="input" name="category" defaultValue={editingWord.category}>
                  {CONFIG.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {CONFIG.categoryLabels[cat]}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingWord(null)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
