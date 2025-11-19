// src/components/StrategyTester/SummaryStats.jsx
import React from 'react'

export default function SummaryStats({ results, strategyType }) {
  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      <div className="bg-gradient-to-br from-cyan-900 to-cyan-950 p-6 rounded-lg border border-cyan-700">
        <div className="text-cyan-400 text-sm font-medium mb-1">Total Trades</div>
        <div className="text-4xl font-black text-white">{results.totalTrades}</div>
        <div className="text-xs text-gray-400 mt-1">
          {strategyType === 'reversal' ? 'Reversal Setups' : 'Continuation Setups'}
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 rounded-lg border border-emerald-700">
        <div className="text-emerald-400 text-sm font-medium mb-1">Win Rate</div>
        <div className="text-4xl font-black text-white">{results.winRate}%</div>
        <div className="text-xs text-gray-400 mt-1">
          Trades that didn't hit SL
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-red-900 to-red-950 p-6 rounded-lg border border-red-700">
        <div className="text-red-400 text-sm font-medium mb-1">Stop Loss Hits</div>
        <div className="text-4xl font-black text-white">{results.slHits}</div>
        <div className="text-xs text-gray-400 mt-1">
          Out of {results.totalTrades} trades
        </div>
      </div>
    </div>
  )
}