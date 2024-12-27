"use client";

import React, { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

function CopyButton({
	text,
	before = "",
	after = "",
	size = 20,
	style = "ml-3 text-gray-500 hover:text-gray-800 transition duration-200",
	BeforeIcon = FiCopy,
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = (e) => {
		e.stopPropagation();
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className={style}
			title="Copy to clipboard"
		>
			{copied ? (
				<>
					<FiCheck size={size} className="text-green-500" /> {after}
				</>
			) : (
				<>
					<BeforeIcon size={size} /> {before}
				</>
			)}
		</button>
	);
}

export default CopyButton;
