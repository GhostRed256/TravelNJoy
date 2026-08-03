export type ThemeMode = 'light' | 'dark' | 'auto';

export const THEME_STORAGE_KEY = 'travelnjoy_theme';

export function getAutoTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) return 'dark';
  }

  const hours = new Date().getHours();
  // 7 PM (19) to 6 AM (6) = dark mode
  if (hours >= 19 || hours < 6) {
    return 'dark';
  }

  return 'light';
}

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(THEME_STORAGE_KEY);
    if (val === 'light' || val === 'dark' || val === 'auto') {
      return val as ThemeMode;
    }
  } catch {
    // Fallback if localStorage access fails
  }
  return null;
}

export function setStoredTheme(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Fallback if localStorage access fails
  }
}

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return getAutoTheme();
}
