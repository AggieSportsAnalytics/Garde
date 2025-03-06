import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../axios";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import parse from "html-react-parser";
import DOMPurify from "dompurify";

export default function Chatbot({
	darkMode,
	initialAnalysis,
	chatCount,
	setChatCount,
	initialLoading,
	videoId,
	fencerId,
	isLoggedIn,
	decodeRun,
	fingerprint,
}) {
	const [userInput, setUserInput] = useState("");
	const [chatHistory, setChatHistory] = useState([]);
	const [loading, setLoading] = useState(false);
	const [videoUrl, setVideoUrl] = useState("");
	const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}`;
	const router = useRouter();

	// Function to sanitize and format the bot's response
	// const formatResponse = (response) => {
	// 	if (!response) return "";

	// 	return response
	// 		.replace(/\n/g, "<br />") // Single line breaks
	// 		.replace(
	// 			/######\s?(.*?)(\n|$)/g,
	// 			"<h6 class='text-sm font-semibold'>$1</h6>",
	// 		)
	// 		.replace(
	// 			/#####\s?(.*?)(\n|$)/g,
	// 			"<h5 class='text-base font-semibold'>$1</h5>",
	// 		)
	// 		.replace(
	// 			/####\s?(.*?)(\n|$)/g,
	// 			"<h4 class='text-lg font-semibold'>$1</h4>",
	// 		)
	// 		.replace(/###\s?(.*?)(\n|$)/g, "<h3 class='text-xl font-bold'>$1</h3>")
	// 		.replace(/##\s?(.*?)(\n|$)/g, "<h2 class='text-2xl font-bold'>$1</h2>")
	// 		.replace(/#\s?(.*?)(\n|$)/g, "<h1 class='text-3xl font-bold'>$1</h1>")
	// 		.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
	// 		.replace(/__(.*?)__/g, "<em>$1</em>") // Italic
	// 		.replace(/\n{2,}/g, "</p><p>") // Paragraphs
	// 		.replace(/- (.*?)(\n|$)/g, "<li>$1</li>") // List items
	// 		.replace(/<\/li>(?!<li>)/g, "</li></ul>") // Ensure list closure
	// 		.replace(/<li>/, "<ul><li>"); // Ensure list opening
	// };

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

				if (hist) {
					setChatHistory(JSON.parse(hist));
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
			const videoUrl = `${bucketUrl}/${fencerId}/${videoId}/playlist.m3u8`;
			setVideoUrl(videoUrl);
		} else if (!fencerId) {
			const videoUrl = `${bucketUrl}/no-id/${videoId}/playlist.m3u8`;
			setVideoUrl(videoUrl);
		}
		if (videoId) {
			getChat();
		}
	}, [videoId, fencerId, decodeRun]);

	//use either real initialAnalysis or dummy data in debug mode
	useEffect(() => {
		const getInitialAnalysis = async () => {
			console.log(initialAnalysis);
			const formattedAnalysis = await marked(
				initialAnalysis.replace(/\n/g, "<br />"),
			);
			console.log(formattedAnalysis);

			setChatHistory([{ sender: "bot", message: formattedAnalysis }]);

			const res = axiosInstance.put(`${workerUrl}/updateMessages/${videoId}`, {
				messages: JSON.stringify([
					{ sender: "bot", message: formattedAnalysis },
				]),
			});
		};

		if (initialAnalysis) {
			getInitialAnalysis();
		}
	}, [initialAnalysis]);

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
				`${process.env.NEXT_PUBLIC_CHAT_URL}/analyze/chat`,
				{
					query: currentInput,
					messages: chatHistory,
					videoUrl: videoUrl,
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

			const formattedMessage = await marked(
				response.data.analysis.replace(/\n/g, "<br />"),
			);

			fullHistory.push({ sender: "bot", message: formattedMessage });

			setChatHistory(fullHistory);

			const res = await axiosInstance.put(
				`${workerUrl}/updateMessages/${videoId}`,
				{ messages: JSON.stringify(fullHistory) },
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
			className="flex flex-col h-full p-4 border-l border-gray-300"
			style={{ pointerEvents: "auto" }}
		>
			{!isLoggedIn && (
				<>
					<p className="text-center">
						{10 - chatCount} chats left without signing in for 24 hours
					</p>
					<p className="text-center">
						Get unlimited chats by signing up for a free account
					</p>
				</>
			)}

			<div className="flex-1 overflow-y-auto mb-4 chat-messages">
				{chatHistory.length === 0 ? (
					<div className="text-center text-gray-500 my-4">
						{initialLoading ? "Analyzing video..." : "Waiting for video upload"}
					</div>
				) : (
					chatHistory.map((chat, index) => (
						<div
							key={index}
							className={`mb-3 ${
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
									<div className="bot-message">
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
					))
				)}

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

			<form onSubmit={handleSubmit} className="flex">
				<input
					type="text"
					value={userInput}
					onChange={(e) => setUserInput(e.target.value)}
					className={`flex-1 px-3 py-2 rounded-l-lg focus:outline-none ${
						darkMode
							? "bg-gray-700 text-white"
							: "bg-gray-100 text-black border border-gray-300"
					}`}
					placeholder="Ask about your fencing technique..."
					disabled={
						loading ||
						chatHistory.length === 0 ||
						(10 - chatCount <= 0 && !isLoggedIn)
					}
				/>
				<button
					type="submit"
					className={`px-4 py-2 rounded-r-lg ${
						darkMode ? "bg-blue-600" : "bg-blue-500"
					} text-white ${
						loading ||
						chatHistory.length === 0 ||
						(10 - chatCount <= 0 && !isLoggedIn)
							? "opacity-50 cursor-not-allowed"
							: "hover:bg-blue-600"
					}`}
					disabled={
						loading ||
						chatHistory.length === 0 ||
						(10 - chatCount <= 0 && !isLoggedIn)
					}
				>
					Send
				</button>
			</form>

			{chatHistory.length === 0 && (
				<div className="text-center text-xs text-gray-500 mt-2">
					Chat will be enabled after video analysis completes
				</div>
			)}
		</div>
	);
}
