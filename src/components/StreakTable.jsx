// src/components/StreakTable.jsx ← FINAL FIXED (NO MORE ERRORS)
import React, { useState } from 'react'
import useStore from '../store/useStore'

export default function StreakTable() {
  const { streaks, candles, minStreak, direction, patternTypeFilter } = useStore()  // ← ADDED candles HERE!
  const [filter, setFilter] = useState("ALL")

  const formatTime = (candle) => {
    // If candle has originalTimestamp, use it directly
    if (candle?.originalTimestamp) {
      let datePart, timePart
      const originalTimestamp = candle.originalTimestamp.trim()
      
      // Handle both formats: space-separated and ISO 8601
      if (originalTimestamp.includes('T')) {
        // ISO format: "2025-11-14T15:29:00+05:30"
        const parts = originalTimestamp.split('T')
        datePart = parts[0]
        timePart = parts[1].split(/[+-]/)[0] // Remove timezone
      } else {
        // Space-separated: "2025-08-31 18:30:00"
        [datePart, timePart] = originalTimestamp.split(' ')
      }
      
      if (!datePart || !timePart) {
        // Fallback if parsing fails
        return new Date(candle?.time * 1000).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
        }).replace(',', '')
      }
      
      const [year, month, day] = datePart.split('-')
      const [hour, minute] = timePart.split(':')
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthName = monthNames[parseInt(month) - 1]
      return `${day} ${monthName} ${hour}:${minute}`
    }
    // Fallback: format from Unix timestamp
    return new Date(candle?.time * 1000).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).replace(',', '')
  }

  // MAIN FILTER: length + direction + pattern type
  const filteredByMainFilters = React.useMemo(() => {
    return streaks.filter(s => {
      if (s.length !== minStreak) return false
      if (direction !== 'both' && s.direction !== direction) return false
      if (patternTypeFilter === 'REV' && !s.isReversal) return false
      if (patternTypeFilter === 'CON' && !s.isContinuation) return false
      return true
    })
  }, [streaks, minStreak, direction, patternTypeFilter])

  // Secondary filter: ALL / REV / CON / VOL
  const displayStreaks = filteredByMainFilters.filter(s => {
    if (filter === "ALL") return true
    if (filter === "REV") return s.isReversal || s.isDualBreak
    if (filter === "CON") return s.isContinuation || s.isDualBreak
    if (filter === "VOL") return s.isDualBreak
    return true
  })

  const reversals = streaks.filter(s => s.isReversal && !s.isDualBreak && s.length === minStreak)
  const continuations = streaks.filter(s => s.isContinuation && !s.isDualBreak && s.length === minStreak)
  const volatiles = streaks.filter(s => s.isDualBreak && s.length === minStreak)
  const strongSetups = streaks.filter(s => s.isStrong && s.length === minStreak)

  if (streaks.length === 0) return null

  const CONFIRMED_TEXT = 'CONFIRMED'
  const STRONG_TEXT = 'STRONG'

  return (
    <div className="mt-12">
      <div className="bg-black rounded-xl border border-gray-800 overflow-hidden">
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold text-cyan-400">
              Streak Analysis — {displayStreaks.length} Shown
            </h2>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200"
            >
              <option value="ALL">All</option>
              <option value="REV">Reversal (REV)</option>
              <option value="CON">Continuation (CON)</option>
              <option value="VOL">Volatile (VOL)</option>
            </select>
          </div>
          <div className="flex gap-8 text-sm text-gray-400">
            <span>Reversals: <span className="text-purple-400 font-bold">{reversals.length}</span></span>
            <span>Continuations: <span className="text-blue-400 font-bold">{continuations.length}</span></span>
            <span>Volatiles: <span className="text-orange-400 font-bold">{volatiles.length}</span></span>
            <span>Strong: <span className="text-emerald-400 font-bold">{strongSetups.length}</span></span>
          </div>
        </div>

        <div className="p-6">
          <pre className="font-mono text-sm text-gray-300 leading-relaxed">
            {displayStreaks.map((s, i) => {
              const colorClass = s.isStrong ? 'text-emerald-400 font-bold' : 'text-yellow-300'
              let type = ''
              let typeColor = ''
              if (s.isDualBreak) {
                type = `VOL→${s.volResolution || 'UNRESOLVED'}`
                typeColor = 'text-orange-400'
              } else if (s.isReversal) {
                type = 'REV'
                typeColor = 'text-purple-400'
              } else {
                type = 'CON'
                typeColor = 'text-blue-400'
              }

              return (
                <div key={i} className={`${colorClass} flex justify-between items-center py-1 border-b border-gray-800/50`}>
                  <div>
                    <span className="text-white">{s.length}{s.direction.toUpperCase()[0]}</span>{' '}
                    <span className={typeColor}>{type}</span>{' '}
                    <span className="text-gray-400">{s.movePercent}%</span>{' | '}
                    <span className={s.penetration >= 6 ? 'text-green-400' : 'text-orange-400'}>
                      Pen: {s.penetration.toFixed(1)}pts
                    </span>
                    {s.confirmedByNext && <span className="text-cyan-400 font-bold"> {CONFIRMED_TEXT}</span>}
                    {s.isStrong && <span className="text-pink-400 font-bold"> {STRONG_TEXT}</span>}
                  </div>
                  <span className="text-gray-500 text-xs">
                    {s.nextCandle ? formatTime(s.nextCandle) : '—'}
                  </span>
                </div>
              )
            })}
          </pre>
        </div>
      </div>
    </div>
  )
}