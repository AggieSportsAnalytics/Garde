"use client";
import { useState, useEffect, useRef } from "react";
import axiosInstance from "../axios";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { FaTrashAlt } from "react-icons/fa";

export default function SidebarMenu({
	fencerId,
	isMenuOpen,
	setIsMenuOpen,
	darkMode,
}) {
	const [chats, setChats] = useState([]);
	const router = useRouter();
	const menuRef = useRef(null);

	useEffect(() => {
		if (!fencerId) return;
		// fetch your list of chats…
		const getChats = async () => {
			try {
				const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getVideo/${fencerId}`;
				const response = await axiosInstance.get(workerUrl);
				setChats(response.data.data);
			} catch (error) {
				console.error(error);
			}
		};
		getChats();
	}, [fencerId, isMenuOpen, setIsMenuOpen]);

	const handleDeleteChat = async (fencerId, videoId) => {
		if (!window.confirm("Are you sure you want to delete this chat?")) return;
		try {
			const deleteUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/deleteChat/${fencerId}/${videoId}`;
			await axiosInstance.delete(deleteUrl);
			setChats((c) => c.filter((chat) => chat.video_id !== videoId));
			router.push("/fencer_page");
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="relative z-50" ref={menuRef}>
			{/* hamburger */}
			<button
				className={`absolute top-4 left-4 p-2 rounded-md ${
					darkMode ? "bg-white text-black" : "bg-gray-800 text-white"
				}`}
				onClick={() => setIsMenuOpen((o) => !o)}
			>
				<div className="flex flex-col space-y-1">
					<span
						className={`block w-6 h-0.5 ${darkMode ? "bg-black" : "bg-white"}`}
					/>
					<span
						className={`block w-6 h-0.5 ${darkMode ? "bg-black" : "bg-white"}`}
					/>
					<span
						className={`block w-6 h-0.5 ${darkMode ? "bg-black" : "bg-white"}`}
					/>
				</div>
			</button>

			{/* sidebar panel */}
			<div
				className={`
          fixed top-0 left-0 h-full w-64 shadow-lg transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
          ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}
        `}
			>
				{/* close “×” */}
				<button
					type="button"
					className={`absolute top-4 right-4 p-1 rounded-md ${
						darkMode
							? "text-gray-400 hover:text-white"
							: "text-gray-600 hover:text-gray-800"
					}`}
					onClick={() => setIsMenuOpen(false)}
				>
					✕
				</button>

				<div className="p-6">
					<h2
						className={`text-xl font-semibold mb-4 ${
							darkMode ? "text-white" : "text-gray-900"
						}`}
					>
						Menu
					</h2>
					<ul className="space-y-2 overflow-y-auto max-h-[70vh]">
						<li
							className={`p-2 rounded cursor-pointer ${
								darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
							}`}
							onClick={() => router.push(`/fencer_page/${uuidv4()}`)}
						>
							<span
								className={`${darkMode ? "text-gray-200" : "text-gray-800"}`}
							>
								New Chat
							</span>
						</li>
						{chats
							.slice()
							.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
							.map((chat) => (
								<li
									key={chat.video_id}
									className={`flex justify-between items-center p-2 rounded cursor-pointer ${
										darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
									}`}
									onClick={() => router.push(`/fencer_page/${chat.video_id}`)}
								>
									<span
										className={`text-sm ${
											darkMode ? "text-gray-400" : "text-gray-600"
										}`}
									>
										{new Date(`${chat.timestamp}Z`).toLocaleString()}
									</span>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteChat(fencerId, chat.video_id);
										}}
										className={`${
											darkMode
												? "text-red-400 hover:text-red-600"
												: "text-red-500 hover:text-red-700"
										}`}
									>
										<FaTrashAlt size={12} />
									</button>
								</li>
							))}
					</ul>
				</div>
			</div>
		</div>
	);
}
