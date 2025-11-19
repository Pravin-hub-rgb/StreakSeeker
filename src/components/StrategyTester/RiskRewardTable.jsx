// src/components/StrategyTester/RiskRewardTable.jsx
import React from 'react'

export default function RiskRewardTable({ rrStats }) {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded border border-gray-700/50 overflow-hidden font-mono">
      <div className="px-3 py-2 border-b border-gray-700/50">
        <h3 className="text-sm font-semibold text-cyan-400">Risk:Reward Performance</h3>
      </div>
      
      <div className="p-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(rrStats).map(([rr, stat], idx) => {
            const percentage = parseFloat(stat.percentage)
            let textColor = 'text-red-400'
            let indicator = '✗'
            
            if (percentage >= 70) {
              textColor = 'text-emerald-400'
              indicator = '✓'
            } else if (percentage >= 50) {
              textColor = 'text-yellow-400'
              indicator = '~'
            } else if (percentage >= 30) {
              textColor = 'text-orange-400'
              indicator = '!'
            }
            
            return (
              <div 
                key={rr}
                className={`flex items-center justify-between px-2 py-1.5 hover:bg-white/5 transition text-xs ${
                  idx % 2 === 1 ? 'border-l border-gray-700/50 pl-4' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 w-12">1:{rr}</span>
                  <span className="text-gray-400 w-16">{stat.hits} hits</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`${textColor} font-semibold w-12 text-right`}>{stat.percentage}%</span>
                  <span className={`${textColor} w-4`}>{indicator}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}