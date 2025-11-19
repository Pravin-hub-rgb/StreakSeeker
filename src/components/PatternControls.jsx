// src/components/PatternControls.jsx ← FINAL FIXED VERSION
import React from 'react'
import useStore from '../store/useStore'

export default function PatternControls() {
  const {
    candles,
    streaks,                    // ← Now we READ streaks, don't recompute!
    minStreak,
    direction,
    minMovePercent,
    patternTypeFilter,
    updateFilters,
    updatePatternTypeFilter
  } = useStore()

  // FILTER VISUALLY ONLY — NEVER CALL setStreaks() HERE!
  const filteredStreaks = React.useMemo(() => {
    if (!streaks.length) return []
    return streaks.filter(s => {
      if (s.length !== minStreak) return false
      if (direction !== 'both' && s.direction !== direction) return false

      if (patternTypeFilter === 'REV' && !s.isReversal) return false
      if (patternTypeFilter === 'CON' && !s.isContinuation) return false

      return true
    })
  }, [streaks, minStreak, direction, patternTypeFilter])

  const total = filteredStreaks.length
  const reversals = filteredStreaks.filter(s => s.isReversal).length
  const continuations = filteredStreaks.filter(s => s.isContinuation).length
  const strong = filteredStreaks.filter(s => s.isStrong).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* FILTER BOX */}
      <div className="bg-gray-800/90 backdrop-blur-sm p-3 rounded-2xl border border-gray-700 shadow-xl">
        <h2 className="text-2xl font-bold text-cyan-400 mb-3 text-center">Pattern Filters</h2>
        <div className="grid grid-cols-3 gap-4">
          {/* STREAK LENGTH */}
          <div>
            <label className="block text-gray-300 text-base mb-2">Streak Length</label>
            <input
              type="number"
              min="3" max="15"
              value={minStreak}
              onChange={e => updateFilters({ minStreak: +e.target.value })}
              className="w-full px-2 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-lg font-bold text-center focus:border-cyan-500 transition"
            />
          </div>
          {/* DIRECTION */}
          <div>
            <label className="block text-gray-300 text-base mb-2">Direction</label>
            <select
              value={direction}
              onChange={e => updateFilters({ direction: e.target.value })}
              className="w-full px-2 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-base focus:border-cyan-500 transition"
            >
              <option value="both">Both</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
            </select>
          </div>
          {/* PATTERN TYPE */}
          <div>
            <label className="block text-gray-300 text-base mb-2">Pattern Type</label>
            <select
              value={patternTypeFilter}
              onChange={(e) => updatePatternTypeFilter(e.target.value)}
              className="w-full px-2 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-base focus:border-cyan-500 transition"
            >
              <option value="ALL">All</option>
              <option value="REV">Reversal</option>
              <option value="CON">Continuation</option>
            </select>
          </div>
          {/* MIN MOVE % (optional - you can keep or remove) */}
          <div>
            <label className="block text-gray-300 text-base mb-2">Min Move %</label>
            <input
              type="number"
              step="0.05"
              value={minMovePercent}
              onChange={e => updateFilters({ minMovePercent: +e.target.value })}
              className="w-full px-2 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-lg font-bold text-center focus:border-cyan-500 transition"
            />
          </div>
        </div>
      </div>

      {/* STATS */}
      {total > 0 && (
        <div className="bg-black/60 backdrop-blur p-4 rounded-2xl border border-gray-700 font-mono text-base">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-gray-400 text-sm">Total</div>
              <div className="text-white text-2xl font-bold">{total}</div>
            </div>
            <div>
              <div className="text-purple-400 text-sm">Reversals</div>
              <div className="text-purple-300 text-2xl font-bold">{reversals}</div>
            </div>
            <div>
              <div className="text-blue-400 text-sm">Continuations</div>
              <div className="text-blue-300 text-2xl font-bold">{continuations}</div>
            </div>
            <div>
              <div className="text-emerald-400 text-sm">Strong</div>
              <div className="text-emerald-300 text-2xl font-bold">{strong}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}