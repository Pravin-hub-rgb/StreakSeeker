// src/components/ChartContainer.jsx ← FINAL WORKING VERSION
import React, { useEffect, useRef } from 'react'
import { createChart, ColorType, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts'
import useStore from '../store/useStore'

export default function ChartContainer() {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const markersPrimitiveRef = useRef(null)

  const { candles, streaks, minStreak, direction, patternTypeFilter } = useStore()

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return

    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: { background: { type: ColorType.Solid, color: '#0f172a' }, textColor: '#e2e8f0' },
        grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
        width: chartContainerRef.current.clientWidth,
        height: 600,
        timeScale: { timeVisible: true, secondsVisible: false },
        crosshair: { mode: 1 },
      })
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      })
      const markersPrimitive = createSeriesMarkers(series, [])
      markersPrimitiveRef.current = markersPrimitive
      chartRef.current = chart
      seriesRef.current = series
    }

    seriesRef.current.setData(candles)

    if (markersPrimitiveRef.current) {
      const markers = streaks
        .filter(s => 
          s.length === minStreak && 
          s.brokeExtreme && 
          s.nextCandle &&
          (direction === 'both' || s.direction === direction)
        )
        .filter(s => {
          if (patternTypeFilter === "ALL") return true
          if (patternTypeFilter === "REV") return s.isReversal
          if (patternTypeFilter === "CON") return s.isContinuation
          return true
        })
        .map(s => {
          const time = candles[s.startIndex].time
          const isGreenStreak = s.direction === 'green'
          const label = s.isReversal ? 'R' : 'C'

          if (isGreenStreak) {
            return {
              time,
              position: 'belowBar',
              color: s.isReversal ? '#10b981' : '#34d399',
              shape: 'arrowUp',
              text: `${s.length}G-${label}`,
              size: 2.5,
            }
          }
          return {
            time,
            position: 'aboveBar',
            color: s.isReversal ? '#ef4444' : '#f87171',
            shape: 'arrowDown',
            text: `${s.length}R-${label}`,
            size: 2.5,
          }
        })

      markersPrimitiveRef.current.setMarkers(markers)
    }

    chartRef.current.timeScale().fitContent()

    const resize = () => chartRef.current?.applyOptions({ width: chartContainerRef.current.clientWidth })
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      chartRef.current?.remove()
      chartRef.current = null
    }
  }, [candles, streaks, minStreak, direction, patternTypeFilter]) // ← Now reacts to all filters

  if (candles.length === 0) return null

  return (
    <div className="mt-8 bg-slate-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">5-Minute Candlestick Chart</h2>
      <div ref={chartContainerRef} className="rounded-lg overflow-hidden" style={{ height: '600px', width: '100%' }} />
      
      <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-300">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
          Green Streak Reversal (Low Broken)
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-emerald-300 rounded-full"></div>
          Green Streak Continuation (High Broken)
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-red-500 rounded-full"></div>
          Red Streak Reversal (High Broken)
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-red-300 rounded-full"></div>
          Red Streak Continuation (Low Broken)
        </div>
      </div>
    </div>
  )
}