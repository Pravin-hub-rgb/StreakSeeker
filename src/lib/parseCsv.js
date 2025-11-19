// src/lib/parseCsv.js  ← SHOW EXACTLY WHAT'S IN CSV (NO TIMEZONE CONVERSION)
export function parseCsvData(rows) {
  return rows
    .map(row => {
      const timeStr = row.timestamp || row.Timestamp || row.time || row.Time
      if (!timeStr) return null

      // Store original timestamp string to display exactly as in CSV
      const originalTimestamp = timeStr.trim()

      // Parse for Unix timestamp (needed for chart library)
      // Handle both formats:
      // 1. "2025-08-31 18:30:00" (space-separated)
      // 2. "2025-11-14T15:29:00+05:30" (ISO 8601 with T and timezone)
      
      let datePart, timePart
      
      if (originalTimestamp.includes('T')) {
        // ISO 8601 format: "2025-11-14T15:29:00+05:30"
        const parts = originalTimestamp.split('T')
        datePart = parts[0]
        // Remove timezone (everything after + or -)
        timePart = parts[1].split(/[+-]/)[0]
      } else {
        // Space-separated format: "2025-08-31 18:30:00"
        [datePart, timePart] = originalTimestamp.split(' ')
      }
      
      if (!datePart || !timePart) return null
      
      const [year, month, day] = datePart.split('-').map(Number)
      const [hour, minute, second = 0] = timePart.split(':').map(Number)

      // Create Unix timestamp treating the CSV time as-is (no conversion)
      // Use Date.UTC but we'll display using originalTimestamp
      const time = Date.UTC(year, month - 1, day, hour, minute, second) / 1000

      const o = parseFloat(row.open ?? row.Open)
      const h = parseFloat(row.high ?? row.High)
      const l = parseFloat(row.low ?? row.Low)
      const c = parseFloat(row.close ?? row.Close)

      if (isNaN(o) || isNaN(h) || isNaN(l) || isNaN(c) || isNaN(time)) return null

      return { time, originalTimestamp, open: o, high: h, low: l, close: c }
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time)
}