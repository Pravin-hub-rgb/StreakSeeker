// src/utils/calculateStrategyResults.js

export function calculateStrategyResults(filteredStreaks, candles, slType, fixedPoints, strategyType) {
  if (!filteredStreaks || filteredStreaks.length === 0) {
    const emptyRRStats = {}
    for (let rr = 1; rr <= 20; rr++) {
      emptyRRStats[rr] = { hits: 0, percentage: '0.0' }
    }
    return { trades: [], totalTrades: 0, slHits: 0, rrStats: emptyRRStats, winRate: '0.0' }
  }

  const trades = []
  
  filteredStreaks.forEach(streak => {
    const streakStartIdx = streak.startIndex
    const lastStreakCandle = candles[streakStartIdx + streak.length - 1] // Last candle of streak
    const breakoutCandle = streak.nextCandle // Next candle after streak
    
    if (!lastStreakCandle || !breakoutCandle) return

    const isGreenStreak = streak.direction === 'green'
    
    // Determine Entry Price based on Strategy Type
    let entry, stopLoss, tradeDirection
    
    if (strategyType === 'reversal') {
      if (isGreenStreak) {
        // Green Reversal: Enter SHORT when next breaks LOW of last
        entry = lastStreakCandle.low
        tradeDirection = 'SHORT'
        
        // Stop Loss
        if (slType === 'entry') {
          stopLoss = lastStreakCandle.high
        } else if (slType === 'last') {
          stopLoss = lastStreakCandle.high
        } else {
          stopLoss = entry + fixedPoints
        }
      } else {
        // Red Reversal: Enter LONG when next breaks HIGH of last
        entry = lastStreakCandle.high
        tradeDirection = 'LONG'
        
        // Stop Loss
        if (slType === 'entry') {
          stopLoss = lastStreakCandle.low
        } else if (slType === 'last') {
          stopLoss = lastStreakCandle.low
        } else {
          stopLoss = entry - fixedPoints
        }
      }
    } else {
      // CONTINUATION
      if (isGreenStreak) {
        // Green Continuation: Enter LONG when next breaks HIGH of last
        entry = lastStreakCandle.high
        tradeDirection = 'LONG'
        
        // Stop Loss
        if (slType === 'entry') {
          stopLoss = lastStreakCandle.low
        } else if (slType === 'last') {
          stopLoss = lastStreakCandle.low
        } else {
          stopLoss = entry - fixedPoints
        }
      } else {
        // Red Continuation: Enter SHORT when next breaks LOW of last
        entry = lastStreakCandle.low
        tradeDirection = 'SHORT'
        
        // Stop Loss
        if (slType === 'entry') {
          stopLoss = lastStreakCandle.high
        } else if (slType === 'last') {
          stopLoss = lastStreakCandle.high
        } else {
          stopLoss = entry + fixedPoints
        }
      }
    }

    const slDistance = Math.abs(entry - stopLoss)
    
    // Find all candles after breakout
    const afterBreakoutIdx = streakStartIdx + streak.length + 1
    const futureCandles = candles.slice(afterBreakoutIdx, afterBreakoutIdx + 100)
    
    // Check R:R ratios from 1:1 to 1:20
    const rrHits = {}
    let hitSL = false
    
    for (let rr = 1; rr <= 20; rr++) {
      rrHits[rr] = false
    }

    // Simulate trade progression
    for (const candle of futureCandles) {
      // Check Stop Loss hit
      if (tradeDirection === 'LONG') {
        if (candle.low <= stopLoss) {
          hitSL = true
          break
        }
      } else {
        // SHORT
        if (candle.high >= stopLoss) {
          hitSL = true
          break
        }
      }

      // Check R:R targets
      for (let rr = 1; rr <= 20; rr++) {
        if (rrHits[rr]) continue
        
        const target = tradeDirection === 'LONG'
          ? entry + (slDistance * rr)
          : entry - (slDistance * rr)
        
        const targetHit = tradeDirection === 'LONG'
          ? candle.high >= target
          : candle.low <= target

        if (targetHit) {
          rrHits[rr] = true
        }
      }
    }

    trades.push({
      streak,
      entry: entry.toFixed(2),
      stopLoss: stopLoss.toFixed(2),
      slDistance: slDistance.toFixed(2),
      tradeDirection,
      hitSL,
      rrHits
    })
  })

  // Calculate statistics
  const totalTrades = trades.length
  const slHits = trades.filter(t => t.hitSL).length
  
  const rrStats = {}
  for (let rr = 1; rr <= 20; rr++) {
    const hits = trades.filter(t => t.rrHits[rr]).length
    rrStats[rr] = {
      hits,
      percentage: totalTrades > 0 ? ((hits / totalTrades) * 100).toFixed(1) : '0.0'
    }
  }

  const winRate = totalTrades > 0 
    ? (((totalTrades - slHits) / totalTrades) * 100).toFixed(1)
    : '0.0'

  return {
    trades,
    totalTrades,
    slHits,
    rrStats,
    winRate
  }
}