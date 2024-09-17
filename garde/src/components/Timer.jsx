import React, { useState, useEffect } from 'react';

const Timer = ({ onTimerStart, onReset, isStartDisabled, resetTimer, initialTime, onRunningChange, darkMode }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(initialTime ? initialTime * 1000 : 0); // Convert initialTime to milliseconds or set to 0 if not provided

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime > 10) {
            return prevTime - 10; // Decrement by 10 milliseconds
          } else {
            clearInterval(interval);
            setIsRunning(false);
            return 0;
          }
        });
      }, 10); // Change this to 10ms for millisecond countdown
    } else if (!isRunning && time !== (initialTime ? initialTime * 1000 : 0)) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, time, initialTime]);

  useEffect(() => {
    if (resetTimer) {
      setTime(initialTime ? initialTime * 1000 : 0); // Reset to initial time in milliseconds or 0 if not provided
      setIsRunning(true);
    }
  }, [resetTimer, initialTime]);

  useEffect(() => {
    console.log('Timer component: isRunning changed to', isRunning);
    onRunningChange(isRunning);
  }, [isRunning, onRunningChange]);

  const handleStart = () => {
    if (!isRunning && !isStartDisabled) {
      setTime(initialTime ? initialTime * 1000 : 0); // Reset to initial time in milliseconds or 0 if not provided
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
    setTime(initialTime ? initialTime * 1000 : 0); // Reset to initial time in milliseconds or 0 if not provided
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
      <div className={`font-sans text-6xl mb-4 transition-all ease-out duration-300 rounded-full ${darkMode ? 'text-white' : 'text-black'}`}>
        {formatTime(time)}
      </div>
      <div className="space-x-2">
        <button
          className={`text-white border py-2 px-4 rounded text-sm transition duration-150 ease-in-out ${
            darkMode
              ? 'bg-blue-800 border-blue-700 hover:bg-blue-700'
              : 'bg-blue-500 border-blue-400 hover:bg-blue-600'
          }`}
          onClick={handleStart}
          disabled={isStartDisabled}
        >
          Start
        </button>
        <button
          className={`text-white border py-2 px-4 rounded text-sm transition duration-150 ease-in-out ${
            darkMode
              ? 'bg-red-800 border-red-700 hover:bg-red-700'
              : 'bg-red-500 border-red-400 hover:bg-red-600'
          }`}
          onClick={handleStop}
        >
          Stop
        </button>
        <button
          className={`text-white border py-2 px-4 rounded text-sm transition duration-150 ease-in-out ${
            darkMode
              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              : 'bg-gray-400 border-gray-300 hover:bg-gray-500'
          }`}
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;
