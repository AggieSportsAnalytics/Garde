"use client";
import React, { useState, useEffect } from "react";
// import * as posedetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import Stream_Vid from "../../components/Stream_Vid.jsx";
import Link from "next/link.js";
import Timer from "../../components/Timer.jsx";
// import AI_Feedback from "../../components/AI_Feedback.jsx";
import Fencer_Canvas from "../../components/Fencer_Canvas.jsx";
import Fencer_Stats from "../../components/Fencer_Stats.jsx";
import Instruction from "../../components/Instruction.jsx";
import { useSpeechSynthesis } from "react-speech-kit";
import { displayFeetDistance } from "../../components/Fencer_Canvas.jsx";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import HeightInputModal from "../../components/HeightInputModal.jsx";
// import { getFencerInstructions } from '../../../prisma/fencer_instructions.js';
import InstructionContext from "../../components/InstructionContext.js";

export default function Fencer_Page() {
	const [videoSource, setVideoSource] = useState("");
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
	const [showPreInstructionCountdown, setShowPreInstructionCountdown] =
		useState(false);
	const [isInstructionBeingSaid, setIsInstructionBeingSaid] = useState(false);
	const [lastCalled, setLastCalled] = useState(Date.now());
	const [aiResult, setAiResult] = useState(null);
	const [height, setHeight] = useState(null);
	const [isHeightModalOpen, setIsHeightModalOpen] = useState(false);
	const { speak, voices } = useSpeechSynthesis();
	const [voice, setVoice] = useState(null);
	const [instructions, setInstructions] = useState([]);
	const [isRunning, setIsRunning] = useState(false);
	const [data, setData] = useState();
	const [videoInput, setVideoInput] = useState(false);

	const handleHeightSave = (heightInMeters) => {
		setHeight(heightInMeters);
		setIsHeightModalOpen(false);
	};

	const convertPixelsToMeters = (pixels) => {
		if (!height) return null;
		const pixelToMeterRatio = height / 100; // Adjust this ratio based on calibration
		return pixels * pixelToMeterRatio;
	};

	useEffect(() => {
		if (voices.length > 0 && !voice) {
			setVoice(voices[18]);
		}
	}, [voices, voice]);

	useEffect(() => {
		if (
			instructionIndex >= 0 &&
			instructionIndex < instructions.length &&
			!hasSpoken &&
			!isInstructionBeingSaid
		) {
			setHasSpoken(true);
			setTimeout(() => {
				speak({
					text: `${instructions[instructionIndex].name} Starting in 3, 2, 1`,
					voice: voice,
					rate: 1,
					pitch: 1,
					lang: "en-US",
					onend: () => {
						setShowPreInstructionCountdown(false);
						setHasSpoken(false);
						setInstructionIndex(instructionIndex + 1); // Increment instructionIndex after each instruction is spoken
					},
				});
				setShowPreInstructionCountdown(true);
				startPreInstructionCountdown();
				setResetTimer(true);
			}, 0);
		}
	}, [
		instructionIndex,
		voice,
		speak,
		hasSpoken,
		videoSource,
		isInstructionBeingSaid,
	]);

	const startPreInstructionCountdown = () => {
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
	};

	const startSuccessCountdown = () => {
		if (!videoInput) return; // Don't start the countdown if there's no video input

		const instructionTime = instructions[instructionIndex].time;
		setCountdown(instructionTime);
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
				return prevIndex;
			}
			setHasSpoken(false);
			return prevIndex + 1;
		});
		setPoseResult("");
		setResetTimer(false);
		setCountdown(
			instructions[instructionIndex]
				? instructions[instructionIndex + 1].time
				: 3,
		);
		setIsRunning(true);
	};

	const handleReset = () => {
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
	};

	const handleVideoChange = (newVideoSource) => {
		setVideoSource(newVideoSource);
		setVideoInput(true); // Set videoInput to true
		if (!height) setIsHeightModalOpen(true);
	};

	const toggleRecording = () => {
		if (!height) {
			setIsHeightModalOpen(true);
		}
		setIsRecording(!isRecording);
		setIsRunning(!isRunning);
	};

	const checkPoseDuration = (predictedPose) => {
		const currentInstruction = instructions[instructionIndex];
		const instructionToPose = {
			"Perform an en guarde...": "en guarde",
			"Perform an advance...": "advance",
			"Perform a lunge...": "lunge",
		};
		const expectedPose = instructionToPose[currentInstruction];
		setPerformedPose(predictedPose);

		if (predictedPose && expectedPose && predictedPose === expectedPose) {
			if (!poseStartTime) {
				setPoseStartTime(Date.now());
			} else {
				const elapsedTime = Date.now() - poseStartTime;
				setCountdown(
					instructions[instructionIndex].time - Math.floor(elapsedTime / 1000),
				);
				if (elapsedTime >= instructions[instructionIndex].time * 1000) {
					setPoseResult("Success");
					speak({
						text: "Success",
						voice: voice,
						rate: 1,
						pitch: 1,
						lang: "en-US",
					});
					setPoseStartTime(null);
					setTimeout(() => {
						handleTimerStart();
					}, 3000);
				}
			}
		} else {
			if (
				poseStartTime &&
				!(
					instructionIndex === instructions.length - 1 &&
					poseResult === "Success"
				)
			) {
				setPoseResult("Failure");
				if (!failureTimeout) {
					speak({
						text: "Failure",
						voice: voice,
						rate: 1,
						pitch: 1,
						lang: "en-US",
					});
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
			const { predictedPose, feetDistance } = displayFeetDistance(
				pose.keypoints,
			);
			checkPoseDuration(predictedPose);
			const distanceInMeters = convertPixelsToMeters(feetDistance);
			// Use distanceInMeters for further processing
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
						setCountdownFinished(true);
						return 3;
					}
				});
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [countdownFinished, poseResult]);

	return (
		<InstructionContext.Provider value={{ instructions, setInstructions }}>
			<div className="flex flex-col h-max font-sans bg-gray-900 text-white">
				<div className="flex items-center justify-between p-4 bg-black border-b border-gray-700">
					<Link href="api/auth/signout?callbackUrl=/">
						<button className="bg-gray-700 text-white py-2 px-4 rounded text-lg font-semibold hover:bg-gray-600">
							&#8592;
						</button>
					</Link>
					{/* <UserButton /> */}

					<div className="absolute right-4 top-10">
						<Stream_Vid
							onVideoChange={handleVideoChange}
							isRecording={isRecording}
							toggleRecording={toggleRecording}
							videoSource={videoSource}
						/>
					</div>
				</div>

				<HeightInputModal
					isOpen={isHeightModalOpen}
					onClose={() => setIsHeightModalOpen(false)}
					onSave={handleHeightSave}
				/>

				<div className="flex flex-grow overflow-auto">
					<div className="w-1/3 bg-gray-800 p-4 flex flex-col space-y-4 border-r border-gray-700">
						<div className="box-border h-full p-4 border-2 border-blue-700 rounded-lg shadow-lg">
							{(aiResult ? aiResult.split("\n") : []).map((item, key) => {
								return (
									<span key={key}>
										{item}
										<br />
									</span>
								);
							})}
						</div>
						<div className="box-border h-full p-4 border-2 border-gray-700 rounded-lg shadow-lg">
							<Fencer_Stats
								pose={pose}
								lastCalled={lastCalled}
								setLastCalled={setLastCalled}
								setAiFeedback={setAiResult}
								height={height}
							/>
						</div>
					</div>
					<div className="w-2/3 bg-gray-800 flex flex-col">
						<div className="mt-9 flex flex-col items-center">
							{showPreInstructionCountdown && (
								<div className="pre-instruction-countdown text-4xl font-semibold mb-2">
									{preInstructionCountdown}
								</div>
							)}
							<Timer
								onTimerStart={handleTimerStart}
								onReset={handleReset}
								isStartDisabled={isStartDisabled}
								resetTimer={resetTimer}
								data={instructions}
								instructionIndex={instructionIndex}
								initialTime={instructions[instructionIndex]?.time}
							/>
						</div>
						<div className="my-5">
							<Instruction
								isRunning={isRunning}
								instructionIndex={instructionIndex}
								instructions={instructions}
								performedPose={performedPose}
								data={data}
							/>
						</div>
						<div className="flex justify-center items-center">
							<div
								id="poseResult"
								className="text-2xl font-semibold text-white flex items-center"
							>
								{poseResult === "Success" && (
									<FaCheckCircle className="text-green-500 mr-2" />
								)}
								{poseResult === "Failure" && (
									<FaTimesCircle className="text-red-500 mr-2" />
								)}
								{hasSpoken && (
									<div className="countdown-circle">{countdown}</div>
								)}
							</div>
						</div>
						<div className="flex-grow flex justify-right items-center ">
							<Fencer_Canvas
								videoSource={videoSource}
								isRecording={isRecording}
								setPose={setPose}
							/>
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
		</InstructionContext.Provider>
	);
}
