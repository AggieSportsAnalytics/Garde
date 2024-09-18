"use client";

import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import Stream_Vid from "../../components/Stream_Vid";
import Link from "next/link";
import Timer from "../../components/Timer";
// import { UserButton } from "@clerk/nextjs";
import Fencer_Canvas from "../../components/Fencer_Canvas";
import Fencer_Stats from "../../components/Fencer_Stats";
import Instruction from "../../components/Instruction";
import { useSpeechSynthesis } from "react-speech-kit";
import {
	calculateAngle,
	displayFeetDistance,
	calculateSpeed,
} from "../../components/Fencer_Canvas";
import { FaCheckCircle, FaTimesCircle, FaSun, FaMoon } from "react-icons/fa";
import HeightInputModal from "../../components/HeightInputModal";
// import { getFencerInstructions } from "../../../prisma/fencer_instructions";
import InstructionContext from "../../components/InstructionContext";
import PropTypes from "prop-types";
import {
	CardBody,
	CardContainer,
	CardItem,
} from "../../components/ui/3d-card.tsx";

const MemoizedFencerStats = memo(Fencer_Stats);
const MemoizedInstruction = memo(Instruction);
const MemoizedTimer = memo(Timer);

class FencingStateMachine {
	constructor() {
		this.currentState = "onGuard";
		this.states = {
			onGuard: {
				check: this.checkOnGuard,
				transitions: {
					advance: "advancing",
					retreat: "retreating",
					lunge: "lunging",
				},
			},
			advancing: {
				check: this.checkAdvance,
				transitions: {
					onGuard: "onGuard",
					lunge: "lunging",
				},
			},
			retreating: {
				check: this.checkRetreat,
				transitions: {
					onGuard: "onGuard",
				},
			},
			lunging: {
				check: this.checkLunge,
				transitions: {
					onGuard: "onGuard",
				},
			},
		};
		this.stateChangeDelay = 500; // Adjust the delay as needed (in milliseconds)
		this.lastStateChangeTime = 0;
	}

	transition(newState) {
		const currentTime = Date.now();
		if (currentTime - this.lastStateChangeTime >= this.stateChangeDelay) {
			if (this.states[this.currentState].transitions[newState]) {
				this.currentState =
					this.states[this.currentState].transitions[newState];
				this.lastStateChangeTime = currentTime;
			}
		}
	}

	getCurrentState() {
		return this.currentState;
	}

	checkCurrentState(pose, feetDistance, shoulderWidth, predictedPose) {
		const currentState = this.getCurrentState();
		let result;

		switch (currentState) {
			case "onGuard":
				result = this.checkOnGuard(pose, feetDistance, shoulderWidth);
				break;
			case "advancing":
				result = this.checkAdvance(pose, feetDistance, shoulderWidth);
				break;
			case "retreating":
				result = this.checkRetreat(pose, feetDistance, shoulderWidth);
				break;
			case "lunging":
				result = this.checkLunge(pose, feetDistance, shoulderWidth);
				break;
			default:
				result = { success: false, feedback: "", nextState: currentState };
		}

		if (result.success) {
			this.transition(result.nextState);
		} else if (predictedPose && predictedPose !== currentState) {
			this.transition(predictedPose);
		}

		return result;
	}

