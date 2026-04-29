"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "./page.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DailyStats, UserProfile } from "@/types";

interface StatsResponse {
  dailyStats: DailyStats[];
  profile: UserProfile;
}

export default function ChallengePage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data } = useQuery<{ data: StatsResponse }>({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
  });

  const dailyStats = data?.data?.dailyStats || [];

  // Helper functions for Calendar
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  // Convert to Mon=0, Sun=6
  const startDayOfWeek = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthStr = `${monthNames[month]} ${year}`;

  // Find completed days
  const completedDays: number[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const stat = dailyStats.find((s) => s.date === dateStr);
    if (stat && (stat.words_reviewed > 0 || stat.words_learned > 0)) {
      completedDays.push(i);
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const profile = data?.data?.profile;
  const mastered = profile?.words_mastered || 0;
  const levelProgress = Math.min(10, Math.floor(mastered / 20)); 
  
  const longestStreak = profile?.longest_streak || 0;
  const streakProgress = Math.min(10, Math.floor(longestStreak / 3));
  
  const totalWords = profile?.total_words || 0;
  const unstoppableProgress = Math.min(10, Math.floor(totalWords / 50));

  const awards = [
    { id: 1, title: "Level Legend", value: "Lv.10", progress: `${levelProgress} of 10`, icon: "⭐", unlocked: levelProgress >= 10 },
    { id: 2, title: "Perfect Play", value: "30 Ngày", progress: `${streakProgress} of 10`, icon: "🎯", unlocked: streakProgress >= 10 },
    { id: 3, title: "Unstoppable", value: "500 Từ", progress: `${unstoppableProgress} of 10`, icon: "💀", unlocked: unstoppableProgress >= 10 },
  ];

  const generateCalendar = () => {
    const grid = [];
    const totalSlots = Math.ceil((daysInMonth + startDayOfWeek) / 7) * 7;
    
    for (let i = 0; i < totalSlots; i++) {
      const dayNumber = i - startDayOfWeek + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const isCompleted = completedDays.includes(dayNumber);
      
      let isToday = false;
      if (isCurrentMonth) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
        isToday = dateStr === todayStr;
      }
      
      grid.push(
        <div 
          key={i} 
          className={`
            ${styles.dayCell} 
            ${!isCurrentMonth ? styles.dayEmpty : ""}
            ${isCompleted ? styles.dayCompleted : ""}
            ${isToday ? styles.dayToday : ""}
          `}
        >
          {isCurrentMonth ? dayNumber : ""}
        </div>
      );
    }
    return grid;
  };

  return (
    <div className={styles.container}>
      {/* Trophy Section */}
      <div className={styles.header}>
        <button className={styles.navButton} onClick={handlePrevMonth}><ChevronLeft size={24} /></button>
        <div className={styles.trophyContainer}>
          <div className={styles.trophyImagePlaceholder}>
            {completedDays.length >= 25 ? "🏆" : "🔥"}
          </div>
        </div>
        <button className={styles.navButton} onClick={handleNextMonth}><ChevronRight size={24} /></button>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBarWrapper}>
          <div className={styles.progressBar} style={{ width: `${(completedDays.length / daysInMonth) * 100}%` }}>
            <span className={styles.progressText}>{completedDays.length}</span>
          </div>
        </div>
        <span className={styles.progressTotal}>{daysInMonth}</span>
      </div>

      {/* Calendar */}
      <div className={styles.calendarSection}>
        <h2 className={styles.monthTitle}>{currentMonthStr}</h2>
        
        <div className={styles.weekdays}>
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
            <div key={d} className={styles.weekday}>{d}</div>
          ))}
        </div>
        
        <div className={styles.calendarGrid}>
          {generateCalendar()}
        </div>
      </div>

      {/* Awards Section */}
      <div className={styles.awardsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Achievements</h2>
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
