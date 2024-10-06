"use client";

import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import * as posedetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import Stream_Vid from '../../components/Stream_Vid';
import Link from 'next/link';
import Timer from '../../components/Timer';
import { UserButton } from '@clerk/nextjs';
import Fencer_Canvas from '../../components/Fencer_Canvas';
import Fencer_Stats from '../../components/Fencer_Stats';
import Instruction from '../../components/Instruction';
import { useSpeechSynthesis } from 'react-speech-kit';
import { calculateAngle, displayFeetDistance, calculateSpeed } from '../../components/Fencer_Canvas';
import { FaCheckCircle, FaTimesCircle, FaSun, FaMoon, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import HeightInputModal from '../../components/HeightInputModal';
import { getFencerInstructions } from '../../../prisma/fencer_instructions';
import InstructionContext from '../../components/InstructionContext';
import PropTypes from 'prop-types';
import { CardBody, CardContainer, CardItem } from "../../components/ui/3d-card.tsx";

const MemoizedFencerStats = memo(Fencer_Stats);
const MemoizedInstruction = memo(Instruction);
const MemoizedTimer = memo(Timer);

export default function Fencer_Page2() {
  const [videoSource, setVideoSource] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [pose, setPose] = useState(null);
  const [instructionIndex, setInstructionIndex] = useState(-1);
  const [isStartDisabled, setIsStartDisabled] = useState(false);
  const [poseStartTime, setPoseStartTime] = useState(null);
  const [performedPose, setPerformedPose] = useState("");
  const [hasSpoken, setHasSpoken] = useState(false);
  const [poseResult, setPoseResult] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [failureTimeout, setFailureTimeout] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [resetTimer, setResetTimer] = useState(false);
  const [countdownFinished, setCountdownFinished] = useState(false);
  const [preInstructionCountdown, setPreInstructionCountdown] = useState(3);
  const [showPreInstructionCountdown, setShowPreInstructionCountdown] = useState(false);
  const [isInstructionBeingSaid, setIsInstructionBeingSaid] = useState(false);
  const [lastCalled, setLastCalled] = useState(Date.now());
  const [aiResult, setAiResult] = useState(null);
  const [height, setHeight] = useState(null);
  const [isHeightModalOpen, setIsHeightModalOpen] = useState(false);
  const { speak, voices } = useSpeechSynthesis();
  const [voice, setVoice] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [videoInput, setVideoInput] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [feetDistance, setFeetDistance] = useState(null);
  const [shoulderWidth, setShoulderWidth] = useState(null);
  const previousInstructionIndex = useRef(-1);
  const previousFeedback = useRef({ message: '', timestamp: 0 });
  const [previousPose, setPreviousPose] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lastSpokenFeedbackTime, setLastSpokenFeedbackTime] = useState(0);
  const spokenFeedbackCooldown = 5000; // Increased cooldown to 5 seconds
  const [darkMode, setDarkMode] = useState(false);
  const feedbackHistory = useRef([]);
  const heelCountRef = useRef(0);
  const [lastFeedbackTime, setLastFeedbackTime] = useState(0);
  const [isFeedbackBeingDelivered, setIsFeedbackBeingDelivered] = useState(false);
  const feedbackDelay = 10000; // 10 seconds delay
  const [poseData, setPoseData] = useState(null);
  const poseDataIntervalRef = useRef(null);
  const feedbackCooldown = 15000; // 15 seconds cooldown for feedback
  const feedbackBuffer = useRef([]);
  const [lastFeedbackMessage, setLastFeedbackMessage] = useState('');
  const [isFeedbackMuted, setIsFeedbackMuted] = useState(false);

  useEffect(() => {
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileDevice = /iPhone|iPad|iPod|Android/i.test(userAgent);
    setIsMobile(mobileDevice);
  }, []);

  useEffect(() => {
    if (voices.length > 0 && !voice) {
      setVoice(voices[18]);
    }
  }, [voices, voice]);

  const handleHeightSave = useCallback((heightInMeters) => {
    setHeight(heightInMeters);
    setIsHeightModalOpen(false);
  }, []);

  const startPreInstructionCountdown = useCallback(() => {
    setPreInstructionCountdown(3);
    const interval = setInterval(() => {
      setPreInstructionCountdown((prevCountdown) => {
        if (prevCountdown > 1) {
          return prevCountdown - 1;
        } else {
          clearInterval(interval);
          setCountdownFinished(true);
          setFeedbackEnabled(true); // Enable feedback after countdown
          return 0;
        }
      });
    }, 1000);
  }, []);

  const startSuccessCountdown = useCallback(() => {
    if (!videoInput) return;

    const instructionTime = instructions[instructionIndex]?.time || 3;
    setCountdown(instructionTime);
    const interval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown > 1) {
          return prevCountdown - 1;
        } else {
          clearInterval(interval);
          setCountdownFinished(true);
          return 0;
        }
      });
    }, 1000);
  }, [videoInput, instructions, instructionIndex]);

  const handleTimerStart = useCallback(() => {
    setHasStarted(true);
    setShowPreInstructionCountdown(false);
    setInstructionIndex((prevIndex) => {
      if (prevIndex >= instructions.length - 1) {
        setIsStartDisabled(true);
        return prevIndex;
      }
      setHasSpoken(false);
      return prevIndex + 1;
    });
    setPoseResult("");
    setResetTimer(false);
    setCountdown(instructions[instructionIndex] ? instructions[instructionIndex + 1]?.time : 3);
    setIsRunning(true);
    setFeedbackEnabled(true); // Enable feedback when the timer starts
    setLastFeedbackTime(Date.now()); // Set initial feedback time when timer starts
  }, [instructions, instructionIndex]);

  const handleReset = useCallback(() => {
    setInstructionIndex(-1);
    setIsStartDisabled(false);
    setPoseStartTime(null);
    setHasSpoken(false);
    setPoseResult("");
    setCountdown(3);
    setResetTimer(true);
    setPreInstructionCountdown(3);
    setShowPreInstructionCountdown(false);
    clearTimeout(failureTimeout);
    setFeedbackEnabled(false); // Disable feedback on reset
  }, [failureTimeout]);

  const handleVideoChange = useCallback((newVideoSource) => {
    setVideoSource(newVideoSource);
    setVideoInput(true);
    if (!height) setIsHeightModalOpen(true);
  }, [height]);

  const toggleRecording = useCallback(() => {
    if (!height) {
      setIsHeightModalOpen(true);
    }
    setIsRecording((prev) => !prev);
    setIsRunning((prev) => !prev);
  }, [height]);


  useEffect(() => {
    if (instructionIndex >= 0 && instructionIndex < instructions.length && !hasSpoken && !isInstructionBeingSaid) {
      setHasSpoken(true);
      setIsInstructionBeingSaid(true);
      speak({
        text: `${instructions[instructionIndex].name} Starting in 3, 2, 1`,
        voice: voice,
        rate: 1,
        pitch: 1,
        lang: 'en-US',
        onend: () => {
          setShowPreInstructionCountdown(false);
          setHasSpoken(false);
          setIsInstructionBeingSaid(false);
          startPreInstructionCountdown();
        },
      });
      setShowPreInstructionCountdown(true);
      setResetTimer(true);
    }
  }, [instructionIndex, voice, speak, hasSpoken, instructions, isInstructionBeingSaid, startPreInstructionCountdown]);

  useEffect(() => {
    if (!isTimerRunning) {
      setFeedback([]);
      previousFeedback.current = { message: '', timestamp: 0 };
    }
  }, [isTimerRunning]);


  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };


  const handlePoseSequenceDetected = useCallback((poseDataArray) => {
    const feedbackMessages = {
      advance: [],
      retreat: [],
      lunge: []
    };

    // Conversion factor from meters to inches
    const metersToInches = 39.37;

    // Aggregate feedback based on average angle data for 10 second intervals
    const intervalDuration = 10; 
    const intervalCount = Math.ceil(poseDataArray.length / intervalDuration);

    for (let i = 0; i < intervalCount; i++) {
      const intervalData = poseDataArray.slice(i * intervalDuration, (i + 1) * intervalDuration);
      const angleSums = {
        advance: { leftKnee: 0, rightKnee: 0, leftElb: 0, rightElb: 0, count: 0 },
        retreat: { leftKnee: 0, rightKnee: 0, count: 0 },
        lunge: { leftKnee: 0, rightKnee: 0, leftElb: 0, rightElb: 0, count: 0 }
      };

      intervalData.forEach(({ poseType, angles }) => {
        const { leftKneeAngle, rightKneeAngle, leftElbAngle, rightElbAngle, feetDistance } = angles;

        // Convert feetDistance from meters to inches
        const feetDistanceInches = feetDistance * metersToInches;

        if (poseType === 'advance') {
          angleSums.advance.leftKnee += leftKneeAngle;
          angleSums.advance.rightKnee += rightKneeAngle;
          angleSums.advance.leftElb += leftElbAngle;
          angleSums.advance.rightElb += rightElbAngle;
          angleSums.advance.count++;

          const generateFeedback = (poseType, conditions, messages) => {
            conditions.forEach((condition, index) => {
              if (condition) {
                feedbackMessages[poseType].push(messages[index]);
              }
            });
          };

          if (poseType === 'advance') {
            generateFeedback('advance', [
              feetDistanceInches < 12 || feetDistanceInches > 15,
              rightElbAngle < 85 || rightElbAngle > 95,
              leftKneeAngle < 100 || leftKneeAngle > 170 || rightKneeAngle < 100 || rightKneeAngle > 170
            ], [
              'Try to keep your feet at a comfortable distance apart.',
              'Keep your right elbow at a natural angle.',
              'Aim for a natural bend in your left elbow.',
              'Adjust your knees to maintain a comfortable stance.'
            ]);
          } else if (poseType === 'retreat') {
            generateFeedback('retreat', [
              feetDistanceInches < 12 || feetDistanceInches > 15,
              leftKneeAngle < 70 || leftKneeAngle > 80 || rightKneeAngle < 70 || rightKneeAngle > 80
            ], [
              'Maintain a natural feet distance.',
              'Keep your knees slightly bent.'
            ]);
          } else if (poseType === 'lunge') {
            generateFeedback('lunge', [
              feetDistanceInches < 20 || feetDistanceInches > 24,
              rightElbAngle < 175 || rightElbAngle > 185,
              leftKneeAngle < 85 || leftKneeAngle > 95,
              rightKneeAngle < 175 || rightKneeAngle > 185
            ], [
              'Extend your front foot a bit more naturally.',
              'Extend your right elbow fully.',
              'Bend your front knee to a comfortable angle.',
              'Straighten your back knee completely.'
            ]);
          }
        }
      });

      const averageAngles = {
        advance: {
          leftKnee: angleSums.advance.count ? angleSums.advance.leftKnee / angleSums.advance.count : 0,
          rightKnee: angleSums.advance.count ? angleSums.advance.rightKnee / angleSums.advance.count : 0,
          leftElb: angleSums.advance.count ? angleSums.advance.leftElb / angleSums.advance.count : 0,
          rightElb: angleSums.advance.count ? angleSums.advance.rightElb / angleSums.advance.count : 0
        },
        retreat: {
          leftKnee: angleSums.retreat.count ? angleSums.retreat.leftKnee / angleSums.retreat.count : 0,
          rightKnee: angleSums.retreat.count ? angleSums.retreat.rightKnee / angleSums.retreat.count : 0
        },
        lunge: {
          leftKnee: angleSums.lunge.count ? angleSums.lunge.leftKnee / angleSums.lunge.count : 0,
          rightKnee: angleSums.lunge.count ? angleSums.lunge.rightKnee / angleSums.lunge.count : 0,
          leftElb: angleSums.lunge.count ? angleSums.lunge.leftElb / angleSums.lunge.count : 0,
          rightElb: angleSums.lunge.count ? angleSums.lunge.rightElb / angleSums.lunge.count : 0
        }
      };

      // Determine the most common feedback for each pose type
      const mostCommonFeedback = (feedbackArray) => {
        if (feedbackArray.length === 0) return '';
        const frequency = {};
        feedbackArray.forEach(msg => frequency[msg] = (frequency[msg] || 0) + 1);
        return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
      };

      const feedbackMessage = [
        mostCommonFeedback(feedbackMessages.advance),
        mostCommonFeedback(feedbackMessages.retreat),
        mostCommonFeedback(feedbackMessages.lunge)
      ].filter(Boolean)[0]; // Get the most relevant feedback

      if (feedbackMessage && !isFeedbackMuted) {
        const now = Date.now();
        if (now - lastSpokenFeedbackTime >= 10000) { // Ensure at least 10 seconds between feedback
          setFeedback([feedbackMessage]);
          speak({ text: feedbackMessage, voice: voice, rate: 1.2, pitch: 1.1, lang: 'en-US' });
          setLastSpokenFeedbackTime(now);
        }
      }
    }
  }, [speak, voice, lastSpokenFeedbackTime, isFeedbackMuted]);

  const toggleFeedbackMute = () => {
    setIsFeedbackMuted(prevState => !prevState);
  };

  return (
    <InstructionContext.Provider value={{ instructions, setInstructions }}>
      {isMobile ? (
        <div className={`flex flex-col items-center justify-center h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} p-4`}>
          <p className="text-center text-xl mb-4">
            For a better viewing experience, please visit this website on a computer.
          </p>
          <Link href="/">
            <button className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300`}>
              Go Back
            </button>
          </Link>
        </div>
      ) : (
        <div className={`flex flex-col h-screen font-sans ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} overflow-hidden`}>
          <header className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-900 border-b border-gray-800' : 'bg-gray-100 border-b border-gray-300'} z-10`}>
            <Link href="/">
              <button className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300`} aria-label="Go back">
                &#8592;
              </button>
            </Link>
            <div className="flex-grow flex justify-center">
              <Stream_Vid onVideoChange={handleVideoChange} isRecording={isRecording} toggleRecording={toggleRecording} videoSource={videoSource} />
            </div>
            <div className="flex items-center space-x-4">
              <button
                className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} p-2 rounded-full text-lg font-semibold hover:bg-gray-300`}
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
              <button
                className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} p-2 rounded-full text-lg font-semibold hover:bg-gray-300`}
                onClick={toggleFeedbackMute}
                aria-label={isFeedbackMuted ? 'Unmute Feedback' : 'Mute Feedback'}
              >
                {isFeedbackMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <UserButton />
            </div>
          </header>

          <main className="flex flex-grow relative " style={{ perspective: '1000px' }}>
            <div className="w-1/8 absolute left-0 top-0 bottom-0" style={{ transform: 'rotateY(15deg)', transformOrigin: 'left center', height: '100%', scale: '65%', top: '-60px' }}>
              <div className="h-[full] p-6 flex flex-col justify-center items-center">
                <MemoizedFencerStats
                  pose={pose}
                  lastCalled={lastCalled}
                  setLastCalled={setLastCalled}
                  setAiFeedback={setAiResult}
                  height={height}
                  setFeetDistance={setFeetDistance}
                  setShoulderWidth={setShoulderWidth}
                  darkMode={darkMode}
                  onPoseSequenceDetected={handlePoseSequenceDetected}
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-2.8 space-y-4 z-10" style={{ transform: 'scale(0.7)', marginTop: '-150px'}}>
              <div className="w-2/3 mt-10">
                <MemoizedInstruction isRunning={isRunning} instructionIndex={instructionIndex} instructions={instructions} performedPose={performedPose} />
                <div style={{ marginBottom: '20px' }}></div> {/* Added space between the Timer and Instruction */}
                <MemoizedTimer onTimerStart={handleTimerStart} onReset={handleReset} isStartDisabled={isStartDisabled} resetTimer={resetTimer} data={instructions} instructionIndex={instructionIndex} initialTime={instructions[instructionIndex]?.time} onRunningChange={setIsTimerRunning} darkMode={darkMode} />
              </div>

              {/* Fencer Canvas Component */}
              <div className="w-2/3 aspect-video bg-black flex items-center justify-center rounded-lg relative border border-gray-600" style={{marginTop:'50px'}}>
                <Fencer_Canvas videoSource={height ? videoSource : null} isRecording={isRecording} setPose={setPose} containerWidth="100%" containerHeight="100%" darkMode={darkMode} />
              </div>

              {/* <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">Feedback</h3>
                <ul className="list-disc pl-5">
                  {feedback.map((item, index) => (
                    <li key={index} className="text-white">{item}</li>
                  ))}
                </ul>
              </div> */}
            </div>

            <div className="absolute left-[1070px] top-[10%]" style={{ transform: 'rotateY(-20deg)', transformOrigin: 'left center' }}>
              <CardContainer className="inter-var w-96 h-[24rem]"> 
                <CardBody className={`[transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d] relative group/card ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} h-full rounded-xl p-4 space-y-4 border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  <CardItem translateZ="50" className="text-m font-bold mb-4 w-full text-left">
                    AI Feedback
                  </CardItem>
                  <div className="rounded p-4 border shadow-lg w-[85%] h-[calc(100%-4rem)] overflow-y-auto" style={{ wordWrap: 'break-word' }}> 
                    {/* uncomment to generate AI feedback */}
                    {/* {(aiResult ? aiResult.split('\n') : []).map((item, key) => (
                      <CardItem key={key} translateZ="60" className={`rounded p-2 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'} border ${darkMode ? 'border-gray-700' : 'border-gray-300'} shadow-lg`}>
                        <span>{item}</span><br/>
                      </CardItem>
                    ))} */}
                  </div>
                </CardBody>
              </CardContainer>
            </div>

            <div className={`absolute top-0 left-0 p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'} rounded`}>
              {feedback.map((msg, index) => (
                <div key={index}>{msg}</div>
              ))}
            </div>
          </main>

          <HeightInputModal
            isOpen={isHeightModalOpen}
            onClose={() => setIsHeightModalOpen(false)}
            onSave={handleHeightSave}
          />

        </div>
      )}
    </InstructionContext.Provider>
  );
}

Fencer_Page2.propTypes = {};