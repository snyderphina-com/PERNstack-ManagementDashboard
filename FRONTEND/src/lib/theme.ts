import { themes, defaultTheme, type ThemeKey, type ThemeVars } from "@/config/themes";

const STORAGE_KEY = "snyder-accent-theme";

function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

function applyVars(vars: ThemeVars): void {
  const root = document.documentElement;
  (Object.entries(vars) as [string, string][]).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/** Apply a theme by key. Reads current dark/light state from the DOM. */
export function applyTheme(key: ThemeKey): void {
  const theme = themes.find((t) => t.key === key);
  if (!theme) return;
  applyVars(isDark() ? theme.dark : theme.light);
}

/** Persist the chosen theme key to localStorage. */
export function saveTheme(key: ThemeKey): void {
  localStorage.setItem(STORAGE_KEY, key);
}

/**
 * Read saved key, apply it to the DOM, and return the key.
 * Falls back to the default (pink) theme when nothing is saved.
 */
export function loadSavedTheme(): ThemeKey {
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeKey | null;
  const key: ThemeKey =
    saved && themes.some((t) => t.key === saved) ? saved : defaultTheme;
  applyTheme(key);
  return key;
}

/**
 * Re-apply the correct light/dark variable set for the active theme.
 * Call this whenever dark mode toggles.
 */
export function reapplyThemeForColorScheme(key: ThemeKey): void {
  applyTheme(key);
}