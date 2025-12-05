// src/App.jsx  ← FINAL WITH "STRATEGY TESTER" AND "NEW BATCH" BUTTONS
import React from 'react'
import UploadZone from './components/UploadZone.jsx'
import PatternControls from './components/PatternControls.jsx'
import ChartContainer from './components/ChartContainer.jsx'
import StreakTable from './components/StreakTable.jsx'
import useStore from './store/useStore.js'
import StrategyTester from './components/StrategyTester.jsx'
import StrategyTester2 from './components/StrategyTester2.jsx'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Create a wrapper component to handle the navigation
function AppContent() {
  const { candles, loading, setCandles, setStreaks } = useStore()
  const navigate = useNavigate()

  const resetAll = () => {
    setCandles([])
    setStreaks([])
  }

  const goToStrategyTester = () => {
    navigate('/st')
  }

  const goToStrategyTester2 = () => {
    navigate('/st2')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="text-center py-10 relative">
        <h1 className="text-7xl font-black bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
          StreakSeeker
        </h1>
        <p className="text-2xl text-gray-400 mt-3">True Momentum Streak Analyzer</p>

        {/* BUTTONS CONTAINER - ALWAYS VISIBLE */}
        <div className="absolute top-8 right-8 flex gap-4">
          {/* Strategy Tester Button - ALWAYS VISIBLE */}
          <button
            onClick={goToStrategyTester}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold text-lg shadow-xl transform hover:scale-105 transition"
          >
            Strategy Tester
          </button>
          
          {/* Strategy Tester 2 Button - ALWAYS VISIBLE */}
          <button
            onClick={goToStrategyTester2}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-lg shadow-xl transform hover:scale-105 transition"
          >
            Strategy Tester 2
          </button>
          
          {/* New Batch Button - ONLY SHOWS WHEN DATA IS LOADED */}
          {candles.length > 0 && (
            <button
              onClick={resetAll}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-xl font-bold text-lg shadow-xl transform hover:scale-105 transition"
            >
              New Batch
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-20">
        {!candles.length ? (
          <div className="mt-20">
            <UploadZone />
            {loading && <p className="text-center mt-8 text-cyan-400 text-2xl animate-pulse">Parsing files...</p>}
          </div>
        ) : (
          <>
            <PatternControls />
            <ChartContainer />
            <StreakTable />
          </>
        )}
      </main>
    </div>
  )
}

// Main App component with Router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/st" element={<StrategyTester />} />
        <Route path="/st2" element={<StrategyTester2 />} />
      </Routes>
    </Router>
  )
}

export default App