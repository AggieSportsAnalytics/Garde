"use client";

import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import "@tensorflow/tfjs-backend-webgl";
import Stream_Vid from "../../components/fencer_page/Stream_Vid";
import Link from "next/link";
import Timer from "../../components/fencer_page/Timer";
import dynamic from "next/dynamic";
import Instruction from "../../components/fencer_page/Instruction";
import { useSpeechSynthesis } from "react-speech-kit";
import { FaSun, FaMoon, FaVolumeMute, FaVolumeUp, FaCog } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import HeightInputModal from "../../components/fencer_page/HeightInputModal";
import InstructionContext from "../../components/fencer_page/InstructionContext";
import {
	CardBody,
	CardContainer,
	CardItem,
} from "../../components/ui/3d-card.tsx";
import DeleteAccountButton from "../../components/auth/DeleteAccount";
import AddFencer from "../../components/fencer_page/AddFencer";
import Logout from "../../components/auth/Logout.jsx";
import Modal from "react-modal";
import HeightInput from "../../components/fencer_page/HeightChange";
const Fencer_Canvas = dynamic(
	() => import("../../components/fencer_page/Fencer_Canvas"),
	{ ssr: false },
);
const Fencer_Stats = dynamic(
	() => import("../../components/fencer_page/Fencer_Stats"),
	{ ssr: false },
);
import { useRouter } from "next/navigation";
import axios from "axios";
import Chatbot from "../../components/fencer_page/Chatbot";
import checkAuth from "../hooks/jwt_verify";

const MemoizedFencerStats = memo(Fencer_Stats);
const MemoizedInstruction = memo(Instruction);
const MemoizedTimer = memo(Timer);

