"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaMoon } from "react-icons/fa";

export default function BoutAnalysis() {
	const [darkMode, setDarkMode] = useState(false);
	const [videoFile, setVideoFile] = useState(null);

	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			if (e.target.files[0].type.startsWith("video/")) {
				setVideoFile(e.target.files[0]);
			} else {
				alert("Please upload a video file");
			}
		}
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
				<Link href="/">
					<button className="text-gray-600 hover:text-gray-900 p-2 text-lg transition-colors">
						←
					</button>
				</Link>

				<h1 className="text-xl font-medium text-center text-gray-800">
					Garde AI Bout Analysis
				</h1>

				<div className="flex items-center gap-3">
					<Link href="/login">
						<button className="px-4 py-1.5 bg-[#202123] text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium">
							Login
						</button>
					</Link>
					<Link href="/signup">
						<button className="px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-600">
							Sign Up
						</button>
					</Link>
					<button
						className="p-2 text-gray-600 hover:text-gray-900 rounded-full"
						aria-label="Toggle dark mode"
					>
						<FaMoon className="w-4 h-4" />
					</button>
				</div>
			</header>

			{/* Main Content */}
			<div className="max-w-2xl mx-auto mt-28 px-4">
				<div className="flex flex-col items-center justify-center">
					{/* Upload Area */}
					<div className="w-full flex items-center gap-3">
						<div className="flex-1">
							<div className="relative">
								<input
									type="text"
									placeholder="Upload your bout video for analysis..."
									className="w-full px-4 py-3.5 bg-white border border-gray-300 text-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-100 shadow-sm text-sm"
									readOnly
									onClick={() => document.getElementById("fileInput").click()}
								/>
								<div className="absolute inset-0 bg-gradient-to-b from-gray-50/5 to-transparent pointer-events-none rounded-lg" />
							</div>
							<input
								id="fileInput"
								type="file"
								accept="video/*"
								className="hidden"
								onChange={handleFileChange}
							/>
						</div>
						<button
							onClick={() => document.getElementById("fileInput").click()}
							className="px-4 py-3.5 bg-[#202123] text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium shadow-sm whitespace-nowrap"
						>
							Upload Video
						</button>
					</div>

					{videoFile && (
						<div className="w-full mt-6">
							<div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
								<video
									src={URL.createObjectURL(videoFile)}
									className="w-full"
									controls
								/>
							</div>
							<button className="mt-4 px-6 py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full text-sm font-medium shadow-sm">
								Analyze Bout
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
