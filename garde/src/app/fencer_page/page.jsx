"use client";

import React, { useState, useEffect } from 'react';
import * as posedetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import Stream_Vid from '../../components/Stream_Vid.jsx';
import Link from 'next/link.js';
import Timer from '../../components/Timer.jsx';
import AI_Feedback from '../../components/AI_Feedback.jsx';
import { UserButton } from '@clerk/nextjs';
import Fencer_Canvas from '../../components/Fencer_Canvas.jsx';
import Fencer_Stats from '../../components/Fencer_Stats.jsx';
import Instruction from '../../components/Instruction.jsx';
import { useUser } from '@clerk/nextjs';
import { useSpeechSynthesis } from 'react-speech-kit';
import { displayFeetDistance } from '../../components/Fencer_Canvas.jsx';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { GetAngles } from "../../components/Fencer_Stats.jsx"

const instructions = [
  "Perform an en guarde...",
  "Perform an advance...",
  "Perform a lunge...",
];

function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomValue = Array.from({ length: 5 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
  const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  
  return timestamp + randomValue + counter;
}

export default function Fencer_Page() {
  const [videoSource, setVideoSource] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [pose, setPose] = useState(null);
  const [instructionIndex, setInstructionIndex] = useState(-1);
  const [isStartDisabled, setIsStartDisabled] = useState(false);
  const [poseStartTime, setPoseStartTime] = useState(null);
  const [performedPose, setPerformedPose] = useState("");
  const [hasSpoken, setHasSpoken] = useState(false);
  const [poseResult, setPoseResult] = useState("");
  const [countdown, setCountdown] = useState(3); // State for success countdown timer
  const [failureTimeout, setFailureTimeout] = useState(null); // State to handle failure timeout
  const [hasStarted, setHasStarted] = useState(false);
  const [resetTimer, setResetTimer] = useState(false);
  const [countdownFinished, setCountdownFinished] = useState(false);
  const [preInstructionCountdown, setPreInstructionCountdown] = useState(3); // State for pre-instruction countdown
  const [showPreInstructionCountdown, setShowPreInstructionCountdown] = useState(false); // To control rendering
  const [isInstructionBeingSaid, setIsInstructionBeingSaid] = useState(false);

  const [lastCalled, setLastCalled] = useState(Date.now());

  const { speak, voices } = useSpeechSynthesis();
  const [voice, setVoice] = useState(null);

  const [fencer, setFencer] = useState({});
  const { user } = useUser();

  useEffect(() => {
    const fetchFencer = async () => {
      const f = await getFencer(user.id, user.fullName, "fencer", setFencer);
      setFencer(f);
    };
  
    if (user && user.id && user.fullName) {
      fetchFencer();
    }
  }, [user]);

  useEffect(() => {
    if (voices.length > 0) {
      setVoice(voices[18]); // Daniel from https://mikeyparton.github.io/react-speech-kit/
    }
  }, [voices]);

  useEffect(() => {
    if (instructionIndex >= 0 && instructionIndex < instructions.length && !hasSpoken && !isInstructionBeingSaid) {
      setHasSpoken(true); // Ensure this is set to prevent duplicate speech
      setTimeout(() => {
        speak({
          text: `${instructions[instructionIndex]} Starting in 3, 2, 1`,
          voice: voice,
          rate: 1,
          pitch: 1,
          lang: 'en-US',
          onend: () => {
            setShowPreInstructionCountdown(false);
            setHasSpoken(false); // Allow the success countdown to start after speaking
          },
        });
        setShowPreInstructionCountdown(true);
        startPreInstructionCountdown();
        setResetTimer(true);
      }, 0); // 1000 milliseconds = 1 second delay
    }
  }, [instructionIndex, voice, speak, hasSpoken, videoSource, isInstructionBeingSaid]);

  const startPreInstructionCountdown = () => {
    setPreInstructionCountdown(3);
    const interval = setInterval(() => {
      setPreInstructionCountdown((prevCountdown) => {
        if (prevCountdown > 1) {
          return prevCountdown - 1;
        } else {
          clearInterval(interval);
          startSuccessCountdown(); // Start the success countdown after the pre-instruction countdown has finished
          return 0;
        }
      });
    }, 1000);
  };

  const startSuccessCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown > 1) {
          return prevCountdown - 1;
        } else {
          clearInterval(interval);
          return 0;
        }
      });
    }, 1000);
  };

  const handleTimerStart = () => {
    setHasStarted(true);
    setShowPreInstructionCountdown(false);
    setInstructionIndex((prevIndex) => {
      if (prevIndex >= instructions.length - 1) {
        setIsStartDisabled(true);
      }
      setHasSpoken(false); // Reset spoken state for the next instruction
      return prevIndex + 1;
    });
    setPoseResult("");
    setResetTimer(false);
    setCountdown(3); // Reset countdown for new instruction
  };

  const handleReset = () => {
    setInstructionIndex(-1);
    setIsStartDisabled(false);
    setPoseStartTime(null);
    setHasSpoken(false);
    setPoseResult("");
    setCountdown(3); // Reset countdown on reset
    setResetTimer(true);
    setPreInstructionCountdown(3); // Reset pre-instruction countdown on reset
    setShowPreInstructionCountdown(false);
    clearTimeout(failureTimeout); // Clear the failure timeout on reset
  };

  const handleVideoChange = (newVideoSource) => {
    setVideoSource(newVideoSource);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const checkPoseDuration = (predictedPose) => {
    const currentInstruction = instructions[instructionIndex];
    const instructionToPose = {
      "Perform an en guarde...": "en guarde",
      "Perform an advance...": "advance",
      "Perform a lunge...": "lunge",
      "Perform a defensive stance...": "defensive stance"
    };
    const expectedPose = instructionToPose[currentInstruction];
    setPerformedPose(predictedPose);
  
    if (predictedPose && expectedPose && predictedPose === expectedPose) {
      if (!poseStartTime) {
        setPoseStartTime(Date.now());
      } else {
        const elapsedTime = Date.now() - poseStartTime;
        setCountdown(3 - Math.floor(elapsedTime / 1000)); // Update countdown based on elapsed time
        if (elapsedTime >= 3000) {
          setPoseResult("Success");
          speak({ text: "Success", voice: voice, rate: 1, pitch: 1, lang: 'en-US' });
          setPoseStartTime(null);
          setTimeout(() => {
            handleTimerStart();
          }, 3000); // 3-second pause before moving to the next instruction
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
  };

  useEffect(() => {
    if (pose) {
      const { predictedPose } = displayFeetDistance(pose.keypoints);
      checkPoseDuration(predictedPose);
    }
  }, [pose]);

  useEffect(() => {
    if (countdownFinished && poseResult === "Success") {
      const interval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown > 0) {
            return prevCountdown - 1;
          } else {
            clearInterval(interval);
            setCountdownFinished(true); // Set countdownFinished to true when countdown reaches 0
            return 3;
          }
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [countdownFinished, poseResult]);

  return (
    <div className="flex flex-col h-max font-sans bg-gray-900 text-white">
      {/* Navbar */}
      <div className="flex items-center justify-between p-4 bg-black border-b border-gray-700">
        {/* Left Side - Back Button */}
        <Link href="/">
          <button className="bg-gray-700 text-white py-2 px-4 rounded text-lg font-semibold hover:bg-gray-600">
            &#8592;
          </button>
        </Link>
        {/* Center - Fencer Name */}
        {user && user.fullName && (<span className="text-lg font-semibold flex-1 text-center">{user.fullName}</span>)}
        <UserButton />
        {/* Right Side - Stream Vid Buttons */}
        <div className="absolute right-4 top-10">
          <Stream_Vid onVideoChange={handleVideoChange} isRecording={isRecording} toggleRecording={toggleRecording} videoSource={videoSource} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-grow overflow-auto">
        {/* Column 1 - Feedback and Stats */}
        <div className="w-1/3 bg-gray-800 p-4 flex flex-col space-y-4 border-r border-gray-700">
          <div className="box-border h-full p-4 border-2 border-gray-700 rounded-lg shadow-lg">
            <AI_Feedback />
          </div>
          <div className="box-border h-full p-4 border-2 border-gray-700 rounded-lg shadow-lg">
            <Fencer_Stats pose={pose} lastCalled={lastCalled} setLastCalled={setLastCalled} />
          </div>
        </div>

        {/* Column 2 - Timer, Instruction, Canvas */}
        <div className="w-2/3 bg-gray-800 flex flex-col">
          <div className="mt-9 flex flex-col items-center">
            {showPreInstructionCountdown && (
              <div className="pre-instruction-countdown text-4xl font-semibold mb-2">
                {preInstructionCountdown}
              </div>
            )}
            <Timer onTimerStart={handleTimerStart} onReset={handleReset} isStartDisabled={isStartDisabled} resetTimer={resetTimer} />
          </div>
          <div className="my-5">
            <Instruction instructionIndex={instructionIndex} instructions={instructions} performedPose={performedPose} />
          </div>
          <div className="flex justify-center items-center">
            <div id="poseResult" className="text-2xl font-semibold text-white flex items-center">
              {poseResult === "Success" && <FaCheckCircle className="text-green-500 mr-2" />}
              {poseResult === "Failure" && <FaTimesCircle className="text-red-500 mr-2" />}
              {hasSpoken && <div className="countdown-circle">{countdown}</div>}
            </div>
          </div>
          <div className="flex-grow flex justify-center items-center">
            <Fencer_Canvas videoSource={videoSource} isRecording={isRecording} setPose={setPose} />
          </div>
        </div>
      </div>
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
  );
}
         
const getFencer = async (userId, name, type) => {
  const response = await fetch('/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({"_id": userId, "name": name, "type": type}),
  })

  const result = await response.json();
  
  // setFencer(result.document);
  return result.document
};