// src/store/useStore.js — UPDATED WITH patternTypeFilter
import { create } from 'zustand'

const useStore = create((set) => ({
  // DATA
  candles: [],
  streaks: [],
  loading: false,

  // FILTERS
  minStreak: 4,
  direction: 'both',        // 'both' | 'green' | 'red'
  minMovePercent: 0.20,

  // NEW — PATTERN TYPE FILTER (ALL | REV | CON)
  patternTypeFilter: "ALL",
  updatePatternTypeFilter: (value) => set({ patternTypeFilter: value }),

  // SETTERS
  setCandles: (candles) => set({ candles, streaks: [] }),
  setStreaks: (streaks) => set({ streaks }),
  setLoading: (loading) => set({ loading }),
  updateFilters: (updates) => set(updates),
}))

export default useStore
