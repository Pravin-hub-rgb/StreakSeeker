// src/components/StrategyTester/FileUploadZone.jsx
import React, { useState } from 'react';
import useStore from '../../store/useStore';

export default function FileUploadZone({ onFilesProcessed }) {
  const { setCandles, setStreaks } = useStore();
  const [isDragging, setIsDragging] = useState(false);

  const processCSV = (text) => {
    const lines = text.trim().split('\n');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= 5) {
        data.push({
          timestamp: values[0],
          open: parseFloat(values[1]),
          high: parseFloat(values[2]),
          low: parseFloat(values[3]),
          close: parseFloat(values[4])
        });
      }
    }
    return data;
  };

  const findStreaks = (candles) => {
    const streaks = [];
    let currentStreak = [];
    let currentDirection = null;

    for (let idx = 0; idx < candles.length; idx++) {
      const candle = candles[idx];
      const direction = candle.close > candle.open ? 'green' : 'red';
      
      if (direction === currentDirection) {
        currentStreak.push(idx);
      } else {
        // Save previous streak if it's long enough
        if (currentStreak.length >= 2 && idx < candles.length) {
          const nextCandle = candles[idx];
          const nextDirection = nextCandle.close > nextCandle.open ? 'green' : 'red';
          
          streaks.push({
            indices: [...currentStreak],
            length: currentStreak.length,
            direction: currentDirection,
            isReversal: nextDirection !== currentDirection,
            isContinuation: nextDirection === currentDirection,
            entryPrice: nextCandle.open,
            entryIndex: idx
          });
        }
        currentStreak = [idx];
        currentDirection = direction;
      }
    }

    // Handle last streak
    if (currentStreak.length >= 2) {
      streaks.push({
        indices: [...currentStreak],
        length: currentStreak.length,
        direction: currentDirection,
        isReversal: false,
        isContinuation: false,
        entryPrice: candles[candles.length - 1].close,
        entryIndex: candles.length - 1
      });
    }

    console.log(`Found ${streaks.length} streaks from ${candles.length} candles`);
    return streaks;
  };

  const handleFiles = async (files) => {
    const allCandles = [];
    
    for (const file of files) {
      const text = await file.text();
      const candles = processCSV(text);
      allCandles.push(...candles);
    }

    allCandles.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const streaks = findStreaks(allCandles);
    
    console.log('Loaded candles:', allCandles.length);
    console.log('Found streaks:', streaks.length);
    console.log('Sample streak:', streaks[0]);
    
    setCandles(allCandles);
    setStreaks(streaks);
    onFilesProcessed(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'));
    if (files.length > 0) handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) handleFiles(files);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4 text-center">Strategy Tester</h1>
        <p className="text-gray-400 text-center mb-8">Upload CSV files to backtest reversal & continuation strategies</p>
        
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
            isDragging ? 'border-cyan-400 bg-cyan-900/20' : 'border-gray-700 bg-gray-900'
          }`}
        >
          <div className="text-6xl mb-4">📤</div>
          <h3 className="text-xl font-bold text-white mb-2">Drop CSV files here</h3>
          <p className="text-gray-400 mb-4">or click to browse</p>
          <input
            type="file"
            multiple
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-bold cursor-pointer transition"
          >
            Select Files
          </label>
          <p className="text-sm text-gray-500 mt-4">Expected format: timestamp,open,high,low,close,x,y</p>
        </div>
      </div>
    </div>
  );
}