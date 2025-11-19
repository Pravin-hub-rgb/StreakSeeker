import React, { useState } from 'react'
import useStore from '../store/useStore'

export default function StreakTable() {
  const { streaks, candles } = useStore()
  const [filter, setFilter] = useState("ALL")  // ⬅ ADDED

  const formatTime = (t) => new Date(t * 1000).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
  }).replace(',', '')

  if (streaks.length === 0) return null

  // FILTER LOGIC ⬅ ADDED
  const filteredStreaks = streaks.filter(s => {
    if (filter === "ALL") return true

    if (filter === "VOL") {
      return s.isDualBreak
    }

    if (filter === "REV") {
      return s.isReversal || s.isDualBreak   // VOL also shown
    }

    if (filter === "CON") {
      return s.isContinuation || s.isDualBreak // VOL also shown
    }

    return true
  })

  const reversals = streaks.filter(s => s.isReversal && !s.isDualBreak)
  const continuations = streaks.filter(s => s.isContinuation && !s.isDualBreak)
  const volatiles = streaks.filter(s => s.isDualBreak)
  const strongSetups = streaks.filter(s => s.isStrong)

  const CONFIRMED_TEXT = 'CONFIRMED'
  const STRONG_TEXT = 'STRONG'

  return (
    <div className="mt-12">
      <div className="bg-black rounded-xl border border-gray-800 overflow-hidden">

        {/* HEADER + FILTER DROPDOWN */}
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold text-cyan-400">
              Streak Analysis — {filteredStreaks.length} Shown
            </h2>

            {/* 🔽 FILTER DROPDOWN */}
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

          {/* QUICK STATS */}
          <div className="flex gap-8 text-sm text-gray-400">
            <span>Reversals: <span className="text-purple-400 font-bold">{reversals.length}</span></span>
            <span>Continuations: <span className="text-blue-400 font-bold">{continuations.length}</span></span>
            <span>Volatiles: <span className="text-orange-400 font-bold">{volatiles.length}</span></span>
            <span>Strong (≥6pts or Confirmed): <span className="text-emerald-400 font-bold">{strongSetups.length}</span></span>
          </div>
        </div>

        {/* TABLE */}
        <div className="p-6">
          <pre className="font-mono text-sm text-gray-300 leading-relaxed">
            {filteredStreaks.map((s, i) => {
              const colorClass = s.isStrong
                ? 'text-emerald-400 font-bold'
                : 'text-yellow-300'

              // Determine type
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
                  <span className="text-gray-500 text-xs">{formatTime(candles[s.startIndex].time)}</span>
                </div>
              )
            })}
          </pre>
        </div>
      </div>
    </div>
  )
}