export default function Fencer_Page2() {
	const [videoSource, setVideoSource] = useState("");
	const [isRecording, setIsRecording] = useState(false);
	const [pose, setPose] = useState(null);
	const [instructionIndex, setInstructionIndex] = useState(-1);
	const [isStartDisabled, setIsStartDisabled] = useState(false);
	const [hasSpoken, setHasSpoken] = useState(false);
	const [poseResult, setPoseResult] = useState("");
	const [countdown, setCountdown] = useState(3);
	const [hasStarted, setHasStarted] = useState(false);
	const [resetTimer, setResetTimer] = useState(false);
	const [countdownFinished, setCountdownFinished] = useState(false);
	const [preInstructionCountdown, setPreInstructionCountdown] = useState(3);
	const [showPreInstructionCountdown, setShowPreInstructionCountdown] =
		useState(false);
	const [isInstructionBeingSaid, setIsInstructionBeingSaid] = useState(false);
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
	const [darkMode, setDarkMode] = useState(false);
	const feedbackHistory = useRef([]);
	const heelCountRef = useRef(0);
	const [lastFeedbackTime, setLastFeedbackTime] = useState(0);
	const [isFeedbackBeingDelivered, setIsFeedbackBeingDelivered] =
		useState(false);
	const feedbackDelay = 10000; // 10 seconds delay
	const [poseData, setPoseData] = useState(null);
	const poseDataIntervalRef = useRef(null);
	const feedbackBuffer = useRef([]);
	const [lastSpokenFeedbackTime, setLastSpokenFeedbackTime] = useState(0);
	const [lastFeedbackMessage, setLastFeedbackMessage] = useState("");
	const [isFeedbackMuted, setIsFeedbackMuted] = useState(false);
	const [isRoutineStarted, setIsRoutineStarted] = useState(false);
	const [fencerId, setFencerId] = useState("");
	const [decoded, setDecoded] = useState({});
	const [videoId, setVideoId] = useState("");
	const [uploadAngles, setUploadAngles] = useState(false);
	const [coaches, setCoaches] = useState([]);
	const [currentCoach, setCurrentCoach] = useState({});
	const router = useRouter();

	const [sumAngles, setSumAngles] = useState({
		advance: {
			leftElbAngle: 0,
			rightElbAngle: 0,
			leftHipAngle: 0,
			rightHipAngle: 0,
			leftKneeAngle: 0,
			rightKneeAngle: 0,
			feet_distance: 0,
			speed: 0,
		},
		retreat: {
			leftElbAngle: 0,
			rightElbAngle: 0,
			leftHipAngle: 0,
			rightHipAngle: 0,
			leftKneeAngle: 0,
			rightKneeAngle: 0,
			feet_distance: 0,
			speed: 0,
		},
		onguard: {
			leftElbAngle: 0,
			rightElbAngle: 0,
			leftHipAngle: 0,
			rightHipAngle: 0,
			leftKneeAngle: 0,
			rightKneeAngle: 0,
			feet_distance: 0,
			speed: 0,
		},
		lunge: {
			leftElbAngle: 0,
			rightElbAngle: 0,
			leftHipAngle: 0,
			rightHipAngle: 0,
			leftKneeAngle: 0,
			rightKneeAngle: 0,
			feet_distance: 0,
			speed: 0,
		},
	});
	const [countAngles, setCountAngles] = useState(0);

	const showModal = () => {
		setIsModalVisible(!isModalVisible);
	};
	const handleCancel = () => {
		setIsModalVisible(false);
	};

	const [isModalVisible, setIsModalVisible] = useState(false);

	useEffect(() => {
		if (isRecording || !uploadAngles) {
			return;
		}

		const putUserAngles = async (body, id, videoId, pose) => {
			const putWorkerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/putUserAngles/${id}/${videoId}/${pose}`;

			try {
				const response = await axios.put(putWorkerUrl, body, {
					withCredentials: true,
					headers: { "Content-Type": "application/json" },
				});

				return true;
			} catch (error) {
				console.error(error);
				return false;
			}
		};

		const parseAngle = (angle) => {
			if (angle < 90) {
				return "very bent";
			}
			if (angle < 145) {
				return "slightly bent";
			}
			if (angle < 160) {
				return "mostly straight";
			}
			return "straight";
		};

		const avgAngles = {};

		for (const pose of Object.keys(sumAngles)) {
			let nonContinueCount = 0;

			if (!avgAngles[pose]) {
				avgAngles[pose] = {};
			}

			for (const angle of Object.keys(sumAngles[pose])) {
				if (Number.isNaN(sumAngles[pose][angle]) || !sumAngles[pose][angle]) {
					continue;
				}
				nonContinueCount++;
				const avgAngle = sumAngles[pose][angle] / countAngles;
				avgAngles[pose][angle] = avgAngle;
			}
			if (nonContinueCount > 0) {
				putUserAngles(avgAngles[pose], fencerId, videoId, pose);
			}
		}

		setSumAngles({
			advance: {
				leftElbAngle: 0,
				rightElbAngle: 0,
				leftHipAngle: 0,
				rightHipAngle: 0,
				leftKneeAngle: 0,
				rightKneeAngle: 0,
				feet_distance: 0,
				speed: 0,
			},
			retreat: {
				leftElbAngle: 0,
				rightElbAngle: 0,
				leftHipAngle: 0,
				rightHipAngle: 0,
				leftKneeAngle: 0,
				rightKneeAngle: 0,
				feet_distance: 0,
				speed: 0,
			},
			onguard: {
				leftElbAngle: 0,
				rightElbAngle: 0,
				leftHipAngle: 0,
				rightHipAngle: 0,
				leftKneeAngle: 0,
				rightKneeAngle: 0,
				feet_distance: 0,
				speed: 0,
			},
			lunge: {
				leftElbAngle: 0,
				rightElbAngle: 0,
				leftHipAngle: 0,
				rightHipAngle: 0,
				leftKneeAngle: 0,
				rightKneeAngle: 0,
				feet_distance: 0,
				speed: 0,
			},
		});
		setCountAngles(0);
		setUploadAngles(false);
	}, [videoId, uploadAngles]);

	useEffect(() => {
		const fetchAuthData = async () => {
			if (typeof window !== "undefined") {
				const userAgent = navigator.userAgent;
				const mobileDevice = /iPhone|iPad|iPod|Android/i.test(userAgent);
				setIsMobile(mobileDevice);
			}

			try {
				const decoded = await checkAuth(router, "signin", "fencer");
				setFencerId(decoded.id);
				setDecoded(decoded);

				const expirationTime = decoded?.exp * 1000 - Date.now();
				const timer = setTimeout(() => {
					alert("Your session has expired. Please log in again.");
					router.push("/signin");
				}, expirationTime);

				const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getAllFC/${decoded.id}`;
				const response = await axios.get(workerUrl, { withCredentials: true });
				setCoaches(response.data.data);

				return () => clearTimeout(timer);
			} catch (error) {
				console.error(error);
				router.push("/signin?restricted=true");
			}
		};

		fetchAuthData();
	}, []);

	useEffect(() => {
		if (voices.length > 0 && !voice) {
			setVoice(voices[18]);
		}
	}, [voices, voice]);

	const handleHeightSave = useCallback((heightInMeters) => {
		setHeight(heightInMeters);
		setIsHeightModalOpen(false);
		setIsRecording((prev) => !prev);
		setIsRunning((prev) => !prev);
	}, []);

	const handleHeightInput = useCallback((heightInMeters) => {
		setHeight(heightInMeters);
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

	const handleInstructionChange = useCallback((newIndex) => {
		setInstructionIndex(newIndex);
	}, []);

	const handleTimerStart = useCallback(() => {
		setHasStarted(true);
		setShowPreInstructionCountdown(false);
		setInstructionIndex(0);
		setPoseResult("");
		setResetTimer(false);
		setIsRunning(true);
		setFeedbackEnabled(true);
		setLastFeedbackTime(Date.now());
		setIsRoutineStarted(true); // Add this line
	}, []);

	const handleReset = useCallback(() => {
		setInstructionIndex(-1);
		setIsStartDisabled(false);
		setHasSpoken(false);
		setPoseResult("");
		setResetTimer(true);
		setPreInstructionCountdown(3);
		setShowPreInstructionCountdown(false);
		setFeedbackEnabled(false);
		setIsRoutineStarted(false); // Add this line
	}, []);

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
		} else {
			setIsRecording((prev) => !prev);
			setIsRunning((prev) => !prev);
		}
	}, [height]);

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

	const toggleDarkMode = () => {
		setDarkMode((prevMode) => !prevMode);
	};

	const handlePoseSequenceDetected = useCallback(
		(poseDataArray) => {
			if (!isRoutineStarted) return; // Add this line to check if routine has started

			const feedbackMessages = {
				advance: [],
				retreat: [],
				lunge: [],
			};

			// Conversion factor from meters to inches
			const metersToInches = 39.37;

			// Aggregate feedback based on average angle data for 10 second intervals
			const intervalDuration = 10;
			const intervalCount = Math.ceil(poseDataArray.length / intervalDuration);

			for (let i = 0; i < intervalCount; i++) {
				const intervalData = poseDataArray.slice(
					i * intervalDuration,
					(i + 1) * intervalDuration,
				);
				const angleSums = {
					advance: {
						leftKnee: 0,
						rightKnee: 0,
						leftElb: 0,
						rightElb: 0,
						count: 0,
					},
					retreat: { leftKnee: 0, rightKnee: 0, count: 0 },
					lunge: {
						leftKnee: 0,
						rightKnee: 0,
						leftElb: 0,
						rightElb: 0,
						count: 0,
					},
				};

				intervalData.forEach(({ poseType, angles }) => {
					const {
						leftKneeAngle,
						rightKneeAngle,
						leftElbAngle,
						rightElbAngle,
						feetDistance,
					} = angles;

					// Convert feetDistance from meters to inches
					const feetDistanceInches = feetDistance * metersToInches;

					if (poseType === "advance") {
						angleSums.advance.leftKnee += leftKneeAngle;
						angleSums.advance.rightKnee += rightKneeAngle;
						angleSums.advance.leftElb += leftElbAngle;
						angleSums.advance.rightElb += rightElbAngle;
						angleSums.advance.count++;

						// Feedback for Advances
						if (feetDistanceInches < 12 || feetDistanceInches > 15) {
							feedbackMessages.advance.push("Fix your feet distance.");
						}
						if (rightElbAngle < 85 || rightElbAngle > 95) {
							feedbackMessages.advance.push(
								"Keep your right elbow more upright.",
							);
						}
						if (leftElbAngle < 40 || leftElbAngle > 50) {
							feedbackMessages.advance.push(
								"Left elbow should be bent at 45 degrees.",
							);
						}
						if (
							leftKneeAngle < 100 ||
							leftKneeAngle > 170 ||
							rightKneeAngle < 100 ||
							rightKneeAngle > 170
						) {
							feedbackMessages.advance.push("Adjust your knees a bit");
						}
					} else if (poseType === "retreat") {
						angleSums.retreat.leftKnee += leftKneeAngle;
						angleSums.retreat.rightKnee += rightKneeAngle;
						angleSums.retreat.count++;

						// Feedback for Retreats
						if (feetDistanceInches < 12 || feetDistanceInches > 15) {
							feedbackMessages.retreat.push(
								"Maintain feet distance between 12 to 15 inches.",
							);
						}
						if (
							leftKneeAngle < 70 ||
							leftKneeAngle > 80 ||
							rightKneeAngle < 70 ||
							rightKneeAngle > 80
						) {
							feedbackMessages.retreat.push(
								"Knees should be bent between 70 to 80 degrees.",
							);
						}
					} else if (poseType === "lunge") {
						angleSums.lunge.leftKnee += leftKneeAngle;
						angleSums.lunge.rightKnee += rightKneeAngle;
						angleSums.lunge.leftElb += leftElbAngle;
						angleSums.lunge.rightElb += rightElbAngle;
						angleSums.lunge.count++;

						// Feedback for Lunges
						if (feetDistanceInches < 20 || feetDistanceInches > 24) {
							feedbackMessages.lunge.push(
								"Front foot should move forward by 20 to 24 inches.",
							);
						}
						if (rightElbAngle < 175 || rightElbAngle > 185) {
							feedbackMessages.lunge.push(
								"Right elbow should be fully extended at 180 degrees.",
							);
						}
						if (leftKneeAngle < 85 || leftKneeAngle > 95) {
							feedbackMessages.lunge.push(
								"Front knee should be bent at 90 degrees.",
							);
						}
						if (rightKneeAngle < 175 || rightKneeAngle > 185) {
							feedbackMessages.lunge.push(
								"Back knee should straighten completely at 180 degrees.",
							);
						}
					}
				});

				const averageAngles = {
					advance: {
						leftKnee: angleSums.advance.count
							? angleSums.advance.leftKnee / angleSums.advance.count
							: 0,
						rightKnee: angleSums.advance.count
							? angleSums.advance.rightKnee / angleSums.advance.count
							: 0,
						leftElb: angleSums.advance.count
							? angleSums.advance.leftElb / angleSums.advance.count
							: 0,
						rightElb: angleSums.advance.count
							? angleSums.advance.rightElb / angleSums.advance.count
							: 0,
					},
					retreat: {
						leftKnee: angleSums.retreat.count
							? angleSums.retreat.leftKnee / angleSums.retreat.count
							: 0,
						rightKnee: angleSums.retreat.count
							? angleSums.retreat.rightKnee / angleSums.retreat.count
							: 0,
					},
					lunge: {
						leftKnee: angleSums.lunge.count
							? angleSums.lunge.leftKnee / angleSums.lunge.count
							: 0,
						rightKnee: angleSums.lunge.count
							? angleSums.lunge.rightKnee / angleSums.lunge.count
							: 0,
						leftElb: angleSums.lunge.count
							? angleSums.lunge.leftElb / angleSums.lunge.count
							: 0,
						rightElb: angleSums.lunge.count
							? angleSums.lunge.rightElb / angleSums.lunge.count
							: 0,
					},
				};

				// Determine the most common feedback for each pose type
				const mostCommonFeedback = (feedbackArray) => {
					if (feedbackArray.length === 0) return "";
					const frequency = {};
					feedbackArray.forEach(
						(msg) => (frequency[msg] = (frequency[msg] || 0) + 1),
					);
					return Object.keys(frequency).reduce((a, b) =>
						frequency[a] > frequency[b] ? a : b,
					);
				};

				const feedbackMessage = [
					mostCommonFeedback(feedbackMessages.advance),
					mostCommonFeedback(feedbackMessages.retreat),
					mostCommonFeedback(feedbackMessages.lunge),
				].filter(Boolean)[0]; // Get the most relevant feedback

				if (feedbackMessage && !isFeedbackMuted) {
					const now = Date.now();
					if (now - lastSpokenFeedbackTime >= 10000) {
						// Ensure at least 10 seconds between feedback
						setFeedback([feedbackMessage]);
						speak({
							text: feedbackMessage,
							voice: voice,
							rate: 1.2,
							pitch: 1.1,
							lang: "en-US",
						});
						setLastSpokenFeedbackTime(now);
					}
				}
			}
		},
		[speak, voice, lastSpokenFeedbackTime, isFeedbackMuted, isRoutineStarted], // Add isRoutineStarted to dependency array
	);

	const toggleFeedbackMute = () => {
		setIsFeedbackMuted((prevState) => !prevState);
	};

	const removeCoach = async () => {
		if (!currentCoach?.coach_id) {
			return;
		}

		try {
			const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/deleteCoachFencer?coachId=${currentCoach?.coach_id}&fencerId=${fencerId}`;
			await axios.delete(workerUrl, { withCredentials: true });

			setCoaches((prevCoaches) =>
				prevCoaches.filter(
					(coach) => coach.coach_id !== currentCoach?.coach_id,
				),
			);
			setCurrentCoach(null);
		} catch (error) {
			console.error(error);
		}
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
						<Link href="/">
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
								fencerId={fencerId}
								setVideoId={setVideoId}
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
							<button
								className={`${darkMode ? "bg-white text-black" : "bg-black text-white"} p-2 rounded-full text-lg font-semibold hover:bg-gray-300`}
								onClick={toggleFeedbackMute}
								aria-label={
									isFeedbackMuted ? "Unmute Feedback" : "Mute Feedback"
								}
							>
								{isFeedbackMuted ? <FaVolumeMute /> : <FaVolumeUp />}
							</button>
						</div>

						<button
							className={`mx-4 w-9 h-9 rounded-full ${darkMode ? "bg-white" : "bg-black"} 
    flex items-center justify-center cursor-pointer hover:bg-gray-300`}
							onClick={showModal}
							type="button"
						>
							<FaCog
								className={`${darkMode ? "text-black" : "text-white"} text-2xl`}
							/>
						</button>

						<Modal
							isOpen={isModalVisible}
							onRequestClose={handleCancel}
							contentLabel="Settings"
							ariaHideApp={false}
							style={{
								content: {
									borderRadius: "20px",
									width: "90%",
									height: "500px",
									maxWidth: "500px",
									maxHeight: "90vh",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									padding: "20px",
									position: "fixed",
									overflowY: "auto",
								},
								overlay: {
									backgroundColor: "rgba(0, 0, 0, 0.5)",
									zIndex: 1000,
								},
							}}
						>
							<div className="flex flex-col items-center space-y-4">
								<button
									type="button"
									className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
									onClick={handleCancel}
								>
									<FiX size={24} />
								</button>
								<h2 className="text-xl font-bold text-gray-800 mb-4">
									Settings
								</h2>

								<div className="w-full flex flex-col items-center space-y-4">
									<AddFencer decoded={decoded} />
									<HeightInput handleHeightSave={handleHeightInput} />
									{height ? (
										<p className="text-gray-700">Current Height: {height}</p>
									) : (
										<p className="text-gray-700">Current Height: Not Set</p>
									)}
								</div>

								<div className="w-full flex flex-col items-center space-y-4">
									<label htmlFor="coach-select" className="sr-only">
										Select Coach
									</label>
									<select
										id="coach-select"
										value={currentCoach?.coach_id || ""}
										onChange={(e) => {
											const selectedCoach = coaches.find(
												(coach) => coach.coach_id === e.target.value,
											);
											setCurrentCoach(selectedCoach);
										}}
										className="px-2 py-1 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
									>
										<option value="" disabled>
											Select a Coach to Remove
										</option>
										{coaches.map((coach) => (
											<option
												className="bg-gray-800 text-white"
												key={coach.coach_id}
												value={coach.coach_id}
											>
												{coach.coach_name}
											</option>
										))}
									</select>

									<div className="relative">
										<button
											onClick={removeCoach}
											className="bg-red-600 px-3 py-2 hover:bg-red-500 text-white font-semibold rounded shadow-md cursor-pointer"
											type="button"
											disabled={!currentCoach}
										>
											Remove Coach
										</button>
									</div>
								</div>

								{/* Bottom Actions */}
								<hr className="border-gray-300 w-full mt-6" />
								<div className="w-full flex justify-around space-x-4 mt-4">
									<Logout />
									<DeleteAccountButton userId={fencerId} type="fencer" />
								</div>
							</div>
						</Modal>
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
							<div
								className="h-[full] flex flex-col justify-center items-center"
								style={{ marginLeft: "50px", marginTop: "40px" }}
							>
								<MemoizedFencerStats
									pose={pose}
									// setAiFeedback={setAiResult}
									height={height}
									setFeetDistance={setFeetDistance}
									setShoulderWidth={setShoulderWidth}
									darkMode={darkMode}
									onPoseSequenceDetected={handlePoseSequenceDetected}
									fencerId={fencerId}
									setCountAngles={setCountAngles}
									setSumAngles={setSumAngles}
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
								/>
								<div style={{ marginBottom: "20px" }}></div>{" "}
								{/* Added space between the Timer and Instruction */}
								<MemoizedTimer
									onTimerStart={handleTimerStart}
									onReset={handleReset}
									isStartDisabled={isStartDisabled}
									resetTimer={resetTimer}
									initialTime={instructions[instructionIndex]?.time}
									onRunningChange={setIsTimerRunning}
									darkMode={darkMode}
									instructions={instructions}
									instructionIndex={instructionIndex}
									setInstructionIndex={handleInstructionChange}
								/>
							</div>

							{/* Fencer Canvas Component */}
							<div
								className="w-2/3 aspect-video bg-black flex items-center justify-center rounded-lg relative border border-gray-600"
								style={{ marginTop: "50px" }}
							>
								<Fencer_Canvas
									videoSource={height ? videoSource : null}
									isRecording={isRecording}
									setPose={setPose}
									containerWidth="100%"
									containerHeight="100%"
									darkMode={darkMode}
									fencerId={fencerId}
									setVideoId={setVideoId}
									setUploadAngles={setUploadAngles}
									setIsRecording={setIsRecording}
								/>
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
							className="absolute right-0 top-0"
							style={{
								width: "25%",
								height: "70%",
								marginTop: "100px",
								transform: "rotateY(-20deg)",
								transformOrigin: "right center",
								zIndex: 50,
								pointerEvents: "auto",
							}}
						>
							<Chatbot darkMode={darkMode} />
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
