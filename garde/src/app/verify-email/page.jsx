"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // If you are verifying the token client-side
import axios from "axios";

export default function VerifyEmail() {
	const [message, setMessage] = useState("Verifying...");
	const searchParams = useSearchParams();
	const router = useRouter();
	const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/verifyEmail`; // Cloudflare Worker URL

	useEffect(() => {
		const token = searchParams.get("token"); // Get the token from the URL

		const verifyEmail = async () => {
			if (!token) {
				setMessage("No token provided");
				return;
			}

			try {
				// Verify the token here (client-side or in a Next.js backend route)
				const decoded = jwtDecode(token);

				// Example: Add more checks if necessary (e.g., check expiration)
				if (!decoded || !decoded.email || !decoded.type) {
					throw new Error("Invalid token");
				}

				const queryData = {
					email: decoded.email,
					type: decoded.type,
				};

				// Token is valid, send POST request to Cloudflare Worker
				const response = await axios.post(workerUrl, queryData, {
					headers: { "Content-Type": "application/json" },
				});

				if (response.status === 200) {
					setMessage("Email verified successfully! Redirecting...");
					setTimeout(() => {
						router.push(`/${decoded.type}_signin`); // Redirect to sign-in page after 3 seconds
					}, 3000);
				} else {
					setMessage("Error verifying email. Please try again.");
				}
			} catch (error) {
				console.log(error);
				setMessage("Invalid or expired token.");
			}
		};

		verifyEmail();
	}, [searchParams, router]);

	return (
		<div className="min-h-screen flex items-center justify-center text-white">
			<p>{message}</p>
		</div>
	);
}
