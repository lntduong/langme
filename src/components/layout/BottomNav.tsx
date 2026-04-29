"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";

import { Home, CalendarDays, Plus, BookOpen, Settings } from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: <Home size={22} strokeWidth={2.5} />,
  },
  {
    href: "/challenge",
    label: "Challenge",
    icon: <CalendarDays size={22} strokeWidth={2.5} />,
  },
  {
    href: "/add",
    label: "Add",
    icon: <Plus size={28} strokeWidth={3} />,
    isCenter: true,
  },
  {
    href: "/dictionary",
    label: "Dictionary",
    icon: <BookOpen size={22} strokeWidth={2.5} />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings size={22} strokeWidth={2.5} />,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        
        if (item.isCenter) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.centerItem} ${isActive ? styles.active : ""}`}
            >
              <div className={styles.centerIcon}>{item.icon}</div>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.item} ${isActive ? styles.active : ""}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
