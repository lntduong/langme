import { useState, useEffect } from "react";

interface Settings {
  language: string;
  vibrations: boolean;
  sounds: boolean;
  darkMode: boolean;
  accountConnection: boolean;
  removeAds: boolean;
}

const defaultSettings: Settings = {
  language: "English",
  vibrations: true,
  sounds: true,
  darkMode: false,
  accountConnection: true,
  removeAds: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("langme_settings");
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("langme_settings", JSON.stringify(settings));
      
      // Handle dark mode toggle (Optional: Toggle a class on body)
      if (settings.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [settings, isLoaded]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting, isLoaded };
}
