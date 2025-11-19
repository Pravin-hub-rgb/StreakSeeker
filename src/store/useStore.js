// src/store/useStore.js
import { create } from 'zustand'

const useStore = create((set) => ({
  candles: [],
  streaks: [],
  loading: false,

  // FILTERS (for main page)
  minStreak: 4,
  direction: 'both',
  minMovePercent: 0.20,
  patternTypeFilter: "ALL",

  // SETTERS
  setCandles: (candles) => set({ candles, streaks: [] }),
  setStreaks: (streaks) => set({ streaks }),
  setLoading: (loading) => set({ loading }),
  updateFilters: (updates) => set(updates),
  updatePatternTypeFilter: (value) => set({ patternTypeFilter: value }),

  // ADD THIS: Reset everything in one call
  resetAll: () => set({ candles: [], streaks: [], loading: false })
}))

export default useStore