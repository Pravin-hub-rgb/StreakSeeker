// src/components/StrategyTester/SummaryStats.jsx ← FINAL PRO VERSION
import React from 'react'

export default function SummaryStats({ results, strategyType, trailEnabled, showRMultiple = false }) {
  const netPnL = results.trades.reduce((sum, t) => sum + t.pnl, 0)
  const winners = results.trades.filter(t => t.pnl > 0).length
  const losers = results.trades.filter(t => t.pnl < 0).length
  const winRate = results.totalTrades > 0 ? ((winners / results.totalTrades) * 100).toFixed(1) : '0.0'

  return (
    <div className="bg-black/90 backdrop-blur-sm rounded border border-gray-700/50 overflow-hidden font-mono">
      <div className="px-3 py-2 border-b border-gray-700/50 bg-gray-900/50">
        <h3 className="text-sm font-semibold text-cyan-400">Strategy Performance</h3>
      </div>
      <div className="p-4 space-y-1">
        <div className="text-sm font-mono">
          <span className="text-cyan-400">Total Trades:</span> <span className="text-white">{results.totalTrades}</span>
        </div>
        <div className="text-sm font-mono">
          <span className="text-cyan-400">Net P&L:</span> <span className={netPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>{netPnL >= 0 ? '+' : ''}{netPnL.toFixed(2)} pts</span>
        </div>
        <div className="text-sm font-mono">
          <span className="text-cyan-400">Win Rate:</span> <span className="text-emerald-400">{winRate}%</span> <span className="text-gray-400">({winners}W / {losers}L)</span>
        </div>
        <div className="text-sm font-mono">
          <span className="text-cyan-400">Stop Loss Hits:</span> <span className="text-red-400">{results.slHits}</span>
        </div>
        {trailEnabled && (
          <div className="text-sm font-mono">
            <span className="text-cyan-400">Saved by Trail:</span> <span className="text-purple-400">{results.trailedCount}</span>
          </div>
        )}
        {showRMultiple && (
          <>
            <div className="text-sm font-mono">
              <span className="text-cyan-400">Points Won:</span> <span className="text-emerald-400">+{results.pointsWon}</span>
            </div>
            <div className="text-sm font-mono">
              <span className="text-cyan-400">Points Lost:</span> <span className="text-red-400">-{results.pointsLost}</span>
            </div>
            <div className="text-sm font-mono">
              <span className="text-cyan-400">Net Points:</span> <span className={results.totalPoints >= 0 ? 'text-emerald-400' : 'text-red-400'}>{results.totalPoints > 0 ? '+' : ''}{results.totalPoints}</span>
            </div>
            <div className="text-sm font-mono">
              <span className="text-cyan-400">Avg Points:</span> <span className="text-yellow-400">{results.avgPoints}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}