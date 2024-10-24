"use client";

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function UuidReveal({ uuid }) {
	const [isRevealed, setIsRevealed] = useState(false);

	const handleToggle = () => {
		setIsRevealed(!isRevealed);
	};

	return (
		<div className="flex flex-col items-center justify-center mt-4">
			{/* Display Reveal/Hide Button */}
			<button
				onClick={handleToggle}
				type="button"
				className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
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

			{/* Display UUID or Hidden Placeholder */}
			<span className="mt-2 text-lg font-mono text-gray-900 bg-gray-200 px-4 py-2 rounded-lg shadow-sm">
				{isRevealed ? uuid : "••••••••••••••••••••••••••••••••••"}
			</span>
		</div>
	);
}

export default UuidReveal;
