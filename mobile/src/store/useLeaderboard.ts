// store/useLeaderboard.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Player {
  username: string;
  avatar: string;
  totalScore: number;
  sessionCount: number;
  rank: number;
}

type LeaderboardState = {
  weekly: Player[];
  monthly: Player[];
  setLeaderboard: (range: 'weekly' | 'monthly', players: Player[]) => void;
};

export const useLeaderboard = create<LeaderboardState>()(
  persist(
    (set) => ({
      weekly: [],
      monthly: [],
      setLeaderboard: (range, players) =>
        set({ [range]: players } as Partial<LeaderboardState>),
    }),
    {
      name: 'quizmint-leaderboard',
      storage: AsyncStorage,
    }
  )
);
