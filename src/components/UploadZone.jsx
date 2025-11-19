// src/components/UploadZone.jsx ← FINAL FIXED VERSION
import React from 'react'
import Papa from 'papaparse'
import useStore from '../store/useStore'
import { parseCsvData } from '../lib/parseCsv'
import { detectStreaks } from '../lib/detectStreaks'  // ← ADD THIS IMPORT

export default function UploadZone() {
  const { setCandles, setStreaks, setLoading } = useStore()  // ← ADD setStreaks

  const handleDrop = (e) => {
    e.preventDefault()
    setLoading(true)

    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'))
    let allCandles = []
    let completed = 0
    const total = files.length

    const processAllFiles = () => {
      if (completed === total && allCandles.length > 0) {
        allCandles.sort((a, b) => a.time - b.time)

        // THIS IS THE MAGIC: Detect streaks for lengths 3 to 10
        const allStreaks = []
        for (let length = 3; length <= 10; length++) {
          const streaksForLength = detectStreaks(allCandles, {
            minStreak: length,
            direction: 'both',
            minMovePercent: 0.20
          })
          allStreaks.push(...streaksForLength)
        }

        // Save both candles and ALL possible streaks
        setCandles(allCandles)
        setStreaks(allStreaks)  // ← Now Strategy Tester has everything!

        setLoading(false)
      }
    }

    if (files.length === 0) {
      setLoading(false)
      return
    }

    files.forEach(file => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const candles = parseCsvData(result.data)
          allCandles = [...allCandles, ...candles]
          completed++
          processAllFiles()
        },
        error: (err) => {
          console.error("Parse error:", err)
          completed++
          processAllFiles()
        }
      })
    })
  }

  const handleDragOver = (e) => e.preventDefault()

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-4 border-dashed border-cyan-500 rounded-2xl p-16 text-center cursor-pointer hover:border-cyan-300 transition-all bg-black/20"
    >
      <div className="text-cyan-400 text-6xl mb-6">Chart Upload</div>
      <p className="text-2xl text-gray-300">Drop 20–50 CSV files here</p>
      <p className="text-sm text-gray-500 mt-4">5-min Nifty data • timestamp,open,high,low,close,volume,oi</p>
    </div>
  )
}