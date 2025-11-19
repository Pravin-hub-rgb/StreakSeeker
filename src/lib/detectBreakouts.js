// src/lib/detectStreaks.js ← FINAL: 6-Point Penetration Filter + Next Candle Confirmation
export function detectStreaks(candles, { 
  minStreak, 
  direction, 
  minMovePercent,
  patternMode = 'reversal',
  minPointsAfterBreak = 6   // ← NEW: default 6 points beyond extreme
}) {
  const streaks = []
  let current = []

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]
    const green = c.close > c.open
    const red = c.close < c.open

    if (current.length === 0) {
      if ((direction === 'both' || direction === 'green') && green) current.push(c)
      if ((direction === 'both' || direction === 'red') && red) current.push(c)
    } else {
      const lastClose = current[current.length - 1].close
      const lastWasGreen = lastClose > current[current.length - 1].open
      const continuesGreen = green && c.close > lastClose
      const continuesRed = red && c.close < lastClose

      if ((lastWasGreen && continuesGreen) || (!lastWasGreen && continuesRed)) {
        current.push(c)
      } else {
        // === STREAK ENDED ===
        if (current.length === minStreak) {
          const highs = current.map(x => x.high)
          const lows = current.map(x => x.low)
          const move = ((Math.max(...highs) - Math.min(...lows)) / Math.min(...lows)) * 100

          if (move >= minMdovePercent) {
            const lastCandle = current[current.length - 1]
            const breakoutCandle = candles[i]           // first candle after streak
            const nextAfterBreak = candles[i + 1]        // confirmation candle

            const lastWasGreen = lastCandle.close > lastCandle.open
            const streakLow = Math.min(...lows)
            const streakHigh = Math.max(...highs)

            // Reversal detection
            const brokeDown = breakoutCandle && lastWasGreen && breakoutCandle.low < streakLow
            const brokeUp = breakoutCandle && !lastWasGreen && breakoutCandle.high > streakHigh
            const brokeExtreme = brokeDown || brokeUp

            // Continuation detection
            const continuedUp = breakoutCandle && lastWasGreen && breakoutCandle.close > lastCandle.close
            const continuedDown = breakoutCandle && !lastWasGreen && breakoutCandle.close < lastCandle.close
            const continued = continuedUp || continuedDown

            // === 6-POINT PENETRATION CALCULATION ===
            const penetration = () => {
              if (brokeDown) return streakLow - breakoutCandle.low
              if (brokeUp) return breakoutCandle.high - streakHigh
              if (continuedUp) return breakoutCandle.close - lastCandle.close
              if (continuedDown) return lastCandle.close - breakoutCandle.close
              return 0
            }

            const pointsMoved = penetration()
            const hasStrongMove = pointsMoved >= minPointsAfterBreak

            // Next candle confirmation
            const hasConfirmation = nextAfterBreak && (
              (brokeDown && nextAfterBreak.close < breakoutCandle.close) ||
              (brokeUp && nextAfterBreak.close > breakoutCandle.close) ||
              (continuedUp && nextAfterBreak.close > breakoutCandle.close) ||
              (continuedDown && nextAfterBreak.close < breakoutCandle.close)
            )

            const isStrongReversal = brokeExtreme && (hasStrongMove || hasConfirmation)
            const isStrongContinuation = continued && (hasStrongMove || hasConfirmation)

            const shouldInclude = 
              patternMode === 'both' ||
              (patternMode === 'reversal' && isStrongReversal) ||
              (patternMode === 'continuation' && isStrongContinuation)

            if (shouldInclude) {
              streaks.push({
                startIndex: i - current.length,
                length: current.length,
                direction: lastWasGreen ? 'green' : 'red',
                movePercent: move.toFixed(2),
                lastLow: streakLow,
                lastHigh: streakHigh,
                nextCandle: breakoutCandle,
                nextAfterBreak,
                brokeExtreme,
                continued,
                penetrationPoints: Number(pointsMoved.toFixed(2)),
                confirmedByNext: hasConfirmation,
                hasStrongMove,
                isStrongReversal,
                isStrongContinuation
              })
            }
          }
        }

        // Reset streak
        current = []
        if ((direction === 'both' || direction === 'green') && green) current.push(c)
        if ((direction === 'both' || direction === 'red') && red) current.push(c)
      }
    }
  }

  // Final streak at EOF (only continuation allowed)
  if (current.length === minStreak && (patternMode === 'both' || patternMode === 'continuation')) {
    const highs = current.map(x => x.high)
    const lows = current.map(x => x.low)
    const move = ((Math.max(...highs) - Math.min(...lows)) / Math.min(...lows)) * 100
    if (move >= minMovePercent) {
      const lastCandle = current[current.length - 1]
      streaks.push({
        startIndex: candles.length - current.length,
        length: current.length,
        direction: lastCandle.close > lastCandle.open ? 'green' : 'red',
        movePercent: move.toFixed(2),
        lastLow: Math.min(...lows),
        lastHigh: Math.max(...highs),
        nextCandle: null,
        penetrationPoints: 0,
        confirmedByNext: false,
        hasStrongMove: false,
        brokeExtreme: false,
        continued: false
      })
    }
  }

  return streaks
}