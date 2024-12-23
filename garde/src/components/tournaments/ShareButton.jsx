"use client";

import { useState } from "react";
import { FiShare2, FiCheck } from "react-icons/fi";

const ShareButton = ({ link }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async (e) => {
		try {
			e.stopPropagation();
			await navigator.clipboard.writeText(link);
			setCopied(true);

			// Reset "Copied" message after 2 seconds
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text:", err);
		}
	};

	return (
		<button
			type="button"
			onClick={(e) => handleCopy(e)}
			className="inline-flex items-center text-blue-500 hover:underline text-sm text-center gap-1"
		>
			{copied ? (
				<>
					<FiCheck size={16} /> Copied!
				</>
			) : (
				<>
					<FiShare2 size={16} /> Share
				</>
			)}
		</button>
	);
};

export default ShareButton;
