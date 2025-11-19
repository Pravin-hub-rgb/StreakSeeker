// src/components/StrategyTester/StrategyInfoBanner.jsx
import React from 'react'

export default function StrategyInfoBanner({ 
  strategyType, 
  streakLength, 
  colorFilter, 
  slType, 
  fixedPoints 
}) {
  return (
    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
      <div className="text-blue-300 text-sm">
        <strong>Current Strategy:</strong> {strategyType === 'reversal' ? 'Reversal' : 'Continuation'} | 
        <strong> Streak:</strong> {streakLength} candles | 
        <strong> Color:</strong> {colorFilter} | 
        <strong> SL:</strong> {slType === 'entry' ? 'Entry Candle' : slType === 'last' ? 'Last Candle' : `Fixed ${fixedPoints}pts`}
      </div>
    </div>
  )
}