import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',

  setTheme: (theme: Theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('creditsea_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(nextTheme);
  },

  initTheme: () => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('creditsea_theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') {
      get().setTheme(saved);
      return;
    }

    // Default to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    get().setTheme(prefersDark ? 'dark' : 'light');
  },
}));
