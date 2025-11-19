// src/lib/detectStreaks.js ← OLD WORKING CODE + NEW DUAL BREAK DETECTION
export function detectStreaks(candles, { minStreak, direction, minMovePercent }) {
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
        // Streak ended
        if (current.length === minStreak) {
          const move = ((Math.max(...current.map(x => x.high)) - Math.min(...current.map(x => x.low))) / Math.min(...current.map(x => x.low))) * 100
          if (move >= minMovePercent) {
            const fifth = current[current.length - 1]  // 5th candle (or last candle of streak)
            const next = candles[i]  // breakout candle
            const nextAfter = candles[i + 1]  // confirmation candle
            const lastWasGreen = fifth.close > fifth.open
            
            // Check BOTH directions for breakout (ORIGINAL LOGIC)
            const brokeReversalExtreme = next
              ? (lastWasGreen
                  ? next.low < fifth.low      // green streak breaks down (reversal)
                  : next.high > fifth.high)   // red streak breaks up (reversal)
              : false

            const brokeContinuationExtreme = next
              ? (lastWasGreen
                  ? next.high > fifth.high    // green streak breaks up (continuation)
                  : next.low < fifth.low)     // red streak breaks down (continuation)
              : false

            const brokeExtreme = brokeReversalExtreme || brokeContinuationExtreme
            const isReversal = brokeReversalExtreme
            const isContinuation = brokeContinuationExtreme

            // === NEW: DUAL BREAK DETECTION ===
            const isDualBreak = next && next.low < fifth.low && next.high > fifth.high
            
            // === NEW: NEXT CANDLE RESOLUTION (for dual breaks) ===
            let volResolution = null
            if (isDualBreak && nextAfter) {
              const brokeVolHigh = nextAfter.high > next.high
              const brokeVolLow = nextAfter.low < next.low
              
              if (brokeVolHigh && !brokeVolLow) volResolution = 'HIGH'
              else if (brokeVolLow && !brokeVolHigh) volResolution = 'LOW'
              else if (brokeVolHigh && brokeVolLow) volResolution = 'BOTH'
              else volResolution = 'INSIDE'
            }

            // Only include if SOME breakout happened (ORIGINAL LOGIC)
            if (brokeExtreme) {
              // Calculate penetration distance FROM THE BROKEN EXTREME (ORIGINAL LOGIC)
              let penetration = 0
              if (isReversal) {
                penetration = lastWasGreen 
                  ? parseFloat((fifth.low - next.low).toFixed(2))      // broke down
                  : parseFloat((next.high - fifth.high).toFixed(2))    // broke up
              } else if (isContinuation) {
                penetration = lastWasGreen
                  ? parseFloat((next.high - fifth.high).toFixed(2))    // broke up
                  : parseFloat((fifth.low - next.low).toFixed(2))      // broke down
              }

              // Check next candle confirmation (ORIGINAL LOGIC)
              let confirmedByNext = false
              if (nextAfter) {
                if (isReversal) {
                  confirmedByNext = lastWasGreen
                    ? nextAfter.close < next.close  // continues down
                    : nextAfter.close > next.close  // continues up
                } else if (isContinuation) {
                  confirmedByNext = lastWasGreen
                    ? nextAfter.close > next.close  // continues up
                    : nextAfter.close < next.close  // continues down
                }
              }

              // Determine if STRONG setup (>=6pts OR confirmed) (ORIGINAL LOGIC)
              const isStrong = penetration >= 6 || confirmedByNext

              streaks.push({
                startIndex: i - current.length,
                length: current.length,
                direction: lastWasGreen ? 'green' : 'red',
                movePercent: move.toFixed(2),
                fifthLow: fifth.low,
                fifthHigh: fifth.high,
                nextCandle: next || null,
                brokeExtreme,
                isReversal,
                isContinuation,
                penetration,
                confirmedByNext,
                isStrong,
                // NEW FIELDS
                isDualBreak,
                volResolution
              })
            }
          }
        }
        current = []
        if ((direction === 'both' || direction === 'green') && green) current.push(c)
        if ((direction === 'both' || direction === 'red') && red) current.push(c)
      }
    }
  }

  return streaks
}