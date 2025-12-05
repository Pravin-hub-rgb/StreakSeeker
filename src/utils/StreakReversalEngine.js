// src/utils/StreakReversalEngine.js
const MAX_POSITIONS = 3;

export function runStreakReversalStrategy(candles, streakLength = 4, colorFilter = 'both') {
  const activeLongSetups = [];    // waiting long setups
  const activeShortSetups = [];   // waiting short setups
  const openPositions = [];       // live trades
  const closedTrades = [];        // finished trades
  const debugLog = [];            // one line per candle for the UI table

  let streakCount = 0;
  let streakColor = null;         // "red" or "green"

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];

    const isGreen = c.close > c.open;
    const color = isGreen ? "green" : "red";

    // Update streakCount and streakColor using ONLY candle color
    if (color === streakColor) {
      streakCount++;
    } else {
      streakCount = 1;
      streakColor = color;
    }

    // When streakCount exactly reaches target length, create setup
    if (streakCount === streakLength) {
      if (color === "red" && (colorFilter === 'both' || colorFilter === 'red')) {
        // Red streak → Long setup
        activeLongSetups.push({
          id: `long_${i}_${c.originalTimestamp || c.time}`,
          refOpen: c.open,
          refLow: c.low,
          pauseSeen: false,
          status: "waiting"
        });
      } else if (color === "green" && (colorFilter === 'both' || colorFilter === 'green')) {
        // Green streak → Short setup
        activeShortSetups.push({
          id: `short_${i}_${c.originalTimestamp || c.time}`,
          refOpen: c.open,
          refHigh: c.high,
          pauseSeen: false,
          status: "waiting"
        });
      }
    }

    // PHASE 2: Entry + Setup Management
    // LONG setups
    for (let j = activeLongSetups.length-1; j >= 0; j--) {
      const s = activeLongSetups[j];
      if (s.status !== "waiting") continue;
      
      // Cancellation rule: if we see green candle, mark pause
      if (isGreen) s.pauseSeen = true;
      
      // Cancel if red candle after pause and price breaks below reference low
      if (color === "red" && s.pauseSeen && c.low < s.refLow) {
        activeLongSetups.splice(j,1);
        continue;
      }
      
      // Entry check: candle closes above reference open
      if (c.close > s.refOpen && openPositions.length < MAX_POSITIONS) {
        const entryPrice = s.refOpen;
        const initialSL = c.low; // SL = entry candle's low
        const trailDistance = entryPrice - initialSL;
        
        openPositions.push({
          id: `pos_${closedTrades.length + openPositions.length + 1}`,
          direction: "LONG",
          entryPrice,
          entryTime: c.time,
          entryTimeOriginal: c.originalTimestamp,
          currentSL: initialSL,
          trailDistance,
          setupId: s.id,
          entryCandle: i,
          trailActivated: false,
          previousHigh: c.high
        });
        
        // Remove the setup after entry
        activeLongSetups.splice(j,1);
        
        // Dynamic shift: if entry candle is also red, create new setup
        if (color === "red") {
          activeLongSetups.push({
            id: `long_shift_${i}_${c.originalTimestamp || c.time}`,
            refOpen: c.open,
            refLow: c.low,
            pauseSeen: false,
            status: "waiting"
          });
        }
      } else if (color === "red" && c.close <= s.refOpen) {
        // No breach but same color - shift entry point
        s.refOpen = c.open;
        s.refLow = c.low;
      }
    }

    // SHORT setups
    for (let j = activeShortSetups.length-1; j >= 0; j--) {
      const s = activeShortSetups[j];
      if (s.status !== "waiting") continue;
      
      // Cancellation rule: if we see red candle, mark pause
      if (!isGreen) s.pauseSeen = true;
      
      // Cancel if green candle after pause and price breaks above reference high
      if (color === "green" && s.pauseSeen && c.high > s.refHigh) {
        activeShortSetups.splice(j,1);
        continue;
      }
      
      // Entry check: candle closes below reference open  
      if (c.close < s.refOpen && openPositions.length < MAX_POSITIONS) {
        const entryPrice = s.refOpen;
        const initialSL = c.high; // SL = entry candle's high
        const trailDistance = initialSL - entryPrice;
        
        openPositions.push({
          id: `pos_${closedTrades.length + openPositions.length + 1}`,
          direction: "SHORT",
          entryPrice,
          entryTime: c.time,
          entryTimeOriginal: c.originalTimestamp,
          currentSL: initialSL,
          trailDistance,
          setupId: s.id,
          entryCandle: i,
          trailActivated: false,
          previousLow: c.low
        });
        
        // Remove the setup after entry
        activeShortSetups.splice(j,1);
        
        // Dynamic shift: if entry candle is also green, create new setup
        if (color === "green") {
          activeShortSetups.push({
            id: `short_shift_${i}_${c.originalTimestamp || c.time}`,
            refOpen: c.open,
            refHigh: c.high,
            pauseSeen: false,
            status: "waiting"
          });
        }
      } else if (color === "green" && c.close >= s.refOpen) {
        // No breach but same color - shift entry point
        s.refOpen = c.open;
        s.refHigh = c.high;
      }
    }

    // PHASE 4: Position management + CORRECT 1× trailing
    for (let j = openPositions.length-1; j >= 0; j--) {
      const p = openPositions[j];
      
      // Skip SL check on entry candle
      if (p.entryCandle === i) continue;
      
      if (p.direction === "LONG") {
        // 1. Check SL hit FIRST (using current SL)
        if (c.low <= p.currentSL) {
          const pnl = p.currentSL - p.entryPrice;
          closedTrades.push({
            ...p,
            exitPrice: p.currentSL,
            exitTime: c.time,
            exitTimeOriginal: c.originalTimestamp,
            pnl,
            exitReason: pnl > 0 ? "TRAIL" : "SL",
            tradeDirection: "LONG"
          });
          openPositions.splice(j,1);
          continue;
        }
        
        // 2. Trail in exact multiples of trail distance
        if (c.high >= p.entryPrice + p.trailDistance) {
          // Calculate how many trail distances we've moved
          const profitMultiple = Math.floor((c.high - p.entryPrice) / p.trailDistance);
          const newSL = p.entryPrice + (profitMultiple - 1) * p.trailDistance;
          if (newSL > p.currentSL) {
            p.currentSL = newSL;
          }
        }
      } else { // SHORT
        // 1. Check SL hit FIRST
        if (c.high >= p.currentSL) {
          const pnl = p.entryPrice - p.currentSL;
          closedTrades.push({
            ...p,
            exitPrice: p.currentSL,
            exitTime: c.time,
            exitTimeOriginal: c.originalTimestamp,
            pnl,
            exitReason: pnl > 0 ? "TRAIL" : "SL",
            tradeDirection: "SHORT"
          });
          openPositions.splice(j,1);
          continue;
        }
        
        // 2. Trail in exact multiples of trail distance
        if (c.low <= p.entryPrice - p.trailDistance) {
          // Calculate how many trail distances we've moved
          const profitMultiple = Math.floor((p.entryPrice - c.low) / p.trailDistance);
          const newSL = p.entryPrice - (profitMultiple - 1) * p.trailDistance;
          if (newSL < p.currentSL) {
            p.currentSL = newSL;
          }
        }
      }
    }

    debugLog.push({ 
      time: c.originalTimestamp || c.time, 
      streakCount, 
      color, 
      longSetups: activeLongSetups.filter(s => s.status === 'waiting').length,
      shortSetups: activeShortSetups.filter(s => s.status === 'waiting').length,
      positions: openPositions.length,
      note: "" 
    });
  }

  return { trades: closedTrades, debugLog };
}