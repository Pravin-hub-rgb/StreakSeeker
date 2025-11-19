// src/components/StrategyTester/SummaryStats.jsx ← FINAL PRO VERSION
import React from 'react'

export default function SummaryStats({ results, strategyType, trailEnabled }) {
  const netPnL = results.trades.reduce((sum, t) => sum + t.pnl, 0)
  const winners = results.trades.filter(t => t.pnl > 0).length
  const losers = results.trades.filter(t => t.pnl < 0).length
  const winRate = results.totalTrades > 0 ? ((winners / results.totalTrades) * 100).toFixed(1) : '0.0'

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">

      {/* TOTAL TRADES */}
      <div className="bg-gradient-to-br from-cyan-900/60 to-cyan-950/80 p-4 rounded-lg border border-cyan-700/50 backdrop-blur-sm">
        <div className="text-cyan-300/80 text-xs font-medium mb-1">Total Trades</div>
        <div className="text-2xl font-bold text-white">{results.totalTrades}</div>
      </div>

      {/* NET P&L */}
      <div className={`p-4 rounded-lg border backdrop-blur-sm ${netPnL >= 0 ? 'bg-gradient-to-br from-emerald-900/60 to-emerald-950/80 border-emerald-600/50' : 'bg-gradient-to-br from-red-900/60 to-red-950/80 border-red-600/50'}`}>
        <div className="text-gray-300/80 text-xs font-medium mb-1">Net P&L</div>
        <div className={`text-2xl font-bold ${netPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {netPnL >= 0 ? '+' : ''}{netPnL.toFixed(1)} <span className="text-sm text-gray-400">pts</span>
        </div>
      </div>

      {/* WIN RATE */}
      <div className="bg-gradient-to-br from-emerald-900/60 to-emerald-950/80 p-4 rounded-lg border border-emerald-700/50 backdrop-blur-sm">
        <div className="text-emerald-300/80 text-xs font-medium mb-1">
          Win Rate {trailEnabled && <span className="text-[10px]">(Trail)</span>}
        </div>
        <div className="text-2xl font-bold text-white">{winRate}%</div>
        <div className="text-[10px] text-gray-400/70 mt-0.5">{winners}W / {losers}L</div>
      </div>

      {/* SL HITS */}
      <div className="bg-gradient-to-br from-red-900/60 to-red-950/80 p-4 rounded-lg border border-red-700/50 backdrop-blur-sm">
        <div className="text-red-300/80 text-xs font-medium mb-1">Stop Loss Hits</div>
        <div className="text-2xl font-bold text-white">{results.slHits}</div>
      </div>

      {/* TRAILED TRADES */}
      {trailEnabled && (
        <div className="bg-gradient-to-br from-purple-900/60 to-purple-950/80 p-4 rounded-lg border border-purple-700/50 backdrop-blur-sm">
          <div className="text-purple-300/80 text-xs font-medium mb-1">Saved by Trail</div>
          <div className="text-2xl font-bold text-white">{results.trailedCount}</div>
          <div className="text-[10px] text-gray-400/70 mt-0.5">SL moved in profit</div>
        </div>
      )}
    </div>
  )
}