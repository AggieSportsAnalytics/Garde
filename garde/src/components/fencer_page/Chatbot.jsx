import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../axios";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import HLSPlayer from "../videos/HlsPlayer";
import ChatInput from "./ChatInput";

export default function Chatbot({
	darkMode,
	setChatCount,
	initialLoading,
	videoId,
	fencerId,
	isLoggedIn,
	decodeRun,
	fingerprint,
	isMenuOpen,
}) {
	const [userInput, setUserInput] = useState("");
	const [chatHistory, setChatHistory] = useState([]);
	const [loading, setLoading] = useState(false);
	const [videoUrl, setVideoUrl] = useState("");
	const [validPdfs, setValidPdfs] = useState([]);
	const [oldChat, setOldChat] = useState(false);
	const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}`;
	const router = useRouter();

	marked.setOptions({
		gfm: true,
		breaks: true,
	});

	useEffect(() => {
		const getChats = async () => {
			try {
				const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getVideo/${fencerId}`;
				const response = await axiosInstance.get(workerUrl);
				const noneMatch = response.data?.data?.every(
					(record) => record.video_id !== videoId,
				);
				if (noneMatch) {
					setOldChat(false);
				} else {
					setOldChat(true);
				}
			} catch (error) {
				console.error(error);
			}
		};

		getChats();
	}, [fencerId, videoId]);

	async function addQuery() {
		try {
			if (!fingerprint) {
				console.error("Could not generate fingerprint");
				return null;
			}

			const res = await axios.post(
				"/api/get-queries",
				{ fingerprint: fingerprint, query: "chats", loggedIn: isLoggedIn },
				{
					withCredentials: true,
					headers: {
						ApiKey: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
					},
				},
			);

			return res.data.chats;
		} catch (error) {
			console.error("Fingerprint failed:", error);
			return null;
		}
	}

	useEffect(() => {
		const injectPdfsIfAvailable = async () => {
			const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL;
			const basePath = fencerId
				? `${bucketUrl}/${fencerId}/${videoId}`
				: `${bucketUrl}/no-id/${videoId}`;

			const candidates = [
				{
					label: "Fencer Report",
					path: "fencing_analysis_report.pdf",
				},
				{
					label: "Coach Report",
					path: "coach_report.pdf",
				},
			];

			// Check if PDFs exist by making HEAD requests
			const available = await Promise.all(
				candidates.map(async (item) => {
					const url = `${basePath}/${item.path}`;
					try {
						// await axios.head(url);
						return {
							link: url,
							label: item.label,
						};
					} catch (error) {
						console.error(`PDF not found: ${item.label}`, error);
						return null;
					}
				}),
			);

			// filter out nulls and append to chat
			const validPdfs = available.filter(Boolean);
			setValidPdfs(validPdfs);
		};

		if (!decodeRun || !videoUrl || initialLoading || !videoId) return;

		injectPdfsIfAvailable();
	}, [videoId, fencerId, decodeRun, initialLoading, videoUrl]);

	useEffect(() => {
		const chatContainer = document.querySelector(".chat-messages");
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}, [chatHistory]);

	useEffect(() => {
		const getChat = async () => {
			try {
				const res = await axiosInstance.get(
					`${workerUrl}/getMessages/${videoId}`,
				);
				const ret = res.data.messages.results;
				const hist = ret[0]?.messages;
				const fId = ret[0]?.fencer_id;
				// if fId === "no-id" maybe allow null fencerId to access?
				// just depends if we want no-id chats to be public by link
				if (ret.length > 0 && decodeRun && fId !== fencerId) {
					router.push("/fencer_page");
					return;
				}

				if (hist?.length > 0) {
					setChatHistory(
						JSON.parse(hist).map((msg) =>
							msg.sender === "bot"
								? { ...msg, message: marked.parse(msg.message) }
								: msg,
						),
					);
				}
			} catch (error) {
				console.error(error);
			}
		};

		if (!decodeRun) {
			return;
		}
		const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL;
		if (fencerId && videoId) {
			const videoUrl = `${bucketUrl}/${fencerId}/${videoId}`;
			setVideoUrl(videoUrl);
		} else if (!fencerId) {
			const videoUrl = `${bucketUrl}/no-id/${videoId}`;
			setVideoUrl(videoUrl);
		}
		if (videoId) {
			getChat();
		}
	}, [videoId, fencerId, decodeRun]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!userInput.trim()) return;
		setLoading(true);

		const currentInput = userInput;

		const fullHistory = [
			...chatHistory,
			{ sender: "user", message: currentInput },
		];

		setChatHistory(fullHistory);

		const res = await axiosInstance.put(
			`${workerUrl}/updateMessages/${videoId}`,
			{ messages: JSON.stringify(fullHistory) },
		);

		setUserInput("");

		try {
			//real API call
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_CHAT_URL}/analyze/chat/${fencerId}/${videoId}`,
				{
					query: currentInput,
					messages: chatHistory,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			const chats = await addQuery();
			if (chats) {
				setChatCount(chats);
			} else {
				setChatCount((prev) => prev + 1);
			}

			const formattedMessage = await marked(response.data.analysis);

			const nonFormatHist = [
				...fullHistory,
				{ sender: "bot", message: response.data.analysis },
			];
			const formattedHist = [
				...fullHistory,
				{ sender: "bot", message: formattedMessage },
			];

			setChatHistory(formattedHist);

			const res = await axiosInstance.put(
				`${workerUrl}/updateMessages/${videoId}`,
				{ messages: JSON.stringify(nonFormatHist) },
			);
		} catch (error) {
			console.error("Chat API error:", error);

			let errorMessage = "Sorry, something went wrong.";

			if (error.response) {
				if (error.response.status === 401) {
					errorMessage =
						"Authentication error. Please try refreshing the page.";
				} else if (error.response.status === 404) {
					errorMessage =
						"The analysis service couldn't be reached. Please try again later.";
				} else if (error.response?.data?.error) {
					errorMessage = error.response.data.error;
				}
			} else if (error.request) {
				errorMessage = "No response from server. Please check your connection.";
			}

			fullHistory.push({ sender: "bot", message: errorMessage });

			setChatHistory(fullHistory);

			const res = await axiosInstance.put(
				`${workerUrl}/updateMessages/${videoId}`,
				{ messages: JSON.stringify(fullHistory) },
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className={`flex flex-col h-full p-4 border-gray-300 ${darkMode && "bg-black"}`}
			style={{ pointerEvents: "auto" }}
		>
			<div className="flex-1 overflow-y-auto chat-messages">
				{!oldChat && (
					<div className="text-center text-gray-500 my-4">
						{initialLoading && "Analyzing video"}
						{initialLoading === null && "Waiting for video upload"}
					</div>
				)}

				<div className="flex">
					{((videoUrl && initialLoading === false) || oldChat) && (
						<div className="w-72 ml-auto mr-3 mb-2">
							<HLSPlayer
								videoUrl={`${videoUrl}/playlist.m3u8`}
								autoplay={false}
							/>
						</div>
					)}
				</div>
				<div className="w-72 mb-2">
					{((videoUrl && initialLoading === false) || oldChat) && (
						<video
							src={`${videoUrl}/analyzed_video.webm`}
							controls
							autoPlay={false}
							muted
							className="w-full rounded-lg"
							controlsList="nodownload"
						/>
					)}
				</div>

				{((videoUrl && initialLoading === false) || oldChat) &&
					validPdfs.map((pdf) => (
						<div key={pdf.link} className="flex justify-start mb-2">
							<div className="bg-gray-200 p-4 rounded-lg shadow max-w-xs">
								<h3 className="text-md font-semibold text-gray-700 mb-2">
									{pdf.label}
								</h3>
								<a
									href={pdf.link}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline text-sm"
								>
									Download PDF
								</a>
							</div>
						</div>
					))}

				{chatHistory.map((chat, index) => (
					<div
						key={`${chat.sender}_${index}`}
						className={`mb-2 ${
							chat.sender === "user" ? "text-right" : "text-left"
						}`}
					>
						<div
							className={`inline-block px-4 py-2 rounded-lg max-w-[85%] ${
								chat.sender === "user"
									? darkMode
										? "bg-blue-600 text-white"
										: "bg-blue-500 text-white"
									: darkMode
										? "bg-gray-700 text-white"
										: "bg-gray-200 text-black"
							}`}
						>
							{chat.sender === "user" ? (
								<div>{chat.message}</div>
							) : (
								<div className="bot-message prose">
									{parse(DOMPurify.sanitize(chat.message))}
								</div>
							)}
						</div>
						{chat.sender === "bot" && index === chatHistory.length - 1 && (
							<div className="mt-1 ml-1 text-xs text-gray-500">
								{new Date().toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						)}
					</div>
				))}

				{loading && (
					<div className="text-left my-3">
						<div className="inline-block px-4 py-2 rounded-lg bg-gray-200 text-black animate-pulse">
							<div className="flex space-x-2">
								<div className="w-2 h-2 rounded-full bg-gray-500" />
								<div className="w-2 h-2 rounded-full bg-gray-500" />
								<div className="w-2 h-2 rounded-full bg-gray-500" />
							</div>
						</div>
					</div>
				)}
			</div>

			<ChatInput
				userInput={userInput}
				setUserInput={setUserInput}
				loading={loading}
				isMenuOpen={isMenuOpen}
				darkMode={darkMode}
				handleSubmit={handleSubmit}
			/>
		</div>
	);
}
