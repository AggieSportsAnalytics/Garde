import React, { useState, useEffect, useCallback } from 'react';

const Timer = ({ onTimerStart, onReset, isStartDisabled, resetTimer, initialTime, onRunningChange, darkMode, instructions, instructionIndex, setInstructionIndex }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(initialTime ? initialTime * 1000 : 0);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  const speak = useCallback((text) => {
    if (!speechSynthesis) {
      console.error('Speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => console.log('Speech started:', text);
    utterance.onend = () => console.log('Speech ended:', text);
    utterance.onerror = (event) => console.error('Speech error:', event);

    try {
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking:', error);
    }
  }, [speechSynthesis]);

  useEffect(() => {
    let interval = null;

    if (isRunning && !isCountingDown) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime > 10) {
            return prevTime - 10;
          } else {
            clearInterval(interval);
            if (instructionIndex < instructions.length - 1) {
              setInstructionIndex(instructionIndex + 1);
              speak(`${instructions[instructionIndex + 1].name} for ${instructions[instructionIndex + 1].time} seconds`);
              return instructions[instructionIndex + 1].time * 1000;
            } else {
              setIsRunning(false);
              onReset();
              return 0;
            }
          }
        });
      }, 10);
    } else if (isCountingDown) {
      interval = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount > 1) {
            speak(prevCount.toString());
            return prevCount - 1;
          } else if (prevCount === 1) {
            speak("1");
            setTimeout(() => {
              setIsCountingDown(false);
              speak("Go");
              setIsRunning(true);
              setTime(instructions[instructionIndex].time * 1000);
            }, 1000);
            return 0;
          } else {
            return 3;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isCountingDown, instructionIndex, instructions, setInstructionIndex, speak, onReset]);

  useEffect(() => {
    onRunningChange(isRunning);
  }, [isRunning, onRunningChange]);

  const handleStart = () => {
    if (!isRunning && !isStartDisabled && instructions.length > 0) {
      setInstructionIndex(0);
      const firstInstruction = instructions[0];
      speak(`${firstInstruction.name} for ${firstInstruction.time} seconds`);
      
      setTimeout(() => {
        setIsCountingDown(true);
        speak("Starting in 3, 2, 1");
      }, 2000); // Wait for 2 seconds after speaking the instruction before starting the countdown
      
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
    setInstructionIndex(-1);
    setIsCountingDown(false);
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
        {isCountingDown ? countdown : formatTime(time)}
      </div>
      <div className="space-x-2">
        <button
          className={`text-white border py-2 px-4 rounded text-sm transition duration-150 ease-in-out ${
            darkMode
              ? 'bg-blue-800 border-blue-700 hover:bg-blue-700'
              : 'bg-blue-500 border-blue-400 hover:bg-blue-600'
          }`}
          onClick={handleStart}
          disabled={isStartDisabled || isRunning}
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