"use client";

import { useQuery } from "@tanstack/react-query";
import styles from "./page.module.css";
import type { UserProfile } from "@/types";
import Link from "next/link";
import { Flame } from "lucide-react";

interface StatsResponse {
  profile: UserProfile;
  dueCount: number;
}

export default function HomePage() {
  const { data, isLoading } = useQuery<{ data: StatsResponse }>({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
  });

  const profile = data?.data?.profile;
  const streak = profile?.current_streak || 0;
  
  // Calculate level based on mastered words (every 20 mastered words = 1 level)
  const wordsMastered = profile?.words_mastered || 0;
  const level = Math.max(1, Math.floor(wordsMastered / 20) + 1);

  return (
    <div className={styles.container}>
      {/* Top Streak Pill */}
      <div className={styles.topBar}>
        <div className={styles.streakPill}>
          <Flame size={18} color="#FF9F43" fill="#FF9F43" />
          <span className={styles.streakCount}>{isLoading ? "-" : streak}</span>
        </div>
      </div>

      {/* Center Content */}
      <div className={styles.centerContent}>
        <h1 className={styles.appName}>
          <span className={styles.triangle}></span>
          LangMe
        </h1>
        <p className={styles.levelText}>Level {isLoading ? "-" : level}</p>
      </div>

      {/* Bottom Play Button */}
      <div className={styles.bottomSection}>
        <Link href="/learn" className={styles.playButton}>
          Play
        </Link>
      </div>
    </div>
  );
}
