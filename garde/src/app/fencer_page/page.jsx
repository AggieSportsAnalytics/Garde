"use client";
import React, { useState, useEffect, useRef } from 'react';
import * as posedetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import Stream_Vid from '../../components/Stream_Vid.jsx';
import Link from 'next/link.js';
import Timer from '../../components/Timer.jsx';
import AI_Feedback from '../../components/AI_Feedback.jsx';
import { UserButton, auth } from '@clerk/nextjs';
import Fencer_Canvas from '../../components/Fencer_Canvas.jsx';
import Fencer_Stats from '../../components/Fencer_Stats.jsx';
import Instruction from '../../components/Instruction.jsx';
import { useSpeechSynthesis } from 'react-speech-kit';
import { displayFeetDistance } from '../../components/Fencer_Canvas.jsx';

const instructions = [
  "Perform an en guarde...",
  "Perform an advance...",
  "Perform a lunge...",
  "Perform a defensive stance..."
];

export default function Fencer_Page() {
  const [videoSource, setVideoSource] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [pose, setPose] = useState(null);

  const [instructionIndex, setInstructionIndex] = useState(-1);
  const [isStartDisabled, setIsStartDisabled] = useState(false);
  const [poseStartTime, setPoseStartTime] = useState(null);
  const [performedPose, setPerformedPose] = useState("");
  const [hasSpoken, setHasSpoken] = useState(false); // Added state to control speaking once per instruction

  const { speak, voices } = useSpeechSynthesis();
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    if (voices.length > 0) {
      setVoice(voices[18]); // Daniel from https://mikeyparton.github.io/react-speech-kit/
    }
  }, [voices]);

  useEffect(() => {
    if (instructionIndex >= 0 && instructionIndex < instructions.length && !hasSpoken) {
      speak({ 
        text: instructions[instructionIndex], 
        voice: voice,
        rate: 1, 
        pitch: 1, 
        lang: 'en-US'
      });
      setHasSpoken(true); // Mark that the instruction has been spoken
    }
  }, [instructionIndex, voice, speak, hasSpoken]);

  const handleTimerStart = () => {
    setInstructionIndex((prevIndex) => {
      if (prevIndex >= instructions.length - 1) {
        setIsStartDisabled(true);
      }
      setHasSpoken(false); // Reset the spoken state for the next instruction
      return prevIndex + 1;
    });
  };

  const handleReset = () => {
    setInstructionIndex(-1);
    setIsStartDisabled(false);
    setPoseStartTime(null);
    setHasSpoken(false); // Reset the spoken state
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
        if (elapsedTime >= 3000) {
          handleTimerStart();
          setPoseStartTime(null);
        }
      }
    } else {
      setPoseStartTime(null);
    }
  };

  useEffect(() => {
    if (pose) {
      const { predictedPose } = displayFeetDistance(pose.keypoints);
      checkPoseDuration(predictedPose);
    }
  }, [pose]);

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
          <Fencer_Stats pose={pose}/>
          </div>
        </div>

        {/* Column 2 - Timer, Instruction, Canvas */}
        <div className="w-2/3 bg-gray-800 flex flex-col">
          <div className="mt-9">
            <Timer onTimerStart={handleTimerStart} onReset={handleReset} isStartDisabled={isStartDisabled} />
          </div>
          <div className="my-5">
            <Instruction instructionIndex={instructionIndex} instructions={instructions} performedPose={performedPose} />
          </div>
          <div className="flex-grow flex justify-center items-center">
            <Fencer_Canvas videoSource={videoSource} isRecording={isRecording} setPose={setPose} />
          </div>
        </div>
      </div>
    </div>
  );
}
