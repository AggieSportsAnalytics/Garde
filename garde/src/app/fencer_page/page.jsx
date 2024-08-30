"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import Stream_Vid from "../../components/Stream_Vid";
import Link from "next/link";
import Timer from "../../components/Timer";
import { UserButton } from "@clerk/nextjs";
import Fencer_Canvas from "../../components/Fencer_Canvas";
import Fencer_Stats from "../../components/Fencer_Stats";
import Instruction from "../../components/Instruction";
import { useSpeechSynthesis } from "react-speech-kit";
import { displayFeetDistance } from "../../components/Fencer_Canvas";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import HeightInputModal from "../../components/HeightInputModal";
// import { getFencerInstructions } from '../../../prisma/fencer_instructions';
import InstructionContext from "../../components/InstructionContext";
import PropTypes from "prop-types";
import { calculateAngle } from "../../components/Fencer_Canvas";
import {
	CardBody,
	CardContainer,
	CardItem,
} from "../../components/ui/3d-card.tsx";

const MemoizedFencerStats = memo(Fencer_Stats);
const MemoizedInstruction = memo(Instruction);
const MemoizedTimer = memo(Timer);

export default function Fencer_Page2() {
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
	const [videoInput, setVideoInput] = useState(false);
	const [feedback, setFeedback] = useState([]);

	useEffect(() => {
		if (voices.length > 0 && !voice) {
			setVoice(voices[18]);
		}
	}, [voices, voice]);

	const handleHeightSave = useCallback((heightInMeters) => {
		setHeight(heightInMeters);
		setIsHeightModalOpen(false);
	}, []);

	const convertPixelsToMeters = useCallback(
		(pixels) => {
			if (!height) return null;
			const pixelToMeterRatio = height / 100;
			return pixels * pixelToMeterRatio;
		},
		[height],
	);

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
		setCountdown(
			instructions[instructionIndex]
				? instructions[instructionIndex + 1]?.time
				: 3,
		);
		setIsRunning(true);
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
	}, [failureTimeout]);

	const handleVideoChange = useCallback(
		(newVideoSource) => {
			setVideoSource(newVideoSource);
			setVideoInput(true);
			if (!height) setIsHeightModalOpen(true);
		},
		[height],
	);

	const toggleRecording = useCallback(() => {
		if (!height) {
			setIsHeightModalOpen(true);
		}
		setIsRecording((prev) => !prev);
		setIsRunning((prev) => !prev);
	}, [height]);

	const checkPoseDuration = useCallback(
		(predictedPose) => {
			const currentInstruction = instructions[instructionIndex];
			const instructionToPose = {
				"Perform an en guarde...": "en guarde",
				"Perform an advance...": "advance",
				"Perform a lunge...": "lunge",
			};
			const expectedPose = instructionToPose[currentInstruction?.name];
			setPerformedPose(predictedPose);

			if (predictedPose && expectedPose && predictedPose === expectedPose) {
				if (!poseStartTime) {
					setPoseStartTime(Date.now());
				} else {
					const elapsedTime = Date.now() - poseStartTime;
					setCountdown(
						(currentInstruction?.time || 3) - Math.floor(elapsedTime / 1000),
					);
					if (elapsedTime >= (currentInstruction?.time || 3) * 1000) {
						setPoseResult("Success");
						speak({
							text: "Success",
							voice: voice,
							rate: 1,
							pitch: 1,
							lang: "en-US",
						});
						setPoseStartTime(null);
						setTimeout(handleTimerStart, 3000);
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
		},
		[
			instructions,
			instructionIndex,
			poseStartTime,
			poseResult,
			speak,
			voice,
			handleTimerStart,
			failureTimeout,
		],
	);

	const checkAngles = useCallback(
		(pose) => {
			const feedbackMessages = [];
			const leftKneeAngle = calculateAngle(
				pose.keypoints[23],
				pose.keypoints[25],
				pose.keypoints[27],
			);
			const rightKneeAngle = calculateAngle(
				pose.keypoints[24],
				pose.keypoints[26],
				pose.keypoints[28],
			);
			const leftElbowAngle = calculateAngle(
				pose.keypoints[11],
				pose.keypoints[13],
				pose.keypoints[15],
			);
			const rightElbowAngle = calculateAngle(
				pose.keypoints[12],
				pose.keypoints[14],
				pose.keypoints[16],
			);

			if (leftKneeAngle < 160 || rightKneeAngle < 160) {
				feedbackMessages.push("Bend your knees");
			}
			if (Math.abs(pose.keypoints[15].x - pose.keypoints[16].x) > 50) {
				feedbackMessages.push("Feet lined up");
			}
			if (Math.abs(pose.keypoints[27].x - pose.keypoints[29].x) > 50) {
				feedbackMessages.push("Front knee and toe forward");
			}
			if (leftElbowAngle < 90 || rightElbowAngle < 90) {
				feedbackMessages.push("Hands in position");
			}

			setFeedback(feedbackMessages);
			if (feedbackMessages.length > 0) {
				speak({
					text: feedbackMessages.join(", "),
					voice: voice,
					rate: 1,
					pitch: 1,
					lang: "en-US",
				});
			}
		},
		[speak, voice],
	);

	useEffect(() => {
		if (pose) {
			const { predictedPose, feetDistance } = displayFeetDistance(
				pose.keypoints,
			);
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
		if (
			instructionIndex >= 0 &&
			instructionIndex < instructions.length &&
			!hasSpoken &&
			!isInstructionBeingSaid
		) {
			setHasSpoken(true);
			setIsInstructionBeingSaid(true);
			speak({
				text: `${instructions[instructionIndex].name} Starting in 3, 2, 1`,
				voice: voice,
				rate: 1,
				pitch: 1,
				lang: "en-US",
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
	}, [
		instructionIndex,
		voice,
		speak,
		hasSpoken,
		instructions,
		isInstructionBeingSaid,
		startPreInstructionCountdown,
	]);

	return (
		<InstructionContext.Provider value={{ instructions, setInstructions }}>
			<div className="flex flex-col h-screen font-sans bg-black text-white overflow-hidden">
				<header className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 z-10">
					<Link href="/">
						<button
							className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300"
							aria-label="Go back"
						>
							&#8592;
						</button>
					</Link>
					<div className="flex-grow flex justify-center">
						<Stream_Vid
							onVideoChange={handleVideoChange}
							isRecording={isRecording}
							toggleRecording={toggleRecording}
							videoSource={videoSource}
						/>
					</div>
					<UserButton />
				</header>

				<main
					className="flex flex-grow relative"
					style={{ perspective: "1000px" }}
				>
					<div
						className="w-1/8 absolute left-0 top-0 bottom-0 shadow-2xl"
						style={{
							transform: "rotateY(15deg)",
							transformOrigin: "left center",
							height: "100%",
							scale: "60%",
							top: "0px",
						}}
					>
						<div className="h-full p-6 overflow-auto hide-scrollbar">
							<MemoizedFencerStats
								pose={pose}
								lastCalled={lastCalled}
								setLastCalled={setLastCalled}
								setAiFeedback={setAiResult}
								height={height}
							/>
						</div>
					</div>

					<div
						className="flex-1 flex flex-col items-center justify-center px-2.8 space-y-4 z-10"
						style={{ transform: "scale(0.7)", marginTop: "-100px" }}
					>
						<div className="w-2/3 mt-10">
							<MemoizedInstruction
								isRunning={isRunning}
								instructionIndex={instructionIndex}
								instructions={instructions}
								performedPose={performedPose}
							/>
							<div style={{ marginBottom: "20px" }}></div>{" "}
							{/* Added space between the Timer and Instruction */}
							<MemoizedTimer
								onTimerStart={handleTimerStart}
								onReset={handleReset}
								isStartDisabled={isStartDisabled}
								resetTimer={resetTimer}
								data={instructions}
								instructionIndex={instructionIndex}
								initialTime={instructions[instructionIndex]?.time}
							/>
						</div>

						{/* Fencer Canvas Component */}
						<div
							className="w-2/3 aspect-video bg-black flex items-center justify-center rounded-lg relative border border-gray-600"
							style={{ marginTop: "50px" }}
						>
							<Fencer_Canvas
								videoSource={videoSource}
								isRecording={isRecording}
								setPose={setPose}
								containerWidth="100%"
								containerHeight="100%"
							/>
						</div>

						<div className="flex justify-center items-center">
							<div
								id="poseResult"
								className="text-2xl font-semibold text-white flex items-center"
							>
								{poseResult === "Success" && (
									<FaCheckCircle className="text-green-400 mr-2" />
								)}
								{poseResult === "Failure" && (
									<FaTimesCircle className="text-red-400 mr-2" />
								)}
								{hasSpoken && (
									<div className="countdown-circle">{countdown}</div>
								)}
							</div>
						</div>
					</div>
					<CardContainer
						className="w-[700px] h-[400px] absolute right-[-100px] top-[25%] shadow-2xl"
						style={{
							transform: "rotateY(-40deg) rotateX(5deg)",
							transformOrigin: "right center",
							scale: "100%",
						}}
					>
						<div className="h-full p-6 overflow-auto hide-scrollbar">
							<CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-8 space-y-4 border">
								<CardItem
									translateZ="50"
									className="text-xl font-bold text-neutral-600 dark:text-white mb-4"
								>
									AI Feedback
								</CardItem>
								<div className="grid grid-rows-1 grid-cols-1 gap-4">
									<CardItem
										translateZ="60"
										className="rounded p-4 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg w-auto text-white"
									>
										{(aiResult ? aiResult.split("\n") : []).map((item, key) => (
											<span key={key}>
												{item}
												<br />
											</span>
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
		</InstructionContext.Provider>
	);
}

Fencer_Page2.propTypes = {};