	checkOnGuard(pose, feetDistance, shoulderWidth) {
		const feedback = [];
		const rightKneeAngle = calculateAngle(
			pose.keypoints[24],
			pose.keypoints[26],
			pose.keypoints[28],
		);
		const leftKneeAngle = calculateAngle(
			pose.keypoints[23],
			pose.keypoints[25],
			pose.keypoints[27],
		);
		const swordArmAngle = calculateAngle(
			pose.keypoints[11],
			pose.keypoints[13],
			pose.keypoints[15],
		);
		const rightHeelY = pose.keypoints[32].y;
		const rightFootY = pose.keypoints[30].y; // Using the right foot (point 30) as a reference

		if (rightKneeAngle < 100) {
			feedback.push("Bend your right knee more.");
		}

		if (leftKneeAngle < 100 || leftKneeAngle > 200) {
			feedback.push("Straighten your left leg more.");
		}

		if (feetDistance < shoulderWidth) {
			feedback.push("Widen your stance to shoulder distance.");
		} else if (feetDistance > shoulderWidth) {
			feedback.push("Narrow your stance to shoulder distance.");
		}

		if (swordArmAngle < 140) {
			feedback.push("Extend your sword arm more.");
		}

		// Check if the right heel is off the ground
		const heelThreshold = 1; // Adjust this value based on your preference
		if (rightHeelY - rightFootY < heelThreshold) {
			feedback.push("Keep your right heel off the ground.");
		}

		// Add more checks for balance, arm positioning, etc.
		const hipY = (pose.keypoints[23].y + pose.keypoints[24].y) / 2; // Average hip height
		const shoulderY = (pose.keypoints[11].y + pose.keypoints[12].y) / 2; // Average shoulder height

		// Check for balance
		if (Math.abs(hipY - shoulderY) > 30) {
			feedback.push("Maintain your balance while in the on-guard position.");
		}

		if (feedback.length === 0) {
			feedback.push(
				"Excellent on-guard position! Maintain your balance and stay ready to react.",
			);
		}

		return {
			success:
				feedback.length === 1 &&
				feedback[0].startsWith("Excellent on-guard position"),
			feedback: feedback.join(" "),
			nextState: "onGuard",
		};
	}

	checkAdvance(pose, feetDistance, shoulderWidth) {
		const feedback = [];
		const rightKneeAngle = calculateAngle(
			pose.keypoints[24],
			pose.keypoints[26],
			pose.keypoints[28],
		);
		const leftKneeAngle = calculateAngle(
			pose.keypoints[23],
			pose.keypoints[25],
			pose.keypoints[27],
		);
		const frontFootY = pose.keypoints[31].y;
		const backFootY = pose.keypoints[32].y;
		const frontFootAnkleY = pose.keypoints[27].y;
		const backFootAnkleY = pose.keypoints[28].y;

		// Check knee angles
		if (rightKneeAngle > 160 || leftKneeAngle > 160) {
			feedback.push("Keep both knees slightly bent during the advance.");
		}

		// Check foot positioning
		if (Math.abs(frontFootY - backFootY) > 50) {
			feedback.push(
				"Ensure your feet are at the same level after completing the advance.",
			);
		}

		// Check feet distance consistency
		const idealDistance = shoulderWidth * 1.5;
		const tolerance = shoulderWidth * 0.3;
		if (Math.abs(feetDistance - idealDistance) > tolerance) {
			feedback.push(
				"Maintain a consistent distance between your feet, about 1.5 times your shoulder width.",
			);
		}

		if (Math.abs(hipY - shoulderY) > 30) {
			feedback.push(
				"Keep your upper body upright and balanced during the advance.",
			);
		}

		// Check heel landing and foot flatness
		if (frontFootAnkleY < frontFootY) {
			feedback.push(
				"Land on your front heel first, then place the foot flat on the ground.",
			);
		}
		if (backFootAnkleY < backFootY) {
			feedback.push("Set your back foot down flat after bringing it forward.");
		}

		// Check feet alignment
		const frontFootX = pose.keypoints[31].x;
		const backFootX = pose.keypoints[32].x;
		if (Math.abs(frontFootX - backFootX) > 50) {
			feedback.push(
				"Maintain a right-angle alignment between your feet during the advance.",
			);
		}

		if (feedback.length === 0) {
			feedback.push(
				"Excellent advance! Your movement is smooth and controlled. Remember to maintain your balance and consistency.",
			);
		}

		return {
			success:
				feedback.length === 1 && feedback[0].startsWith("Excellent advance"),
			feedback: feedback.join(" "),
			nextState: "onGuard",
		};
	}

