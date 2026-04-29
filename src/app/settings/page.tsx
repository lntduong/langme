"use client";

import styles from "./page.module.css";
import { useSettings } from "@/hooks/useSettings";
import { 
  Globe, 
  Vibrate, 
  Volume2, 
  Moon, 
  UserRound, 
  Ban, 
  RotateCcw, 
  Star, 
  PenLine, 
  FileText,
  ChevronRight
} from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSetting, isLoaded } = useSettings();

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
    <div 
      className={`${styles.toggle} ${checked ? styles.toggleActive : ""}`}
      onClick={() => onChange(!checked)}
    >
      <div className={styles.toggleKnob} />
    </div>
  );

  if (!isLoaded) return <div className={styles.container}></div>; // Avoid hydration mismatch

  return (
    <div className={styles.container}>
      {/* Block 1: General */}
      <div className={styles.block}>
        <div className={styles.item}>
          <div className={styles.itemLeft}>
            <Globe className={styles.icon} size={20} strokeWidth={2.5} />
            <span className={styles.label}>Language</span>
          </div>
          <div className={styles.itemRight}>
            <span className={styles.valueText}>{settings.language}</span>
            <ChevronRight className={styles.chevron} size={16} strokeWidth={2.5} />
          </div>
        </div>
        
        <div className={styles.item}>
          <div className={styles.itemLeft}>
            <Vibrate className={styles.icon} size={20} strokeWidth={2.5} />
            <span className={styles.label}>Vibrations</span>
          </div>
          <Toggle checked={settings.vibrations} onChange={(v) => updateSetting("vibrations", v)} />
        </div>

        <div className={styles.item}>
          <div className={styles.itemLeft}>
            <Volume2 className={styles.icon} size={20} strokeWidth={2.5} />
            <span className={styles.label}>Sounds</span>
          </div>
          <Toggle checked={settings.sounds} onChange={(v) => updateSetting("sounds", v)} />
        </div>

        <div className={styles.item}>
          <div className={styles.itemLeft}>
            <Moon className={styles.icon} size={20} strokeWidth={2.5} />
            <span className={styles.label}>Dark mode</span>
          </div>
          <Toggle checked={settings.darkMode} onChange={(v) => updateSetting("darkMode", v)} />
        </div>
      </div>

      {/* Block 2: Account */}
      <div className={styles.block}>
        <div className={styles.item}>
          <div className={styles.itemLeft}>
            <UserRound className={styles.icon} size={20} strokeWidth={2.5} />
            <span className={styles.label}>Account Connection</span>
          </div>
          <Toggle checked={settings.accountConnection} onChange={(v) => updateSetting("accountConnection", v)} />
        </div>
      </div>

      {/* Block 3: Purchases */}
      <div className={styles.block}>
        <div className={styles.item}>
          <div className={styles.itemLeft}>
            <Ban className={styles.icon} size={20} strokeWidth={2.5} />
            <span className={styles.label}>Remove Ads</span>
          </div>
          <Toggle checked={settings.removeAds} onChange={(v) => updateSetting("removeAds", v)} />
        </div>
        <div className={styles.item}>
          <div className={styles.itemLeft}>
            <RotateCcw className={styles.icon} size={20} strokeWidth={2.5} />
            <span className={styles.label}>Restore purchases</span>
          </div>
        </div>
      </div>

      {/* Block 4: Feedback */}
      <div className={styles.block}>
        <div className={styles.item}>
          <div className={styles.itemLeft}>
            <Star className={styles.icon} size={20} strokeWidth={2.5} />
            <span className={styles.label}>Rate us</span>
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.itemLeft}>
            <PenLine className={styles.icon} size={20} strokeWidth={2.5} />
            <span className={styles.label}>Write us</span>
          </div>
        </div>
      </div>

      {/* Block 5: Legal */}
      <div className={styles.block}>
        <div className={styles.item}>
          <div className={styles.itemLeft}>
            <FileText className={styles.icon} size={20} strokeWidth={2.5} />
            <span className={styles.label}>Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
