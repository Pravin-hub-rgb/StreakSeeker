// src/components/StrategyTester/StrategyControls.jsx ← ONLY ADDED TRAILING SL
import React from 'react'

export default function StrategyControls({
  strategyType, setStrategyType,
  streakLength, setStreakLength,
  colorFilter, setColorFilter,
  slType, setSlType,
  fixedPoints, setFixedPoints,
  trailEnabled, setTrailEnabled,        // ← NEW
  trailTrigger, setTrailTrigger,        // ← NEW
  trailBy, setTrailBy                   // ← NEW
}) {
  return (
    <div className="bg-gray-900 px-6 py-6 border-b border-gray-800 grid grid-cols-2 gap-6">

      {/* Your existing controls */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Strategy Type</label>
        <select value={strategyType} onChange={(e) => setStrategyType(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white">
          <option value="reversal">Reversal</option>
          <option value="continuation">Continuation</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Streak Length (min: 3)</label>
        <input type="number" min="3" max="15" value={streakLength} onChange={(e) => setStreakLength(Number(e.target.value))}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Candle Color</label>
        <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white">
          <option value="both">Both</option>
          <option value="green">Green Only</option>
          <option value="red">Red Only</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Stop Loss Type</label>
        <select value={slType} onChange={(e) => setSlType(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white">
          <option value="entry">Entry Candle High/Low</option>
          <option value="last">Last Candle High/Low</option>
          <option value="fixed">Fixed Points</option>
        </select>
      </div>

      {slType === 'fixed' && (
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-2">Fixed Points</label>
          <input type="number" min="1" value={fixedPoints} onChange={(e) => setFixedPoints(Number(e.target.value))}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
        </div>
      )}

      {/* TRAILING SL — NEW */}
      <div className="col-span-2 border-t border-gray-700 pt-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={trailEnabled} onChange={(e) => setTrailEnabled(e.target.checked)} />
          <span className="text-cyan-400 font-bold">Enable Trailing Stop Loss</span>
        </label>
      </div>

      {trailEnabled && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Trail Trigger (points profit)</label>
            <input type="number" min="5" value={trailTrigger} onChange={(e) => setTrailTrigger(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Trail By (points)</label>
            <input type="number" min="1" value={trailBy} onChange={(e) => setTrailBy(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
          </div>
        </>
      )}
    </div>
  )
}