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
import { FaCheckCircle, FaTimesCircle, FaSun, FaMoon } from 'react-icons/fa';
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
  const spokenFeedbackCooldown = 3500; // 3.5 seconds cooldown
  const [darkMode, setDarkMode] = useState(false);

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

  const convertPixelsToMeters = (pixels, fencerHeightMeters, fencerHeightPixels) => {
    if (!fencerHeightMeters || !fencerHeightPixels) return null;
    const pixelToMeterRatio = fencerHeightMeters / fencerHeightPixels;
    return pixels * pixelToMeterRatio;
  };

  const checkLunge = (pose) => {
    const frontKneeAngle = calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27]);
    const backLegAngle = calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28]);
    const torsoUpright = Math.abs(pose.keypoints[23].y - pose.keypoints[24].y) < 30;

    const swordArmAngle = calculateAngle(pose.keypoints[11], pose.keypoints[13], pose.keypoints[15]);
    const nonSwordArmAngle = calculateAngle(pose.keypoints[12], pose.keypoints[14], pose.keypoints[16]);

    console.log(`Lunge Check - Front Knee Angle: ${frontKneeAngle}, Back Leg Angle: ${backLegAngle}, Torso Upright: ${torsoUpright}, Sword Arm Angle: ${swordArmAngle}, Non-Sword Arm Angle: ${nonSwordArmAngle}`);

    let feedback = '';

    // Check front knee angle
    if (frontKneeAngle > 100 && frontKneeAngle < 140) {
      feedback += 'Good front knee bend. ';
    } else if (frontKneeAngle <= 100) {
      feedback += 'Bend your front knee more. ';
    } else {
      feedback += 'Bend your front knee less. ';
    }

    // Check back leg angle
    if (backLegAngle > 160) {
      feedback += 'Good back leg extension. ';
    } else {
      feedback += 'Straighten your back leg more. ';
    }

    // Check torso
    if (torsoUpright) {
      feedback += 'Good torso position. ';
    } else {
      feedback += 'Keep your torso more upright. ';
    }

    // Check sword arm
    if (swordArmAngle > 160) {
      feedback += 'Good sword arm extension. ';
    } else {
      feedback += 'Extend your sword arm further. ';
    }

    // Check non-sword arm
    if (nonSwordArmAngle > 160) {
      feedback += 'Good non-sword arm position. ';
    } else {
      feedback += 'Raise your non-sword arm more. ';
    }

    const isGoodLunge = frontKneeAngle > 100 && frontKneeAngle < 140 && 
                        backLegAngle > 160 && 
                        torsoUpright && 
                        swordArmAngle > 160 && 
                        nonSwordArmAngle > 160;

    if (isGoodLunge) {
      if (previousPose !== 'lunge') {
        setPreviousPose('lunge');
        return { feedback: 'Excellent lunge posture!', success: true };
      }
    } else {
      setPreviousPose(null);
      return { feedback: 'Adjust your lunge posture: ' + feedback.trim(), success: false };
    }

    return { feedback: 'Hold your lunge position.', success: true };
  };

  const checkAdvance = (pose, feetDistance, shoulderWidth) => {
    if (!pose || !pose.keypoints) {
      console.log('No pose detected');
      return { feedback: 'No pose detected', success: false };
    }

    const rightShoulder = pose.keypoints[12];
    const leftShoulder = pose.keypoints[11];

    if (!rightShoulder || !leftShoulder) {
      console.log('Missing keypoints');
      return { feedback: 'Please ensure your full body is visible', success: false };
    }

    console.log('Distance between feet (m):', feetDistance);
    console.log('Shoulder width (m):', shoulderWidth);

    let feedback = '';

    // Check if the person is facing sideways
    if (Math.abs(rightShoulder.x - leftShoulder.x) < shoulderWidth * 0.3) {
      feedback = 'Please face sideways for proper advance stance';
    }
    // Check if feet are too close together
    else if (feetDistance < shoulderWidth * 0.5) {
      feedback = 'Feet are too close together. Take a wider stance';
    }
    // Check if feet are too far apart
    else if (feetDistance > shoulderWidth * 2.0) {
      feedback = 'Your stance is too wide. Bring your feet closer together';
    }
    else {
      feedback = 'Good advance posture';
    }

    console.log('Advance feedback:', feedback);
    return { feedback, success: feedback === 'Good advance posture' };
  };

  const checkRetreat = (pose) => {
    const backKneeAngle = calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28]);
    if (backKneeAngle < 100 || backKneeAngle > 180) {
      console.log(`Retreat Check - Back Knee Angle: ${backKneeAngle} (Bend your back knee more)`);
      return { feedback: 'Bend your back knee more.', success: false };
    }

    const frontLegAngle = calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27]);
    if (frontLegAngle <= 100) {
      console.log(`Retreat Check - Front Leg Angle: ${frontLegAngle} (Ensure your front leg is straight)`);
      return { feedback: 'Ensure your front leg is straight.', success: false };
    }

    const torsoUpright = Math.abs(pose.keypoints[23].y - pose.keypoints[24].y) < 50; // Adjusted for wider range
    if (!torsoUpright) {
      console.log(`Retreat Check - Torso Upright: ${torsoUpright} (Keep your torso upright)`);
      return { feedback: 'Keep your torso upright.', success: false };
    }

    console.log('Retreat Check - Good retreat posture.');
    return { feedback: 'Good retreat posture.', success: true };
  };

  const feedbackTree = {
    advance: { checkLunge, checkAdvance },
    retreat: { checkLunge, checkRetreat },
    pullingDoubleAdvance: { checkLunge },
    pullingDoubleRetreat: { checkLunge },
    doubleSlowAdvance: { checkLunge },
    doubleSlowRetreat: { checkLunge },
    doubleQuickAdvance: { checkLunge },
    doubleQuickRetreat: { checkLunge },
    bigDoubleSmallAdvance: { checkLunge },
    bigDoubleSmallRetreat: { checkLunge },
    rightyLeftyAdvance: { checkLunge },
    rightyLeftyRetreat: { checkLunge },
    leftyLaps: { checkLunge },
    doubleAdvance: { checkLunge },
    doubleRetreat: { checkLunge }
  };

  const checkPoseAndProvideFeedback = (pose, poseName) => {
    const feedbackFunctions = feedbackTree[poseName];
    if (!feedbackFunctions) return 'Pose not recognized';

    for (const checkFunction of Object.values(feedbackFunctions)) {
      const result = checkFunction(pose);
      if (!result.success) {
        return result.feedback;
      }
    }
    return 'Good posture.';
  };

  const checkAngles = useCallback((pose) => {
    console.log('Feedback enabled:', feedbackEnabled);
    console.log('Timer running:', isTimerRunning);
    console.log('Current instruction:', instructions[instructionIndex]?.name);

    if (!feedbackEnabled || !isTimerRunning) {
      console.log('Feedback skipped');
      return;
    }

    const currentInstruction = instructions[instructionIndex]?.name.toLowerCase().replace(/\s+/g, '');
    console.log('Processed current instruction:', currentInstruction);

    const now = Date.now();
    if (now - lastSpokenFeedbackTime < spokenFeedbackCooldown) {
      console.log('Spoken feedback cooldown active');
      return;
    }

    let feedbackGiven = false;
    let feedbackMessage = '';

    if (currentInstruction === 'advance') {
      console.log('Advance instruction detected');
      const result = checkAdvance(pose, feetDistance, shoulderWidth);
      console.log('Advance check result:', result);
      if (result.feedback) {
        feedbackMessage = result.feedback;
        feedbackGiven = true;
      }
    } else if (currentInstruction && currentInstruction.includes('lunge')) {
      console.log('Lunge instruction detected');
      const result = checkLunge(pose);
      console.log('Lunge check result:', result);
      if (result.feedback) {
        feedbackMessage = result.feedback;
        feedbackGiven = true;
      }
    }

    if (feedbackGiven) {
      if (feedbackMessage !== previousFeedback.current.message || now - previousFeedback.current.timestamp > spokenFeedbackCooldown * 2) {
        setFeedback([feedbackMessage]);
        speak({ text: feedbackMessage, voice: voice, rate: 1.2, pitch: 1.1, lang: 'en-US' });
        setLastSpokenFeedbackTime(now);
        previousFeedback.current = { message: feedbackMessage, timestamp: now };
      } else {
        console.log('Repeated feedback omitted');
      }
    } else {
      console.log('No matching instruction for feedback');
    }
  }, [speak, voice, feedbackEnabled, instructions, instructionIndex, isTimerRunning, feetDistance, shoulderWidth, lastSpokenFeedbackTime]);

  const checkPoseDuration = useCallback((predictedPose) => {
    if (!feedbackEnabled || !isTimerRunning) return;
    if (!feedbackEnabled) return;

    const currentInstruction = instructions[instructionIndex]?.name.toLowerCase().replace(/\s+/g, '');
    if (predictedPose && currentInstruction && predictedPose === currentInstruction) {
      if (!poseStartTime) {
        setPoseStartTime(Date.now());
      } else {
        const elapsedTime = Date.now() - poseStartTime;
        setCountdown((instructions[instructionIndex]?.time || 3) - Math.floor(elapsedTime / 1000));
        if (elapsedTime >= (instructions[instructionIndex]?.time || 3) * 1000) {
          setPoseResult("Success");
          speak({ text: "Success", voice: voice, rate: 1.2, pitch: 1.1, lang: 'en-US' }); // Adjusted for more natural sound
          setPoseStartTime(null);
          setTimeout(handleTimerStart, 3000);
        }
      }
    } else {
      if (poseStartTime && !(instructionIndex === instructions.length - 1 && poseResult === "Success")) {
        setPoseResult("Failure");
        if (!failureTimeout) {
          speak({ text: "Failure", voice: voice, rate: 1.2, pitch: 1.1, lang: 'en-US' }); // Adjusted for more natural sound
          const timeout = setTimeout(() => {
            setFailureTimeout(null);
          }, 20000);
          setFailureTimeout(timeout);
        }
        setPoseStartTime(null);
      }
    }
  }, [instructions, instructionIndex, poseStartTime, poseResult, speak, voice, handleTimerStart, failureTimeout, feedbackEnabled, isTimerRunning]);

  useEffect(() => {
    if (pose) {
      const { predictedPose, feetDistance } = displayFeetDistance(pose.keypoints);
      checkPoseDuration(predictedPose);
      checkAngles(pose);
      const distanceInMeters = convertPixelsToMeters(feetDistance, height, feetDistance);
    }
  }, [pose, checkPoseDuration, checkAngles, convertPixelsToMeters, height]);

  useEffect(() => {
    if (countdownFinished && poseResult === "Success") {
      const interval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown > 0) {
            return prevCountdown - 1;
          } else {
            clearInterval(interval);
            setCountdownFinished(false);
            return 3;
          }
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [countdownFinished, poseResult]);

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
    console.log('Timer running state changed:', isTimerRunning);
  }, [isTimerRunning]);

  useEffect(() => {
    if (!isTimerRunning) {
      setFeedback([]);
      previousFeedback.current = { message: '', timestamp: 0 };
    }
  }, [isTimerRunning]);

  useEffect(() => {
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(userPrefersDark);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
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
              <UserButton />
            </div>
          </header>

          <main className="flex flex-grow relative" style={{ perspective: '1000px' }}>
            <div className="w-1/8 absolute left-0 top-0 bottom-0 shadow-2xl" style={{ transform: 'rotateY(15deg)', transformOrigin: 'left center', height: '100%', scale: '60%', top: '0px' }}>
              <div className="h-full p-6 overflow-auto hide-scrollbar">
                <MemoizedFencerStats
                  pose={pose}
                  lastCalled={lastCalled}
                  setLastCalled={setLastCalled}
                  setAiFeedback={setAiResult}
                  height={height}
                  setFeetDistance={setFeetDistance}
                  setShoulderWidth={setShoulderWidth}
                  darkMode={darkMode}
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
                <Fencer_Canvas videoSource={videoSource} isRecording={isRecording} setPose={setPose} containerWidth="100%" containerHeight="100%" />
              </div>

              <div className="flex justify-center items-center">
                <div id="poseResult" className="text-2xl font-semibold text-white flex items-center">
                  {poseResult === "Success" && <FaCheckCircle className="text-green-400 mr-2" />}
                  {poseResult === "Failure" && <FaTimesCircle className="text-red-400 mr-2" />}
                  {hasSpoken && <div className="countdown-circle">{countdown}</div>}
                </div>
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
            <div className={`left-[1050px] absolute top-[25%] left-0 ml-8 shadow-2xl ${darkMode ? 'bg-black' : 'bg-gray-50'} dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[35rem] h-[50%] rounded-xl p-8 space-y-4 border hover:shadow-2xl hover:shadow-emerald-500/[0.1] transition-transform duration-300 ease-in-out transform-gpu hover:rotateY-5deg`} style={{ transform: 'rotateY(-15deg)', transformOrigin: 'left center', width: '20%' }}>
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-neutral-600'} mb-4`}>
                AI Feedback
              </div>
              <div className={`rounded p-4 ${darkMode ? 'bg-gray-800 bg-opacity-50 border-gray-700' : 'bg-gray-100 border-gray-300'} border shadow-lg w-auto ${darkMode ? 'text-white' : 'text-black'}`} style={{ wordWrap: 'break-word' }}>
                {(aiResult ? aiResult.split('\n') : []).map((item, key) => (
                  <span key={key}>{item}<br/></span>
                ))}
              </div>
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

          <style jsx>{`
            .countdown-circle {
              width: 40px;
              height: 40px;
              border: 2px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.5rem;
            }
            .pre-instruction-countdown {
              color: white;
            }
          `}</style>
        </div>
      )}
    </InstructionContext.Provider>
  );
}

Fencer_Page2.propTypes = {};