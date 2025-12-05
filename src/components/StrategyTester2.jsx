import React, { useMemo } from 'react'
import useStore from '../store/useStore'
import StrategyControls from './StrategyTester/StrategyControls'
import SummaryStats from './StrategyTester/SummaryStats'
import StrategyInfoBanner from './StrategyTester/StrategyInfoBanner'
import RiskRewardTable from './StrategyTester/RiskRewardTable'
import TradeLog from './StrategyTester/TradeLog'
import { Link, useNavigate } from 'react-router-dom'
import { runStreakReversalStrategy } from '../utils/StreakReversalEngine'

export default function StrategyTester2() {
    const { candles, setCandles, setStreaks } = useStore()
    const navigate = useNavigate()
    const hasData = candles.length > 0

    const [streakLength, setStreakLength] = React.useState(4)
    const [colorFilter, setColorFilter] = React.useState('both')
    const trailEnabled = true
    const trailTrigger = 15
    const trailBy = 10

    // Find streaks and calculate results
    const { trades, debugLog } = useMemo(() => {
        if (!hasData) return { trades: [], debugLog: [] };
        return runStreakReversalStrategy(candles, streakLength, colorFilter);
    }, [candles, hasData, streakLength, colorFilter]);

    const results = useMemo(() => {
        const totalTrades = trades.length;
        const slHits = trades.filter(t => t.exitReason === 'SL').length;
        const trailedCount = trades.filter(t => t.currentSL !== (t.entryPrice - (t.direction === 'LONG' ? t.trailDistance : -t.trailDistance))).length;
        const rrStats = calculateRRStats(trades);
        
        // Calculate simple point system
        const points = trades.map(t => {
            const initialRisk = Math.abs(t.trailDistance);
            if (initialRisk === 0) return t.pnl < 0 ? -1 : 0;
            const rMultiple = t.pnl / initialRisk;
            
            if (rMultiple < 0) return -1; // Any loss = -1 point
            return Math.floor(rMultiple); // 1R = +1, 2R = +2, etc.
        });
        
        const totalPoints = points.reduce((sum, p) => sum + p, 0);
        const avgPoints = totalTrades > 0 ? (totalPoints / totalTrades).toFixed(2) : '0.00';
        const pointsWon = points.filter(p => p > 0).reduce((sum, p) => sum + p, 0);
        const pointsLost = Math.abs(points.filter(p => p < 0).reduce((sum, p) => sum + p, 0));
        const winningTrades = points.filter(p => p > 0).length;
        const losingTrades = points.filter(p => p < 0).length;
        const breakEvenTrades = points.filter(p => p === 0).length;
        
        return {
            trades,
            totalTrades,
            slHits,
            trailedCount,
            rrStats,
            totalPoints,
            avgPoints,
            pointsWon,
            pointsLost,
            winningTrades,
            losingTrades,
            breakEvenTrades
        };
    }, [trades])



    function calculateRRStats(trades) {
        const rrBuckets = {}
        trades.forEach(trade => {
            const rr = Math.floor(Math.abs(trade.pnl / Math.abs(trade.entryPrice - (trade.direction === 'LONG' ? trade.currentSL : trade.currentSL)))) // Better R:R calculation
            const key = `${rr}:1`
            rrBuckets[key] = (rrBuckets[key] || 0) + 1
        })
        return rrBuckets
    }

    if (!hasData) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
                <div className="text-center max-w-2xl">
                    <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-8">
                        Strategy Tester 2
                    </h1>
                    <p className="text-2xl text-gray-300 mb-12">
                        No data loaded yet.<br />
                        Please upload your CSV files on the main page first.
                    </p>
                    <Link
                        to="/"
                        className="inline-block px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-xl font-bold hover:scale-105 transition shadow-xl"
                    >
                        ← Go to Upload Page
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-5xl font-bold text-purple-400">Strategy Tester 2</h1>
                        <p className="text-xl text-gray-400">Advanced Streak Entry Strategy</p>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/" className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition">
                            ← Back to Main
                        </Link>
                        <button onClick={() => { setCandles([]); setStreaks([]); navigate('/'); }} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition">
                            Reset All Data
                        </button>
                    </div>
                </div>

                <div className="bg-black/40 backdrop-blur rounded-xl border border-gray-800 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-900 to-pink-900 px-8 py-6">
                        <h2 className="text-4xl font-black text-white">Advanced Streak Strategy</h2>
                        <p className="text-gray-200">Entry at streak candle open with breach confirmation</p>
                    </div>

                    <div className="p-6 border-b border-gray-800">
                        <div className="bg-gray-900 px-6 py-6 border-b border-gray-800 grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Streak Length (min: 3)</label>
                                <input type="number" min="3" max="15" value={streakLength} onChange={(e) => setStreakLength(Number(e.target.value))}
                                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Streak Color</label>
                                <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}
                                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white">
                                  <option value="both">Both</option>
                                  <option value="green">Green Only</option>
                                  <option value="red">Red Only</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <SummaryStats results={results} strategyType="reversal" trailEnabled={trailEnabled} showRMultiple={true} />
                        <StrategyInfoBanner
                            strategyType="reversal"
                            streakLength={streakLength}
                            colorFilter={colorFilter}
                            slType="entry"
                            fixedPoints={10}
                            trailEnabled={trailEnabled}
                            trailTrigger={trailTrigger}
                            trailBy={trailBy}
                        />


                        {results.totalTrades === 0 && (
                            <div className="mt-8 bg-yellow-900/30 border border-yellow-600 rounded-lg p-6 text-center">
                                <p className="text-yellow-400 text-xl">
                                    No trades found with current settings.<br />
                                    Try changing streak length or color.
                                </p>
                            </div>
                        )}
                        <TradeLog trades={results.trades} />
                    </div>
                </div>
            </div>
        </div>
    )
}