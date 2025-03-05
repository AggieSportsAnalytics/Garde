import { useState, useEffect, useRef } from "react";
import axiosInstance from "../axios";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function SidebarMenu({ fencerId }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [chats, setChats] = useState([]);
	const router = useRouter();
	const menuRef = useRef(null);

	useEffect(() => {
		const getChats = async () => {
			try {
				const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getVideo/${fencerId}`;
				const response = await axiosInstance.get(workerUrl);
				setChats(response.data.data);
			} catch (error) {
				console.error(error);
			}
		};

		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setIsMenuOpen(false);
			}
		};

		if (fencerId) {
			getChats();
		}
		if (isMenuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [fencerId, isMenuOpen]);

	return (
		<div className="relative z-50" ref={menuRef}>
			{/* Hamburger Icon (Top Left) */}
			<button
				className="absolute top-0 left-0 p-2 bg-gray-800 text-white"
				type="button"
				onClick={() => setIsMenuOpen((prev) => !prev)}
			>
				<div className="flex flex-col space-y-1 p-2 bg-gray-800 rounded">
					<span className="block w-6 h-0.5 bg-white" />
					<span className="block w-6 h-0.5 bg-white" />
					<span className="block w-6 h-0.5 bg-white" />
				</div>
			</button>

			{/* Sidebar Menu (Slides in) */}
			<div
				className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg transform ${
					isMenuOpen ? "translate-x-0" : "-translate-x-full"
				} transition-transform duration-300 ease-in-out`}
			>
				{/* Close Button */}
				<button
					className="absolute top-2 right-2 text-gray-400 hover:text-white"
					onClick={() => setIsMenuOpen((prev) => !prev)}
				>
					✕
				</button>

				{/* Sidebar Content */}
				<div className="p-4">
					<h2 className="text-lg font-semibold mb-4">Menu</h2>
					<ul className="space-y-2 overflow-y-auto max-h-80">
						<li
							className="hover:bg-gray-700 p-2 rounded cursor-pointer"
							onClick={() => router.push(`/fencer_page/${uuidv4()}`)}
						>
							New Chat
						</li>
						<li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
							Chats
						</li>
						{chats
							?.slice()
							.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
							.map((chat, index) => (
								<li
									key={`${chat.video_id}_${index}`}
									className="hover:bg-gray-700 p-2 rounded cursor-pointer flex justify-between items-center"
									onClick={() => router.push(`/fencer_page/${chat.video_id}`)}
								>
									<span className="text-gray-400 text-sm">
										&nbsp;&nbsp;&nbsp;&nbsp;
										{new Date(`${chat.timestamp}Z`).toLocaleString()}
									</span>
								</li>
							))}
					</ul>
				</div>
			</div>
		</div>
	);
}
