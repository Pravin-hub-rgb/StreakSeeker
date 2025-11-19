// src/components/UploadZone.jsx
import React from 'react'
import Papa from 'papaparse'
import useStore from '../store/useStore'
import { parseCsvData } from '../lib/parseCsv'

export default function UploadZone() {
  const { setCandles, setLoading } = useStore()

  const handleDrop = (e) => {
    e.preventDefault()
    setLoading(true)

    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'))
    let allCandles = []

    let completed = 0
    const total = files.length

    files.forEach(file => {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          const candles = parseCsvData(result.data)
          allCandles = [...allCandles, ...candles]
          completed++

          if (completed === total) {
            allCandles.sort((a, b) => a.time - b.time) // chronological
            setCandles(allCandles)
            setLoading(false)
          }
        },
        error: () => {
          completed++
          if (completed === total) setLoading(false)
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