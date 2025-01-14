"use client";

import React, { useEffect, useState } from "react";

const PrivacyPolicy = () => {
	const [htmlContent, setHtmlContent] = useState("");

	useEffect(() => {
		fetch("/privacy-policy.html")
			.then((response) => response.text())
			.then((data) => setHtmlContent(data))
			.catch((error) => console.error("Error loading the HTML file:", error));
	}, []);

	return (
		<div className="privacy-policy bg-white p-5">
			<div dangerouslySetInnerHTML={{ __html: htmlContent }} />
		</div>
	);
};

export default PrivacyPolicy;
