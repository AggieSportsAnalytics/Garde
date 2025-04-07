"use client";

import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import Link from "next/link";

const PrivacyPolicy = () => {
	const [htmlContent, setHtmlContent] = useState("");

	useEffect(() => {
		fetch("/privacy-policy.html")
			.then((response) => response.text())
			.then((data) => setHtmlContent(DOMPurify.sanitize(data)))
			.catch((error) => console.error("Error loading the HTML file:", error));
	}, []);

	return (
		<div className="privacy-policy bg-white p-5">
			<Link href="/" className="cursor-pointer">
				<button
					type="button"
					className="bg-black text-white py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 duration-200 hover:scale-110 active:scale-100"
					title="Go Back"
				>
					&#8592;
				</button>
			</Link>
			<div>{parse(htmlContent)}</div>
		</div>
	);
};

export default PrivacyPolicy;