	checkRetreat(pose, feetDistance, shoulderWidth) {
		const feedback = [];
		const backKneeAngle = calculateAngle(
			pose.keypoints[24],
			pose.keypoints[26],
			pose.keypoints[28],
		);
		const frontLegAngle = calculateAngle(
			pose.keypoints[23],
			pose.keypoints[25],
			pose.keypoints[27],
		);

		if (backKneeAngle < 110 || backKneeAngle > 170) {
			feedback.push("Bend your back knee slightly more.");
		}

		if (frontLegAngle <= 110) {
			feedback.push("Keep your front leg straighter.");
		}

		if (Math.abs(pose.keypoints[23].y - pose.keypoints[24].y) >= 40) {
			feedback.push("Keep your torso upright.");
		}

		// Check for foot movement
		const frontFootY = pose.keypoints[31].y;
		const backFootY = pose.keypoints[32].y;
		if (frontFootY < backFootY) {
			feedback.push(
				"Ensure your front foot is pushing off properly during the retreat.",
			);
		}

		// Check for balance
		const hipY = (pose.keypoints[23].y + pose.keypoints[24].y) / 2;
		const shoulderY = (pose.keypoints[11].y + pose.keypoints[12].y) / 2;
		if (Math.abs(hipY - shoulderY) > 30) {
			feedback.push(
				"Maintain your balance and keep your torso upright while retreating.",
			);
		}

		if (feedback.length === 0) {
			feedback.push("Good retreat movement.");
		}

		return {
			success:
				feedback.length === 1 && feedback[0] === "Good retreat movement.",
			feedback: feedback.join(" "),
			nextState: "onGuard",
		};
	}

	checkLunge(pose, feetDistance, shoulderWidth) {
		const feedback = [];
		const frontKneeAngle = calculateAngle(
			pose.keypoints[23],
			pose.keypoints[25],
			pose.keypoints[27],
		);
		const backLegAngle = calculateAngle(
			pose.keypoints[24],
			pose.keypoints[26],
			pose.keypoints[28],
		);
		const torsoUpright =
			Math.abs(pose.keypoints[23].y - pose.keypoints[24].y) < 20;
		const swordArmAngle = calculateAngle(
			pose.keypoints[11],
			pose.keypoints[13],
			pose.keypoints[15],
		);
		const nonSwordArmAngle = calculateAngle(
			pose.keypoints[12],
			pose.keypoints[14],
			pose.keypoints[16],
		);

		if (frontKneeAngle <= 110) {
			feedback.push("Bend your front knee more to achieve better form.");
		} else if (frontKneeAngle > 140) {
			feedback.push("Avoid overextending your front knee.");
		}

		if (backLegAngle <= 150) {
			feedback.push("Straighten your back leg for better stability.");
		}

		if (!torsoUpright) {
			feedback.push("Keep your torso upright for better balance.");
		}

		if (swordArmAngle <= 150) {
			feedback.push("Extend your sword arm further.");
		}

		if (nonSwordArmAngle <= 150) {
			feedback.push("Raise your non-sword arm for better counterbalance.");
		}

		// Check for foot placement
		const frontFootY = pose.keypoints[30].y; // Assuming point 30 is the front foot
		const backFootY = pose.keypoints[32].y; // Assuming point 32 is the back foot
		if (frontFootY < backFootY) {
			feedback.push(
				"Ensure your front foot is firmly planted and your back leg is extended during the lunge.",
			);
		}

		// Check for arm extension
		if (swordArmAngle <= 150) {
			feedback.push(
				"Fully extend your sword arm and maintain a straight line from your shoulder to your sword tip.",
			);
		}

		if (feedback.length === 0) {
			feedback.push("Excellent lunge posture!");
		}

		return {
			success:
				feedback.length === 1 && feedback[0] === "Excellent lunge posture!",
			feedback: feedback.join(" "),
			nextState: "onGuard",
		};
	}
}

