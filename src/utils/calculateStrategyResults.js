// src/utils/calculateStrategyResults.js ← FIXED — USES ACTUAL STREAK DATA
export function calculateStrategyResults(
  filteredStreaks,
  candles,
  slType,
  fixedPoints,
  strategyType,
  trailConfig = null
) {
  if (!filteredStreaks || filteredStreaks.length === 0) {
    const empty = {}
    for (let i = 1; i <= 20; i++) empty[i] = { hits: 0, percentage: '0.0' }
    return { trades: [], totalTrades: 0, slHits: 0, rrStats: empty, winRate: '0.0', trailedCount: 0 }
  }

  const trades = []

  filteredStreaks.forEach(streak => {
    // ✅ USE ACTUAL STREAK DATA (not array indices)
    const lastCandleHigh = streak.fifthHigh
    const lastCandleLow = streak.fifthLow
    const breakoutCandle = streak.nextCandle
    
    if (!breakoutCandle) return // No breakout candle
    
    console.log('Processing streak:', {
      time: breakoutCandle.time,
      direction: streak.direction,
      lastHigh: lastCandleHigh,
      lastLow: lastCandleLow,
      breakoutHigh: breakoutCandle.high,
      breakoutLow: breakoutCandle.low,
      isReversal: streak.isReversal,
      isContinuation: streak.isContinuation
    })

    let entry = null
    let direction = null
    let stopLoss = null

    const isReversal = strategyType === 'reversal'
    const expectLong  = (isReversal && streak.direction === 'red') || (!isReversal && streak.direction === 'green')
    const expectShort = (isReversal && streak.direction === 'green') || (!isReversal && streak.direction === 'red')

    // Check if breakout candle actually breaks the level
    if (expectLong && breakoutCandle.high > lastCandleHigh) {
      console.log('✓ LONG ENTRY FOUND:', breakoutCandle.time, 'broke', lastCandleHigh)
      // Realistic entry logic:
      // Case 1: If breakout candle opens above the level → enter at open
      // Case 2: If breakout candle opens below but breaks → enter at level + buffer
      if (breakoutCandle.open >= lastCandleHigh) {
        // Already above level at open - enter at open
        entry = breakoutCandle.open
      } else {
        // Opens below but breaks - enter when price breaks the level
        entry = lastCandleHigh + 0.5  // Small buffer above the level
      }
      // Add slippage (0.1 points) to simulate real execution
      entry = entry + 0.1
      direction = 'LONG'
      stopLoss = slType === 'fixed' ? entry - fixedPoints : lastCandleLow
    } 
    else if (expectShort && breakoutCandle.low < lastCandleLow) {
      console.log('✓ SHORT ENTRY FOUND:', breakoutCandle.time, 'broke', lastCandleLow)
      // Realistic entry logic:
      // Case 1: If breakout candle opens below the level → enter at open
      // Case 2: If breakout candle opens above but breaks → enter at level - buffer
      if (breakoutCandle.open <= lastCandleLow) {
        // Already below level at open - enter at open
        entry = breakoutCandle.open
      } else {
        // Opens above but breaks - enter when price breaks the level
        entry = lastCandleLow - 0.5  // Small buffer below the level
      }
      // Add slippage (0.1 points) to simulate real execution
      entry = entry - 0.1
      direction = 'SHORT'
      stopLoss = slType === 'fixed' ? entry + fixedPoints : lastCandleHigh
    }
    else {
      console.log('✗ No valid breakout for this streak')
      return // No valid breakout
    }

    const risk = Math.abs(entry - stopLoss)
    
    // Find breakout candle in main array
    const breakoutIdx = candles.findIndex(c => c.time === breakoutCandle.time)
    if (breakoutIdx === -1) return
    
    // CRITICAL: Check if breakout candle itself hits stop loss (dual break scenario)
    // For volatile candles that break both high and low
    let sl = stopLoss
    let exited = false
    let exitPrice = entry
    let exitTime = breakoutCandle.time
    let reason = 'sl'
    
    // Check breakout candle for immediate stop loss hit (dual break)
    const isDualBreak = (direction === 'LONG' && breakoutCandle.low < lastCandleLow) || 
                        (direction === 'SHORT' && breakoutCandle.high > lastCandleHigh)
    
    if (isDualBreak) {
      console.log('⚠️ DUAL BREAK DETECTED:', {
        direction,
        entry,
        sl,
        breakoutHigh: breakoutCandle.high,
        breakoutLow: breakoutCandle.low,
        lastHigh: lastCandleHigh,
        lastLow: lastCandleLow
      })
    }
    
    // Check if dual break hits stop loss immediately
    if (direction === 'LONG' && breakoutCandle.low <= sl) {
      // Dual break: Entered LONG but candle also broke low → immediate SL hit
      exitPrice = sl - 0.2  // Slippage
      exitTime = breakoutCandle.time
      exited = true
      reason = 'sl'
      console.log('✗ DUAL BREAK SL HIT - LONG trade exited immediately')
    } else if (direction === 'SHORT' && breakoutCandle.high >= sl) {
      // Dual break: Entered SHORT but candle also broke high → immediate SL hit
      exitPrice = sl + 0.2  // Slippage
      exitTime = breakoutCandle.time
      exited = true
      reason = 'sl'
      console.log('✗ DUAL BREAK SL HIT - SHORT trade exited immediately')
    }
    
    // If not exited on breakout candle, check future candles
    const future = candles.slice(breakoutIdx + 1)
    let trailed = false
    let best = entry

    for (const c of future) {
      if (direction === 'LONG') {
        if (c.high > best) {
          best = c.high
          if (trailConfig?.enabled) {
            const profit = best - entry
            if (profit >= trailConfig.trigger) {
              const newSL = best - trailConfig.trailBy
              // Only move SL if it's better than current SL
              // But ensure it's at least 2 points above original stop loss (more realistic)
              // This prevents moving SL to break-even too easily
              const minSL = stopLoss + 2  // Keep at least 2 points above original SL
              if (newSL > sl && newSL >= minSL) {
                sl = newSL
                trailed = true
              }
            }
          }
        }
        // Check if this candle hits stop loss
        if (c.low <= sl) {
          // Realistic exit: Add slippage (0.2 points) when stop loss is hit
          exitPrice = sl - 0.2
          exitTime = c.time
          reason = trailed ? 'trailing' : 'sl'
          exited = true
          break
        }
      } else {
        if (c.low < best) {
          best = c.low
          if (trailConfig?.enabled) {
            const profit = entry - best
            if (profit >= trailConfig.trigger) {
              const newSL = best + trailConfig.trailBy
              // Only move SL if it's better than current SL
              // But ensure it's at least 2 points below original stop loss (more realistic)
              const maxSL = stopLoss - 2  // Keep at least 2 points below original SL
              if (newSL < sl && newSL <= maxSL) {
                sl = newSL
                trailed = true
              }
            }
          }
        }
        // Check if this candle hits stop loss
        if (c.high >= sl) {
          // Realistic exit: Add slippage (0.2 points) when stop loss is hit
          exitPrice = sl + 0.2
          exitTime = c.time
          reason = trailed ? 'trailing' : 'sl'
          exited = true
          break
        }
      }
    }

    // If still not exited and we have future candles, exit at last candle's close
    if (!exited && future.length > 0) {
      exitPrice = future[future.length - 1].close
      exitTime = future[future.length - 1].time
      reason = 'time'
    }

    const pnl = direction === 'LONG' ? exitPrice - entry : entry - exitPrice

    // R:R calculation
    const rr = {}
    for (let r = 1; r <= 20; r++) {
      const target = direction === 'LONG' ? entry + risk * r : entry - risk * r
      rr[r] = false
      if (!exited) {
        for (const c of future) {
          if ((direction === 'LONG' && c.high >= target) || (direction === 'SHORT' && c.low <= target)) {
            rr[r] = true
            break
          }
          if ((direction === 'LONG' && c.low <= sl) || (direction === 'SHORT' && c.high >= sl)) break
        }
      }
    }

    // Find original timestamps from candles
    const entryCandle = candles.find(c => c.time === breakoutCandle.time)
    const exitCandle = candles.find(c => c.time === exitTime)
    
    trades.push({
      streak,
      entryPrice: Number(entry.toFixed(2)),
      entryTime: breakoutCandle.time,
      entryTimeOriginal: entryCandle?.originalTimestamp || null,
      exitPrice: Number(exitPrice.toFixed(2)),
      exitTime,
      exitTimeOriginal: exitCandle?.originalTimestamp || null,
      pnl: Number(pnl.toFixed(2)),
      exitReason: reason,
      trailed,
      tradeDirection: direction,
      slDistance: Number(risk.toFixed(2)),
      finalSL: Number(sl.toFixed(2)),
      rrHits: rr
    })
  })

  const total = trades.length
  // Realistic win rate: Only count trades with positive P&L as wins
  const winners = trades.filter(t => t.pnl > 0).length
  const losers = trades.filter(t => t.pnl < 0).length
  const winRate = total > 0 ? ((winners / total) * 100).toFixed(1) : '0.0'
  const slHits = trades.filter(t => t.exitReason !== 'time').length
  const trailedCount = trades.filter(t => t.trailed).length

  const rrStats = {}
  for (let r = 1; r <= 20; r++) {
    const hits = trades.filter(t => t.rrHits[r]).length
    rrStats[r] = {
      hits,
      percentage: total > 0 ? (hits / total * 100).toFixed(1) : '0.0'
    }
  }

  return {
    trades,
    totalTrades: total,
    slHits,
    winRate,
    rrStats,
    trailedCount,
    trailActive: !!trailConfig?.enabled
  }
}