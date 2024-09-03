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
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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
  const previousInstructionIndex = useRef(-1);
  const previousFeedback = useRef("");

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
          startSuccessCountdown();
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

  const checkPoseDuration = useCallback((predictedPose) => {
    if (!feedbackEnabled) return; // Skip feedback if not enabled

    const currentInstruction = instructions[instructionIndex];
    const instructionToPose = {
      "Perform an en guarde...": "en guarde",
      "Perform an advance...": "advance",
      "Perform a lunge...": "lunge"
    };
    const expectedPose = instructionToPose[currentInstruction?.name];
    setPerformedPose(predictedPose);

    if (predictedPose && expectedPose && predictedPose === expectedPose) {
      if (!poseStartTime) {
        setPoseStartTime(Date.now());
      } else {
        const elapsedTime = Date.now() - poseStartTime;
        setCountdown((currentInstruction?.time || 3) - Math.floor(elapsedTime / 1000));
        if (elapsedTime >= (currentInstruction?.time || 3) * 1000) {
          setPoseResult("Success");
          speak({ text: "Success", voice: voice, rate: 1, pitch: 1, lang: 'en-US' });
          setPoseStartTime(null);
          setTimeout(handleTimerStart, 3000);
        }
      }
    } else {
      if (poseStartTime && !(instructionIndex === instructions.length - 1 && poseResult === "Success")) {
        setPoseResult("Failure");
        if (!failureTimeout) {
          speak({ text: "Failure", voice: voice, rate: 1, pitch: 1, lang: 'en-US' });
          const timeout = setTimeout(() => {
            setFailureTimeout(null);
          }, 20000);
          setFailureTimeout(timeout);
        }
        setPoseStartTime(null);
      }
    }
  }, [instructions, instructionIndex, poseStartTime, poseResult, speak, voice, handleTimerStart, failureTimeout, feedbackEnabled]);


  // Start of Selection
  const convertPixelsToMeters = (pixels, fencerHeightMeters, fencerHeightPixels) => {
    if (!fencerHeightMeters || !fencerHeightPixels) return null;
    const pixelToMeterRatio = fencerHeightMeters / fencerHeightPixels;
    return pixels * pixelToMeterRatio;
  };

  const checkAngles = useCallback((pose) => {
    if (!feedbackEnabled) return; // Skip feedback if not enabled
  
    const feedbackMessages = [];
    
    const leftKneeAngle = calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27]); // left_hip, left_knee, left_ankle
    const rightKneeAngle = calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28]); // right_hip, right_knee, right_ankle
    const leftElbowAngle = calculateAngle(pose.keypoints[11], pose.keypoints[13], pose.keypoints[15]); // left_shoulder, left_elbow, left_wrist
    const rightElbowAngle = calculateAngle(pose.keypoints[12], pose.keypoints[14], pose.keypoints[16]); // right_shoulder, right_elbow, right_wrist
    
    // Keypoints for checking foot positions during advance
    const frontToeY = pose.keypoints[31].y; // left_foot_index
    const backToeY = pose.keypoints[32].y; // right_foot_index
    const frontKneeX = pose.keypoints[27].x; // left_ankle
    const backKneeX = pose.keypoints[28].x; // right_ankle
    const frontFootX = pose.keypoints[29].x; // left_heel
    const backFootX = pose.keypoints[30].x; // right_heel
  
    const optimalAngles = {
      leftKnee: 150, 
      rightKnee: 150, 
      leftElbow: 100, 
      rightElbow: 100, 
      feetDistanceMin: 0.5, // Meters
      feetDistanceMax: 1.0, // Meters
      speedMin: 1, // Adjust these based on your specific requirements
      speedMax: 4
    };
  
    if (instructions[instructionIndex]?.name === "Advance") {
      // Step 1: Raise front toe (use left_foot_index for front toe and right_foot_index for back toe)
      if (frontToeY >= backToeY) {
        feedbackMessages.push("Raise your front toe slightly to initiate the advance.");
      }
  
      // Step 2: Step forward with the front foot (use left_heel for front foot)
      if (frontFootX <= frontKneeX) {
        feedbackMessages.push("Ensure your front foot steps forward enough.");
      }
  
      // Step 3: Back leg follows (check distance between right_heel and right_ankle)
      if (Math.abs(backFootX - backKneeX) < 20) {
        feedbackMessages.push("Move your back leg forward to maintain the proper distance.");
      }
  
      // Step 4: Return to en garde position
      if (leftKneeAngle < optimalAngles.leftKnee) {
        feedbackMessages.push(`Bend your left knee more to reach at least ${optimalAngles.leftKnee} degrees.`);
      }
      if (rightKneeAngle < optimalAngles.rightKnee) {
        feedbackMessages.push(`Bend your right knee more to reach at least ${optimalAngles.rightKnee} degrees.`);
      }
      if (Math.abs(pose.keypoints[28].x - pose.keypoints[27].x) < 1) {
        feedbackMessages.push("Bring your feet closer together for better balance.");
      }
      if (Math.abs(pose.keypoints[27].x - pose.keypoints[29].x) > 40) {
        feedbackMessages.push("Ensure your front knee and toe are aligned and pointing forward.");
      }
      if (leftElbowAngle < optimalAngles.leftElbow) {
        feedbackMessages.push(`Raise your left elbow to reach about ${optimalAngles.leftElbow} degrees for better defense.`);
      }
      if (rightElbowAngle < optimalAngles.rightElbow) {
        feedbackMessages.push(`Raise your right elbow to around ${optimalAngles.rightElbow} degrees.`);
      }
    }
  
    if (feedbackMessages.length > 0) {
      const currentFeedback = feedbackMessages[feedbackMessages.length - 1];
  
      // Check if the current instruction has changed; if it has, reset the spoken feedback
      if (instructionIndex !== previousInstructionIndex.current) {
        previousInstructionIndex.current = instructionIndex;
        previousFeedback.current = ""; // Reset previous feedback when instruction changes
      }
  
      // Only speak the feedback if it has changed
      if (currentFeedback !== previousFeedback.current) {
        setFeedback([currentFeedback]); // Set the current feedback message on the screen
        speak({ text: currentFeedback, voice: voice, rate: 1, pitch: 1, lang: 'en-US' });
        previousFeedback.current = currentFeedback; // Update the last spoken feedback
      }
    }
  }, [speak, voice, feedbackEnabled, instructions, instructionIndex]);
  
  

  useEffect(() => {
    if (pose) {
      const { predictedPose, feetDistance } = displayFeetDistance(pose.keypoints);
      checkPoseDuration(predictedPose);
      checkAngles(pose);
      const distanceInMeters = convertPixelsToMeters(feetDistance);
      // Use distanceInMeters as needed
    }
  }, [pose, checkPoseDuration, checkAngles, convertPixelsToMeters]);

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

  return (
    <InstructionContext.Provider value={{ instructions, setInstructions }}>
        {isMobile ? (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-4">
          <p className="text-center text-xl mb-4">
            For a better viewing experience, please visit this website on a computer.
          </p>
          <Link href="/">
            <button className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300">
              Go Back
            </button>
          </Link>
        </div>
      ) : (
      <div className="flex flex-col h-screen font-sans bg-black text-white overflow-hidden">
      <header className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 z-10">
      <Link href="/">
        <button className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300" aria-label="Go back">
          &#8592;
        </button>
      </Link>
      <div className="flex-grow flex justify-center">
        <Stream_Vid onVideoChange={handleVideoChange} isRecording={isRecording} toggleRecording={toggleRecording} videoSource={videoSource} />
      </div>
      <UserButton />
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
          />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-2.8 space-y-4 z-10" style={{ transform: 'scale(0.7)', marginTop: '-150px'}}> 
          <div className="w-2/3 mt-10">
            <MemoizedInstruction isRunning={isRunning} instructionIndex={instructionIndex} instructions={instructions} performedPose={performedPose} />
            <div style={{ marginBottom: '20px' }}></div> {/* Added space between the Timer and Instruction */}
            <MemoizedTimer onTimerStart={handleTimerStart} onReset={handleReset} isStartDisabled={isStartDisabled} resetTimer={resetTimer} data={instructions} instructionIndex={instructionIndex} initialTime={instructions[instructionIndex]?.time} />
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
        </div>
        <CardContainer className="w-[1000px] h-[400px] absolute right-[-320px] top-[25%] shadow-2xl" style={{ transform: 'rotateY(15deg)', transformOrigin: 'right center', scale: '100%' }}>
        <div className="h-full p-6 overflow-auto hide-scrollbar">
          <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-8 space-y-4 border">
          <CardItem translateZ="50" className="text-xl font-bold text-neutral-600 dark:text-white mb-4">
              AI Feedback
            </CardItem>
            <div className="grid grid-rows-1 grid-cols-1 gap-4">
              <CardItem translateZ="60" className="rounded p-4 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg w-auto text-white" style={{ width: '150px', wordWrap: 'break-word' }}>
                {(aiResult ? aiResult.split('\n') : []).map((item, key) => (
                  <span key={key}>{item}<br/></span>
                ))}
              </CardItem>
            </div>
          </CardBody>
        </div>
      </CardContainer>

<div className="absolute top-0 left-0 p-4 bg-gray-800 text-white rounded">
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

Fencer_Page2.propTypes = {
};
