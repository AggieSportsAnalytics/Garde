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
		<div className="flex flex-col items-center justify-center mt-4 w-full max-w-sm mx-auto">
			<button
				onClick={handleToggle}
				type="button"
				className="flex items-center w-full max-w-xs px-3 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
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

			<span className="mt-3 text-sm sm:text-lg font-mono text-gray-900 bg-gray-200 py-2 rounded-lg shadow-sm w-full text-center flex items-center justify-between px-2">
				<span>{isRevealed ? uuid : "••••••••••••••••••••••••••••••••••"}</span>
				{isRevealed && (
					<button
						type="button"
						onClick={handleCopy}
						className="ml-2 text-gray-600 hover:text-black transition duration-200"
						title="Copy to clipboard"
					>
						{copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
					</button>
				)}
			</span>
		</div>
	);
}

export default UuidReveal;
