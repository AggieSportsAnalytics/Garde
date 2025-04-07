"use client";

import React, { useEffect, useState, Suspense } from "react";
import {
	AiOutlineCheckCircle,
	AiOutlineExclamationCircle,
} from "react-icons/ai";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import axiosInstance from "@/src/components/axios";
import Link from "next/link";

function VerifyEmail() {
	const [message, setMessage] = useState("Verifying...");
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/verifyEmail`;
		const token = searchParams.get("token");

		const verifyEmail = async () => {
			if (!token) {
				setMessage("No token provided");
				return;
			}

			try {
				const res = await axios.get("/api/verify_email", {
					withCredentials: true,
					headers: {
						ApiKey: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
						Authorization: `Bearer ${token}`,
					},
				});

				const { decoded } = res.data;

				if (!decoded?.email || !decoded.type) {
					throw new Error("Invalid token");
				}

				const queryData = {
					email: decoded.email,
					type: decoded.type,
				};

				await axiosInstance.post(workerUrl, queryData, {
					headers: { "Content-Type": "application/json" },
				});

				setMessage("Email verified successfully! Redirecting...");
				setTimeout(() => {
					router.push("/signin");
				}, 3000);
			} catch (error) {
				console.error(error);
				setMessage("Invalid or expired token.");
			}
		};

		verifyEmail();
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center text-white p-4">
			<Link className="absolute top-4 left-4" href="/">
				<img
					src="/images/garde-square.png"
					alt="Logo"
					className="w-24 h-auto"
				/>
			</Link>
			<div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-md">
				{message === "Verifying..." ? (
					<div className="flex flex-col items-center space-y-4">
						<div className="loader spinner-border animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
						<p className="text-lg font-semibold">{message}</p>
					</div>
				) : message === "Email verified successfully! Redirecting..." ? (
					<div className="flex flex-col items-center space-y-4 text-green-400">
						<AiOutlineCheckCircle className="w-10 h-10" />
						<p className="text-lg font-semibold">{message}</p>
					</div>
				) : (
					<div className="flex flex-col items-center space-y-4 text-red-400">
						<AiOutlineExclamationCircle className="w-10 h-10" />
						<p className="text-lg font-semibold">{message}</p>
						<button
							type="button"
							onClick={() => router.push("/#contact")}
							className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							Contact Support
						</button>
					</div>
				)}
			</div>
			<footer className="mt-8 text-sm text-gray-200">
				© 2024-2025 Garde™. All Rights Reserved.
			</footer>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<VerifyEmail />
		</Suspense>
	);
}
