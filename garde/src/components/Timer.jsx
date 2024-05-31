import React, { useState, useEffect } from 'react';

const Timer = ({ onTimerStart, onReset, isStartDisabled, resetTimer }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!isRunning && time !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (resetTimer) {
      setTime(0);
      setIsRunning(true);
    }
  }, [resetTimer]);

  const handleStart = () => {
    if (!isRunning && !isStartDisabled) {
      setTime(0);
      setIsRunning(true);
      onTimerStart();
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
    onReset();
  };

  const formatTime = (time) => {
    const milliseconds = (`00${time % 1000}`).slice(-3);
    const seconds = (`0${Math.floor((time / 1000) % 60)}`).slice(-2);
    const minutes = (`0${Math.floor((time / 60000) % 60)}`).slice(-2);
    return `${minutes}:${seconds}:${milliseconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ maxHeight: '10vh', width: '100%' }}>
      <div style={{ color: 'white' }} className="font-sans text-6xl mb-4 transition-all ease-out duration-300 rounded-full">
        {formatTime(time)}
      </div>
      <div className="space-x-2">
        <button
          className="text-white border border-blue-700 py-2 px-4 rounded text-sm hover:bg-blue-700 hover:border-blue-700 transition duration-150 ease-in-out"
          onClick={handleStart}
          disabled={isStartDisabled}
        >
          Start
        </button>
        <button
          className="text-white border border-red-700 py-2 px-4 rounded text-sm hover:bg-red-700 hover:border-red-700 transition duration-150 ease-in-out"
          onClick={handleStop}
        >
          Stop
        </button>
        <button
          className="text-white border border-gray-500 py-2 px-4 rounded text-sm hover:bg-gray-500 hover:border-gray-500 transition duration-150 ease-in-out"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;
