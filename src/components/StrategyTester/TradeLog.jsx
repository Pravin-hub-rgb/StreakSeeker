// src/components/StrategyTester/TradeLog.jsx
import React from 'react'

const formatDateTime = (ts, originalTimestamp) => {
  // If we have original timestamp from CSV, use it directly
  if (originalTimestamp) {
    let datePart, timePart
    const timestamp = originalTimestamp.trim()
    
    // Handle both formats: space-separated and ISO 8601
    if (timestamp.includes('T')) {
      // ISO format: "2025-11-14T15:29:00+05:30"
      const parts = timestamp.split('T')
      datePart = parts[0]
      timePart = parts[1].split(/[+-]/)[0] // Remove timezone
    } else {
      // Space-separated: "2025-08-31 18:30:00"
      [datePart, timePart] = timestamp.split(' ')
    }
    
    if (!datePart || !timePart) {
      // Fallback if parsing fails
      const d = new Date(ts * 1000)
      const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      const time = d.toTimeString().slice(0, 8)
      return `${date} ${time}`
    }
    
    const [year, month, day] = datePart.split('-')
    const [hour, minute, second = '00'] = timePart.split(':')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthName = monthNames[parseInt(month) - 1]
    return `${day} ${monthName} ${hour}:${minute}:${second || '00'}`
  }
  // Fallback: format from Unix timestamp
  const d = new Date(ts * 1000)
  const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  const time = d.toTimeString().slice(0, 8)
  return `${date} ${time}`
}

export default function TradeLog({ trades }) {
  if (!trades?.length) return null

  const formatLogLine = (t, i) => {
    const entryTime = formatDateTime(t.entryTime, t.entryTimeOriginal)
    const exitTime = formatDateTime(t.exitTime, t.exitTimeOriginal)
    const pnlSign = t.pnl > 0 ? '+' : ''
    const pnlColor = t.pnl > 0 ? 'text-emerald-400' : t.pnl < 0 ? 'text-red-400' : 'text-gray-400'
    const exitReason = t.exitReason === 'trailing' ? 'TRAIL' : t.exitReason.toUpperCase()
    
    return `[${i + 1}] ${t.tradeDirection} | ENTRY: ${entryTime} @ ${t.entryPrice} | EXIT: ${exitTime} @ ${t.exitPrice} | P&L: ${pnlSign}${t.pnl} pts | ${exitReason}${t.trailed ? ' ✓' : ''}`
  }

  return (
    <div className="mt-8 bg-black/90 backdrop-blur-sm rounded border border-gray-700/50 overflow-hidden font-mono">
      <div className="px-3 py-2 border-b border-gray-700/50 bg-gray-900/50">
        <h3 className="text-sm font-semibold text-cyan-400">Trade Execution Log</h3>
        <p className="text-gray-400 text-xs mt-0.5">{trades.length} trades</p>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <pre className="p-3 text-xs text-gray-300 leading-relaxed">
          {trades.map((t, i) => {
            const pnlColor = t.pnl > 0 ? 'text-emerald-400' : t.pnl < 0 ? 'text-red-400' : 'text-gray-400'
            const entryTime = formatDateTime(t.entryTime, t.entryTimeOriginal)
            const exitTime = formatDateTime(t.exitTime, t.exitTimeOriginal)
            const exitReason = t.exitReason === 'trailing' ? 'TRAIL' : t.exitReason.toUpperCase()
            
            return (
              <div key={i} className={`mb-1 ${pnlColor} hover:text-white transition`}>
                [{String(i + 1).padStart(3, '0')}] {t.tradeDirection} | ENTRY: {entryTime} @ {t.entryPrice} | EXIT: {exitTime} @ {t.exitPrice} | P&L: {t.pnl > 0 ? '+' : ''}{t.pnl} pts | {exitReason}{t.trailed ? ' ✓' : ''}
              </div>
            )
          })}
        </pre>
      </div>
    </div>
  )
}