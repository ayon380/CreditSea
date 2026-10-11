import { create } from 'zustand';
import { IUser } from '../types';
import { getAuthToken, setAuthToken, removeAuthToken, apiRequest } from '../lib/api';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: IUser, token: string) => void;
  logout: () => void;
  setUser: (user: IUser) => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user: IUser, token: string) => {
    setAuthToken(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('creditsea_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    removeAuthToken();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user: IUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('creditsea_user', JSON.stringify(user));
    }
    set({ user });
  },

  initAuth: async () => {
    const token = getAuthToken();
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await apiRequest('/auth/me');
      if (res.success && res.user) {
        set({
          user: res.user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        removeAuthToken();
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      removeAuthToken();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
