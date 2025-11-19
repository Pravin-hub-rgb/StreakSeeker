// src/components/StrategyTester.jsx ← FINAL WITH TRAILING SL
import React, { useMemo } from 'react'
import useStore from '../store/useStore'
import StrategyControls from './StrategyTester/StrategyControls'
import SummaryStats from './StrategyTester/SummaryStats'
import StrategyInfoBanner from './StrategyTester/StrategyInfoBanner'
import RiskRewardTable from './StrategyTester/RiskRewardTable'
import { calculateStrategyResults } from '../utils/calculateStrategyResults'
import { Link } from 'react-router-dom'
import TradeLog from './StrategyTester/TradeLog'

export default function StrategyTester() {
    const { candles, streaks, resetAll } = useStore()
    const hasData = candles.length > 0

    // Strategy Settings State
    const [strategyType, setStrategyType] = React.useState('reversal')
    const [streakLength, setStreakLength] = React.useState(4)
    const [colorFilter, setColorFilter] = React.useState('both')
    const [slType, setSlType] = React.useState('entry')
    const [fixedPoints, setFixedPoints] = React.useState(10)

    // TRAILING SL STATES
    const [trailEnabled, setTrailEnabled] = React.useState(false)
    const [trailTrigger, setTrailTrigger] = React.useState(15)
    const [trailBy, setTrailBy] = React.useState(10)

    // Filter streaks
    const filteredStreaks = useMemo(() => {
        if (!hasData) return []
        return streaks.filter(s => {
            if (s.length !== streakLength) return false
            if (colorFilter === 'red' && s.direction !== 'red') return false
            if (colorFilter === 'green' && s.direction !== 'green') return false
            if (strategyType === 'reversal' && !s.isReversal) return false
            if (strategyType === 'continuation' && !s.isContinuation) return false
            return true
        })
    }, [streaks, streakLength, colorFilter, strategyType, hasData])

    // Calculate results — now with trailing
    const results = useMemo(() => {
        return calculateStrategyResults(
            filteredStreaks,
            candles,
            slType,
            fixedPoints,
            strategyType,
            trailEnabled ? { enabled: true, trigger: trailTrigger, trailBy } : null
        )
    }, [filteredStreaks, candles, slType, fixedPoints, strategyType, trailEnabled, trailTrigger, trailBy])

    if (!hasData) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
                <div className="text-center max-w-2xl">
                    <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-8">
                        Strategy Tester
                    </h1>
                    <p className="text-2xl text-gray-300 mb-12">
                        No data loaded yet.<br />
                        Please upload your CSV files on the main page first.
                    </p>
                    <Link
                        to="/"
                        className="inline-block px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-xl font-bold hover:scale-105 transition shadow-xl"
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
                        <h1 className="text-5xl font-bold text-cyan-400">Strategy Tester</h1>
                        <p className="text-xl text-gray-400">Backtest Reversal & Continuation Strategies</p>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/" className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition">
                            ← Back to Main
                        </Link>
                        <button onClick={resetAll} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition">
                            Reset All Data
                        </button>
                    </div>
                </div>

                <div className="bg-black/40 backdrop-blur rounded-xl border border-gray-800 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-900 to-blue-900 px-8 py-6">
                        <h2 className="text-4xl font-black text-white">Strategy Backtester</h2>
                        <p className="text-gray-200">Live results based on your uploaded data</p>
                    </div>

                    <div className="p-6 border-b border-gray-800">
                        <StrategyControls
                            strategyType={strategyType}
                            setStrategyType={setStrategyType}
                            streakLength={streakLength}
                            setStreakLength={setStreakLength}
                            colorFilter={colorFilter}
                            setColorFilter={setColorFilter}
                            slType={slType}
                            setSlType={setSlType}
                            fixedPoints={fixedPoints}
                            setFixedPoints={setFixedPoints}
                            // TRAILING SL — FIXED
                            trailEnabled={trailEnabled}
                            setTrailEnabled={setTrailEnabled}
                            trailTrigger={trailTrigger}
                            setTrailTrigger={setTrailTrigger}
                            trailBy={trailBy}
                            setTrailBy={setTrailBy}
                        />
                    </div>

                    <div className="p-8 space-y-8">
                        <SummaryStats results={results} strategyType={strategyType} trailEnabled={trailEnabled} />
                        <StrategyInfoBanner
                            strategyType={strategyType}
                            streakLength={streakLength}
                            colorFilter={colorFilter}
                            slType={slType}
                            fixedPoints={fixedPoints}
                            trailEnabled={trailEnabled}
                            trailTrigger={trailTrigger}
                            trailBy={trailBy}
                        />
                        <RiskRewardTable rrStats={results.rrStats} />

                        {results.totalTrades === 0 && (
                            <div className="mt-8 bg-yellow-900/30 border border-yellow-600 rounded-lg p-6 text-center">
                                <p className="text-yellow-400 text-xl">
                                    No trades found with current settings.<br />
                                    Try changing streak length, color, or strategy type.
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