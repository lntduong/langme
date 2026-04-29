"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./page.module.css";
import type { VocabularyEntry } from "@/types";
import { getDueWords, getMasteryLabel, getMasteryColor } from "@/lib/srs";

type CardFace = "front" | "back";

export default function LearnPage() {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [face, setFace] = useState<CardFace>("front");
  const [completed, setCompleted] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const { data, isLoading } = useQuery<{ data: VocabularyEntry[] }>({
    queryKey: ["vocabulary"],
    queryFn: () => fetch("/api/vocabulary").then((r) => r.json()),
  });

  const allWords = data?.data || [];
  const dueWords = getDueWords(allWords);

  const reviewMutation = useMutation({
    mutationFn: (payload: {
      wordId: string;
      currentLevel: number;
      quality: number;
      reviewCount: number;
    }) =>
      fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const currentWord = dueWords[currentIndex];

  const handleAnswer = useCallback(
    (quality: number) => {
      if (!currentWord) return;

      reviewMutation.mutate({
        wordId: currentWord.id,
        currentLevel: currentWord.srs_level,
        quality,
        reviewCount: currentWord.review_count,
      });

      setCompleted((c) => c + 1);
      setFace("front");

      if (currentIndex + 1 >= dueWords.length) {
        setSessionComplete(true);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [currentWord, currentIndex, dueWords.length, reviewMutation]
  );

  const flipCard = useCallback(() => {
    setFace((f) => (f === "front" ? "back" : "front"));
  }, []);

  const speakWord = (text: string, lang: "en" | "zh") => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Hủy các giọng đọc cũ đang bị kẹt trong hàng đợi
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "en" ? "en-US" : "zh-CN";
      utterance.rate = 0.85;
      
      // Thử tìm giọng đọc phù hợp
      const voices = window.speechSynthesis.getVoices();
      const targetLang = lang === "en" ? "en" : "zh";
      const voice = voices.find((v) => v.lang.toLowerCase().includes(targetLang));
      if (voice) {
        utterance.voice = voice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (face === "front") {
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          flipCard();
        }
      } else {
        if (e.key === "1") handleAnswer(0);
        if (e.key === "2") handleAnswer(3);
        if (e.key === "3") handleAnswer(4);
        if (e.key === "4") handleAnswer(5);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [face, flipCard, handleAnswer]);

  const resetSession = () => {
    setCurrentIndex(0);
    setFace("front");
    setCompleted(0);
    setSessionComplete(false);
    queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
  };

  if (isLoading) {
    return (
      <div className="page-content">
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (dueWords.length === 0 || sessionComplete) {
    return (
      <div className="page-content">
        <div className={styles.completeState}>
          <span className={styles.completeEmoji}>
            {sessionComplete ? "🎉" : "✨"}
          </span>
          <h2 className={styles.completeTitle}>
            {sessionComplete
              ? "Tuyệt vời!"
              : "Không có từ nào cần ôn"}
          </h2>
          <p className={styles.completeDesc}>
            {sessionComplete
              ? `Bạn đã ôn ${completed} từ trong phiên này!`
              : "Hãy thêm từ mới hoặc quay lại sau nhé."}
          </p>
          <div className={styles.completeActions}>
            {sessionComplete && (
              <button className="btn-primary" onClick={resetSession}>
                🔄 Ôn lại
              </button>
            )}
            <a href="/add" className="btn-secondary">
              ➕ Thêm từ mới
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className="gradient-text">Ôn tập</span>
        </h1>
        <span className={styles.progress}>
          {currentIndex + 1} / {dueWords.length}
        </span>
      </header>

      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${((currentIndex + 1) / dueWords.length) * 100}%`,
          }}
        />
      </div>

      {/* Flashcard */}
      <div className={styles.cardContainer} onClick={flipCard}>
        <div
          className={`${styles.flashcard} ${
            face === "back" ? styles.flipped : ""
          }`}
        >
          {/* Front */}
          <div className={styles.cardFront}>
            <div className={styles.cardBadge}>
              <span
                style={{
                  color: getMasteryColor(currentWord.srs_level),
                }}
              >
                {getMasteryLabel(currentWord.srs_level)}
              </span>
            </div>
            <h2 className={styles.cardWord}>{currentWord.word}</h2>
            <p className={styles.cardHint}>Bạn biết từ này không?</p>
            <p className={styles.tapHint}>👆 Chạm để xem đáp án</p>
          </div>

          {/* Back */}
          <div className={styles.cardBack}>
            <div className={styles.cardBadge}>
              <span className={styles.cardViWord}>{currentWord.word}</span>
            </div>

            <div className={styles.answerSection}>
              <div className={styles.answerRow}>
                <span className={styles.flag}>🇬🇧</span>
                <span className={styles.answerText}>{currentWord.english}</span>
                <button
                  className={styles.speakBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentWord.english, "en");
                  }}
                >
                  🔊
                </button>
              </div>

              <div className={styles.answerRow}>
                <span className={styles.flag}>🇨🇳</span>
                <div className={styles.answerTextGroup}>
                  <span className={styles.answerTextZh}>
                    {currentWord.chinese}
                  </span>
                  <span className={styles.answerPinyin}>
                    {currentWord.pinyin}
                  </span>
                </div>
                <button
                  className={styles.speakBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentWord.chinese, "zh");
                  }}
                >
                  🔊
                </button>
              </div>
            </div>

            {currentWord.example_en && (
              <div className={styles.exampleBox}>
                <p className={styles.exampleText}>
                  📖 {currentWord.example_en}
                </p>
                {currentWord.example_zh && (
                  <p className={styles.exampleTextZh}>
                    {currentWord.example_zh}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answer Buttons */}
      {face === "back" && (
        <div className={`${styles.answerButtons} animate-in`}>
          <button
            className={`${styles.answerBtn} ${styles.again}`}
            onClick={() => handleAnswer(0)}
          >
            <span className={styles.answerEmoji}>😓</span>
            <span>Quên</span>
            <span className={styles.answerKey}>1</span>
          </button>
          <button
            className={`${styles.answerBtn} ${styles.hard}`}
            onClick={() => handleAnswer(3)}
          >
            <span className={styles.answerEmoji}>🤔</span>
            <span>Khó</span>
            <span className={styles.answerKey}>2</span>
          </button>
          <button
            className={`${styles.answerBtn} ${styles.good}`}
            onClick={() => handleAnswer(4)}
          >
            <span className={styles.answerEmoji}>😊</span>
            <span>Tốt</span>
            <span className={styles.answerKey}>3</span>
          </button>
          <button
            className={`${styles.answerBtn} ${styles.easy}`}
            onClick={() => handleAnswer(5)}
          >
            <span className={styles.answerEmoji}>🤩</span>
            <span>Dễ</span>
            <span className={styles.answerKey}>4</span>
          </button>
        </div>
      )}

      {face === "front" && (
        <div className={styles.flipPrompt}>
          <button className="btn-primary" onClick={flipCard} style={{ width: "100%" }}>
            Hiện đáp án
          </button>
        </div>
      )}
    </div>
  );
}
