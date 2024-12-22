"use client";

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiCopy, FiCheck } from "react-icons/fi";

function UuidReveal({ uuid }) {
	const [isRevealed, setIsRevealed] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleToggle = () => {
		setIsRevealed(!isRevealed);
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(uuid);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="flex flex-col items-center justify-center mt-6 w-full max-w-md mx-auto">
			<button
				onClick={handleToggle}
				type="button"
				className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors duration-200 sm:text-base text-sm"
			>
				{isRevealed ? (
					<>
						<FaEyeSlash className="mr-2" />
						Hide ID
					</>
				) : (
					<>
						<FaEye className="mr-2" />
						Reveal ID
					</>
				)}
			</button>

			<span className="mt-4 flex items-center justify-between w-full px-4 py-3 bg-gray-100 text-gray-800 rounded-lg shadow-md sm:text-lg text-sm">
				<span className={`truncate ${isRevealed ? "" : "select-none"}`}>
					{isRevealed ? uuid : "••••••••••••••••••••••••••••••••••"}
				</span>
				<button
					type="button"
					onClick={handleCopy}
					className="ml-3 text-gray-500 hover:text-gray-800 transition duration-200"
					title="Copy to clipboard"
				>
					{copied ? (
						<FiCheck size={20} className="text-green-500" />
					) : (
						<FiCopy size={20} />
					)}
				</button>
			</span>
		</div>
	);
}

export default UuidReveal;
