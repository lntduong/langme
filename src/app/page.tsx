"use client";

import { useQuery } from "@tanstack/react-query";
import styles from "./page.module.css";
import type { VocabularyEntry, UserProfile } from "@/types";
import { getMasteryColor } from "@/lib/srs";

interface StatsResponse {
  profile: UserProfile;
  dueCount: number;
  recentWords: VocabularyEntry[];
}

export default function HomePage() {
  const { data, isLoading } = useQuery<{ data: StatsResponse }>({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
  });

  const profile = data?.data?.profile;
  const dueCount = data?.data?.dueCount || 0;
  const recentWords = data?.data?.recentWords || [];

  return (
    <div className="page-content">
      {/* Header */}
      <header className={styles.header}>
        <div>
          <p className={styles.greeting}>Xin chào 👋</p>
          <h1 className={styles.title}>
            <span className="gradient-text">LangMe</span>
          </h1>
        </div>
        <div className={styles.streakBadge}>
          <span className={styles.streakFire}>🔥</span>
          <span className={styles.streakNumber}>
            {isLoading ? "—" : profile?.current_streak || 0}
          </span>
        </div>
      </header>

      {/* Streak Card */}
      <div className={`${styles.streakCard} animate-in`}>
        <div className={styles.streakCardInner}>
          <div className={styles.streakInfo}>
            <span className={styles.streakEmoji}>🔥</span>
            <div>
              <h3 className={styles.streakTitle}>
                {isLoading ? "—" : profile?.current_streak || 0} ngày liên tục
              </h3>
              <p className={styles.streakSub}>
                Kỷ lục: {isLoading ? "—" : profile?.longest_streak || 0} ngày
              </p>
            </div>
          </div>
          <div className={styles.streakDots}>
            {[...Array(7)].map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${
                  i < (profile?.current_streak || 0) % 7
                    ? styles.dotActive
                    : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`${styles.statsGrid} animate-in animate-in-delay-1`}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📚</span>
          <span className={styles.statNumber}>
            {isLoading ? "—" : profile?.total_words || 0}
          </span>
          <span className={styles.statLabel}>Tổng từ</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⏰</span>
          <span className={styles.statNumber}>
            {isLoading ? "—" : dueCount}
          </span>
          <span className={styles.statLabel}>Cần ôn</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>✅</span>
          <span className={styles.statNumber}>
            {isLoading ? "—" : profile?.today_reviewed || 0}
          </span>
          <span className={styles.statLabel}>Đã ôn hôm nay</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🏆</span>
          <span className={styles.statNumber}>
            {isLoading ? "—" : profile?.words_mastered || 0}
          </span>
          <span className={styles.statLabel}>Thành thạo</span>
        </div>
      </div>

      {/* Review CTA */}
      {dueCount > 0 && (
        <a
          href="/learn"
          className={`${styles.reviewCta} animate-in animate-in-delay-2`}
        >
          <div className={styles.reviewCtaContent}>
            <span className={styles.reviewCtaIcon}>📖</span>
            <div>
              <h3 className={styles.reviewCtaTitle}>Ôn tập ngay!</h3>
              <p className={styles.reviewCtaSub}>
                Có {dueCount} từ đang chờ bạn ôn luyện
              </p>
            </div>
          </div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      )}

      {/* Recent Words */}
      <div className={`${styles.section} animate-in animate-in-delay-3`}>
        <h2 className={styles.sectionTitle}>Từ vừa thêm</h2>
        {isLoading ? (
          <div className={styles.emptyState}>
            <div className="skeleton" style={{ height: 60, width: "100%" }} />
          </div>
        ) : recentWords.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>✨</span>
            <p>Chưa có từ nào. Hãy thêm từ đầu tiên!</p>
            <a href="/add" className="btn-primary" style={{ marginTop: 12 }}>
              Thêm từ mới
            </a>
          </div>
        ) : (
          <div className={styles.wordList}>
            {recentWords.map((word) => (
              <div key={word.id} className={styles.wordItem}>
                <div className={styles.wordMain}>
                  <span className={styles.wordVi}>{word.word}</span>
                  <span className={styles.wordEn}>{word.english}</span>
                </div>
                <div className={styles.wordCn}>
                  <span className={styles.wordZh}>{word.chinese}</span>
                  <span className={styles.wordPinyin}>{word.pinyin}</span>
                </div>
                <div
                  className={styles.wordLevel}
                  style={{
                    backgroundColor: `${getMasteryColor(word.srs_level)}20`,
                    color: getMasteryColor(word.srs_level),
                  }}
                >
                  Lv.{word.srs_level}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