const fencingStateMachine = new FencingStateMachine();

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
	const [feedbackEnabled, setFeedbackEnabled] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [feetDistance, setFeetDistance] = useState(null);
	const [shoulderWidth, setShoulderWidth] = useState(null);
	const previousInstructionIndex = useRef(-1);
	const previousFeedback = useRef({ message: "", timestamp: 0 });
	const [previousPose, setPreviousPose] = useState(null);
	const [isTimerRunning, setIsTimerRunning] = useState(false);
	const [lastSpokenFeedbackTime, setLastSpokenFeedbackTime] = useState(0);
	const spokenFeedbackCooldown = 5000; // Increased cooldown to 5 seconds
	const [darkMode, setDarkMode] = useState(false);
	const feedbackHistory = useRef([]);
	const heelCountRef = useRef(0);
	const [lastFeedbackTime, setLastFeedbackTime] = useState(0);
	const [isFeedbackBeingDelivered, setIsFeedbackBeingDelivered] =
		useState(false);
	const feedbackDelay = 10000; // 10 seconds delay

	useEffect(() => {
		const userAgent =
			typeof window.navigator === "undefined" ? "" : navigator.userAgent;
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
		setCountdown(
			instructions[instructionIndex]
				? instructions[instructionIndex + 1]?.time
				: 3,
		);
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

	const convertPixelsToMeters = (
		pixels,
		fencerHeightMeters,
		fencerHeightPixels,
	) => {
		if (!fencerHeightMeters || !fencerHeightPixels) return null;
		const pixelToMeterRatio = fencerHeightMeters / fencerHeightPixels;
		return pixels * pixelToMeterRatio;
	};

	const checkPoseAndProvideFeedback = (pose, feetDistance, shoulderWidth) => {
		const result = fencingStateMachine.checkCurrentState(
			pose,
			feetDistance,
			shoulderWidth,
		);
		const { success, feedback } = result;

		if (!success) {
			const criticalFeedback = feedback.split(".")[0] + "."; // Extract the first sentence as critical feedback
			return criticalFeedback;
		}

		return "";
	};

	const checkAngles = useCallback(
		(pose) => {
			if (!feedbackEnabled || !isTimerRunning) {
				return;
			}

			const currentTime = Date.now();
			const elapsedTime = currentTime - lastFeedbackTime;

			if (elapsedTime >= feedbackDelay && !isFeedbackBeingDelivered) {
				const feedbackMessage = checkPoseAndProvideFeedback(
					pose,
					feetDistance,
					shoulderWidth,
				);

				// Simplify and shorten the feedback message
				const simplifiedFeedback = simplifyFeedback(feedbackMessage);

				if (
					simplifiedFeedback &&
					!feedbackHistory.current.includes(simplifiedFeedback)
				) {
					setIsFeedbackBeingDelivered(true);
					setFeedback([simplifiedFeedback]);
					speak({
						text: simplifiedFeedback,
						voice: voice,
						rate: 1.2,
						pitch: 1.1,
						lang: "en-US",
						onend: () => {
							setIsFeedbackBeingDelivered(false);
							setLastFeedbackTime(Date.now());
							feedbackHistory.current = [
								...feedbackHistory.current,
								simplifiedFeedback,
							];
						},
					});
				}
			}
		},
		[
			feedbackEnabled,
			isTimerRunning,
			lastFeedbackTime,
			isFeedbackBeingDelivered,
			feetDistance,
			shoulderWidth,
			speak,
			voice,
		],
	);

	// Function to simplify and shorten feedback messages
	const simplifyFeedback = (feedback) => {
		return feedback.split(".")[0] + ".";
	};

	const checkPoseDuration = useCallback(
		(predictedPose) => {
			if (!feedbackEnabled || !isTimerRunning) return;

			const currentInstruction = instructions[instructionIndex]?.name
				.toLowerCase()
				.replace(/\s+/g, "");
			if (
				predictedPose &&
				currentInstruction &&
				predictedPose === currentInstruction
			) {
				if (!poseStartTime) {
					setPoseStartTime(Date.now());
				} else {
					const elapsedTime = Date.now() - poseStartTime;
					setCountdown(
						(instructions[instructionIndex]?.time || 3) -
							Math.floor(elapsedTime / 1000),
					);
					if (
						elapsedTime >=
						(instructions[instructionIndex]?.time || 3) * 1000
					) {
						setPoseResult("Success");
						speak({
							text: "Success",
							voice: voice,
							rate: 1.2,
							pitch: 1.1,
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
							rate: 1.2,
							pitch: 1.1,
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
			feedbackEnabled,
			isTimerRunning,
		],
	);

	useEffect(() => {
		if (pose) {
			const { predictedPose, feetDistance } = displayFeetDistance(
				pose.keypoints,
			);

			// Only start checking angles after 10 seconds
			const movementDuration = Date.now() - poseStartTime;
			if (movementDuration >= 10000) {
				checkPoseDuration(predictedPose);
				checkAngles(pose);
			}

			const distanceInMeters = convertPixelsToMeters(
				feetDistance,
				height,
				feetDistance,
			);
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

	useEffect(() => {
		if (!isTimerRunning) {
			setFeedback([]);
			previousFeedback.current = { message: "", timestamp: 0 };
		}
	}, [isTimerRunning]);

	useEffect(() => {
		const userPrefersDark =
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches;
		setDarkMode(userPrefersDark);
	}, []);

	const toggleDarkMode = () => {
		setDarkMode((prevMode) => !prevMode);
	};

	return (
		<InstructionContext.Provider value={{ instructions, setInstructions }}>
			{isMobile ? (
				<div
					className={`flex flex-col items-center justify-center h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"} p-4`}
				>
					<p className="text-center text-xl mb-4">
						For a better viewing experience, please visit this website on a
						computer.
					</p>
					<Link href="/">
						<button
							className={`${darkMode ? "bg-white text-black" : "bg-black text-white"} py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300`}
						>
							Go Back
						</button>
					</Link>
				</div>
			) : (
				<div
					className={`flex flex-col h-screen font-sans ${darkMode ? "bg-black text-white" : "bg-white text-black"} overflow-hidden`}
				>
					<header
						className={`flex items-center justify-between p-4 ${darkMode ? "bg-gray-900 border-b border-gray-800" : "bg-gray-100 border-b border-gray-300"} z-10`}
					>
						<Link href="/api/auth/signout?callbackUrl=/">
							<button
								className={`${darkMode ? "bg-white text-black" : "bg-black text-white"} py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300`}
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
						<div className="flex items-center space-x-4">
							<button
								className={`${darkMode ? "bg-white text-black" : "bg-black text-white"} p-2 rounded-full text-lg font-semibold hover:bg-gray-300`}
								onClick={toggleDarkMode}
								aria-label={
									darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
								}
							>
								{darkMode ? <FaSun /> : <FaMoon />}
							</button>
							{/* <UserButton /> */}
						</div>
					</header>

					<main
						className="flex flex-grow relative "
						style={{ perspective: "1000px" }}
					>
						<div
							className="w-1/8 absolute left-0 top-0 bottom-0"
							style={{
								transform: "rotateY(15deg)",
								transformOrigin: "left center",
								height: "100%",
								scale: "65%",
								top: "-60px",
							}}
						>
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
								/>
							</div>
						</div>

						<div
							className="flex-1 flex flex-col items-center justify-center px-2.8 space-y-4 z-10"
							style={{ transform: "scale(0.7)", marginTop: "-150px" }}
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
									onRunningChange={setIsTimerRunning}
									darkMode={darkMode}
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
									darkMode={darkMode}
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
							{/* <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">Feedback</h3>
                <ul className="list-disc pl-5">
                  {feedback.map((item, index) => (
                    <li key={index} className="text-white">{item}</li>
                  ))}
                </ul>
              </div> */}
						</div>

						<div
							className="absolute left-[1070px] top-[10%]"
							style={{
								transform: "rotateY(-20deg)",
								transformOrigin: "left center",
							}}
						>
							<CardContainer className="inter-var w-96 h-[24rem]">
								<CardBody
									className={`[transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d] relative group/card ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} h-full rounded-xl p-4 space-y-4 border ${darkMode ? "border-gray-700" : "border-gray-300"}`}
								>
									<CardItem
										translateZ="50"
										className="text-m font-bold mb-4 w-full text-left"
									>
										AI Feedback
									</CardItem>
									<div
										className="rounded p-4 border shadow-lg w-[85%] h-[calc(100%-4rem)] overflow-y-auto"
										style={{ wordWrap: "break-word" }}
									>
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

						<div
							className={`absolute top-0 left-0 p-4 ${darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"} rounded`}
						>
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
