"use client";

import { useQuery } from "@tanstack/react-query";
import styles from "./page.module.css";
import type { UserProfile } from "@/types";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";

export default function CollectionPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
  });

  const profile: UserProfile | undefined = data?.data?.profile;

  const records = [
    { id: 1, title: "Longest Streak", value: profile?.longest_streak || 0, date: "Apr 29 2026", icon: "🔥" },
    { id: 2, title: "Words Learned", value: profile?.total_words || 0, date: "Total", icon: "👑" },
    { id: 3, title: "Mastered", value: profile?.words_mastered || 0, date: "Level 8+", icon: "🏆" },
  ];

  // Calculate logic for awards
  const mastered = profile?.words_mastered || 0;
  const levelProgress = Math.min(10, Math.floor(mastered / 20)); // "Level Legend": Reach level 10
  
  const longestStreak = profile?.longest_streak || 0;
  const streakProgress = Math.min(10, Math.floor(longestStreak / 3)); // "Perfect Play": Reach 30 days longest streak (10 blocks of 3 days)
  
  const totalWords = profile?.total_words || 0;
  const unstoppableProgress = Math.min(10, Math.floor(totalWords / 50)); // "Unstoppable": Reach 500 total words (10 blocks of 50)

  const awards = [
    { id: 1, title: "Level Legend", value: "Lv.10", progress: `${levelProgress} of 10`, icon: "⭐", unlocked: levelProgress >= 10 },
    { id: 2, title: "Perfect Play", value: "30 Ngày", progress: `${streakProgress} of 10`, icon: "🎯", unlocked: streakProgress >= 10 },
    { id: 3, title: "Unstoppable", value: "500 Từ", progress: `${unstoppableProgress} of 10`, icon: "💀", unlocked: unstoppableProgress >= 10 },
  ];

  return (
    <div className={styles.container}>
      {/* Actions (Dictionary & Add Word) */}
      <div className={styles.actionRow}>
        <Link href="/dictionary" className={styles.actionCard}>
          <div className={styles.actionIcon}><BookOpen size={24} /></div>
          <span className={styles.actionLabel}>Dictionary</span>
        </Link>
        <Link href="/add" className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles.actionPrimary}`}><Plus size={24} /></div>
          <span className={styles.actionLabel}>Add Word</span>
        </Link>
      </div>

      {/* Records */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Records</h2>
          <div className={styles.divider}></div>
        </div>
        
        <div className={styles.grid}>
          {records.map(record => (
            <div key={record.id} className={styles.card}>
              <div className={styles.cardIcon}>{record.icon}</div>
              <div className={styles.cardValueBadge}>{isLoading ? "-" : record.value}</div>
              <h3 className={styles.cardTitle}>{record.title}</h3>
              <p className={styles.cardSub}>{record.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Awards */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Awards</h2>
          <div className={styles.divider}></div>
        </div>
        
        <div className={styles.grid}>
          {awards.map(award => (
            <div key={award.id} className={`${styles.card} ${!award.unlocked ? styles.lockedCard : ""}`}>
              <div className={!award.unlocked ? styles.cardIconLocked : styles.cardIconAlt}>{award.icon}</div>
              <div className={styles.cardValueBadge}>{award.value}</div>
              <h3 className={styles.cardTitle}>{award.title}</h3>
              <p className={styles.cardSub}>{award.progress}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
