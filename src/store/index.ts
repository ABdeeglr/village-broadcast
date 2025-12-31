import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Danmaku, StreamStatus } from '../types';

// ============================================================
// 用户 Store
// ============================================================

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// ============================================================
// 直播 Store
// ============================================================

interface StreamState {
  isLive: boolean;
  viewerCount: number;
  streamName: string;
  startedAt: string | null;
  setStreamStatus: (status: StreamStatus) => void;
  resetStream: () => void;
}

export const useStreamStore = create<StreamState>((set) => ({
  isLive: false,
  viewerCount: 0,
  streamName: 'live',
  startedAt: null,

  setStreamStatus: (status) =>
    set({
      isLive: status.isLive,
      viewerCount: status.viewerCount,
      streamName: status.streamName || 'live',
      startedAt: status.startedAt || null,
    }),

  resetStream: () =>
    set({
      isLive: false,
      viewerCount: 0,
      streamName: 'live',
      startedAt: null,
    }),
}));

// ============================================================
// 弹幕 Store
// ============================================================

interface DanmakuState {
  danmakuList: Danmaku[];
  showDanmaku: boolean;
  danmakuOpacity: number;
  danmakuSpeed: number;

  addDanmaku: (danmaku: Danmaku) => void;
  setDanmakuList: (list: Danmaku[]) => void;
  clearDanmaku: () => void;
  toggleDanmaku: () => void;
  setDanmakuOpacity: (opacity: number) => void;
  setDanmakuSpeed: (speed: number) => void;
}

export const useDanmakuStore = create<DanmakuState>()(
  persist(
    (set) => ({
      danmakuList: [],
      showDanmaku: true,
      danmakuOpacity: 1,
      danmakuSpeed: 1,

      addDanmaku: (danmaku) =>
        set((state) => ({ danmakuList: [...state.danmakuList, danmaku] })),

      setDanmakuList: (list) => set({ danmakuList: list }),

      clearDanmaku: () => set({ danmakuList: [] }),

      toggleDanmaku: () => set((state) => ({ showDanmaku: !state.showDanmaku })),

      setDanmakuOpacity: (opacity) => set({ danmakuOpacity: opacity }),

      setDanmakuSpeed: (speed) => set({ danmakuSpeed: speed }),
    }),
    {
      name: 'danmaku-storage',
      partialize: (state) => ({
        showDanmaku: state.showDanmaku,
        danmakuOpacity: state.danmakuOpacity,
        danmakuSpeed: state.danmakuSpeed,
      }),
    }
  )
);
