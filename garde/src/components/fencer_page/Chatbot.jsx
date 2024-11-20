import React, { useState } from "react";
import axios from "axios";
import TypingEffect from "react-typing-effect";

export default function Chatbot({ darkMode }) {
	const [userInput, setUserInput] = useState("");
	const [chatHistory, setChatHistory] = useState([]);

	// Function to sanitize and format the bot's response
	const formatResponse = (response) => {
		return response
			.replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown (**text**)
			.replace(/__(.*?)__/g, "$1") // Remove italic markdown (__text__)
			.replace(/\n/g, "<br />"); // Replace newlines with HTML line breaks
	};

	const handleSubmit = async (e) => {
		setUserInput("");
		e.preventDefault();

		if (!userInput.trim()) return;

		// Add user input to chat history
		setChatHistory((prevHistory) => [
			...prevHistory,
			{ sender: "user", message: userInput },
		]);

		try {
			const response = await axios.post("/api/query", {
				query: userInput,
			});

			const formattedMessage = formatResponse(response.data.response);

			setChatHistory((prevHistory) => [
				...prevHistory,
				{ sender: "bot", message: formattedMessage },
			]);
		} catch (error) {
			const errorMessage =
				error.response && error.response.data && error.response.data.error
					? error.response.data.error
					: "Sorry, something went wrong.";

			setChatHistory((prevHistory) => [
				...prevHistory,
				{ sender: "bot", message: errorMessage },
			]);
		}
	};

	return (
		<div
			className="flex flex-col h-full p-4 rounded-lg border border-gray-300"
			style={{ pointerEvents: "auto" }}
		>
			<div className="flex-1 overflow-y-auto mb-4">
				{chatHistory.map((chat, index) => (
					<div
						key={index}
						className={`mb-2 ${
							chat.sender === "user" ? "text-right" : "text-left"
						}`}
					>
						<span
							className={`inline-block px-4 py-2 rounded-lg ${
								chat.sender === "user"
									? darkMode
										? "text-white"
										: "text-black"
									: darkMode
										? "text-white"
										: "text-black"
							}`}
							dangerouslySetInnerHTML={
								chat.sender === "bot"
									? { __html: chat.message }
									: { __html: chat.message }
							}
						></span>
					</div>
				))}
			</div>
			<form onSubmit={handleSubmit} className="flex">
				<input
					type="text"
					value={userInput}
					onChange={(e) => setUserInput(e.target.value)}
					className={`flex-1 px-3 py-2 rounded-l-lg focus:outline-none ${
						darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
					}`}
					placeholder="Type your message..."
				/>
				<button
					type="submit"
					className={`px-4 py-2 rounded-r-lg ${
						darkMode ? "bg-blue-600" : "bg-blue-500"
					} text-white`}
				>
					Send
				</button>
			</form>
		</div>
	);
}
