"use client"
import React, { useState, useEffect } from 'react';

const Timer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1000);
      }, 1000);
    } else if (!isRunning && time !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, time]);

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const handleStop = () => {
    if (isRunning) {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 mb-8 bg-white">
      <div className="font-sans text-6xl text-gray-800 mb-4 transition-all ease-out duration-300">{new Date(time).toISOString().substr(11, 8)}</div>
      <div className="space-x-2">
        <button className="bg-transparent text-blue-500 border border-blue-500 py-2 px-4 rounded text-sm hover:bg-blue-500 hover:text-white transition duration-150 ease-in-out" onClick={handleStart}>
          Start
        </button>
        <button className="bg-transparent text-red-500 border border-red-500 py-2 px-4 rounded text-sm hover:bg-red-500 hover:text-white transition duration-150 ease-in-out" onClick={handleStop}>
          Stop
        </button>
        <button className="bg-transparent text-gray-500 border border-gray-500 py-2 px-4 rounded text-sm hover:bg-gray-500 hover:text-white transition duration-150 ease-in-out" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;
