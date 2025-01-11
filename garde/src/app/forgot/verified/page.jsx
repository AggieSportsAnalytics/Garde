"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from "@/src/components/axios";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

const ForgotPassword = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [email, setEmail] = useState("");
	const [type, setType] = useState("");
	const [message, setMessage] = useState("");
	const [blocked, setBlocked] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const verifyToken = async () => {
			try {
				const token = searchParams.get("token");

				const res = await axios.get("/api/verify_email", {
					withCredentials: true,
					headers: {
						ApiKey: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
						Authorization: `Bearer ${token}`,
					},
				});

				const { decoded } = res.data;

				setType(decoded.type);
				setEmail(decoded.email);
			} catch (error) {
				setMessage("Unable To Reset Password");
				setBlocked(true);
				console.error(error);
			}
		};

		verifyToken();
	}, [searchParams]);

	const handleSubmit = async (e) => {
		try {
			e.preventDefault();
			if (password !== confirmPassword) {
				setMessage("Failed, pasword and confirmed password do not match");
				setPassword("");
				setConfirmPassword("");
				setTimeout(() => {
					setMessage("");
				}, 3000);
				return;
			}

			if (password && confirmPassword && email && type) {
				const hashedPassword = await hashPassword(password);

				await axiosInstance.post(
					`${process.env.NEXT_PUBLIC_GARDE_WORKER}/forgot`,
					{ email: email, type: type, password: hashedPassword },
					{
						headers: { "Content-Type": "application/json" },
					},
				);

				setMessage("Successfully reset password.");
				setTimeout(() => {
					router.push("/signin");
				}, 1000);
			} else {
				setMessage("Failed, enter a valid email address, type, and passwords.");
			}
		} catch (error) {
			console.error(error);
			if (error.response?.status === 403) {
				setMessage("Unable to update password for users with google login.");
				setTimeout(() => {
					router.push("/signin");
				}, 3000);
			} else if (error.response?.status === 404) {
				setMessage(
					`Failed, user with email ${email} of type '${type}' not found.`,
				);
				setTimeout(() => {
					router.push("/signin");
				}, 3000);
			} else {
				setMessage("Failed to reset password, please try again.");
			}
		} finally {
			setPassword("");
			setConfirmPassword("");
			setTimeout(() => {
				setMessage("");
			}, 3000);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
			<div className="absolute top-4 left-4">
				<Link href="/signin" className="cursor-pointer">
					<button
						type="button"
						className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 duration-200 hover:scale-110 active:scale-100"
						title="Go Back"
					>
						&#8592;
					</button>
				</Link>
			</div>

			<div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
				<h1 className="text-center text-2xl font-semibold mb-6">
					Forgot Password
				</h1>
				<p className="text-sm text-gray-400 mb-6 text-center">
					Enter your new password and confirm it below, and we will reset your
					password.
				</p>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-300"
						>
							Password
						</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className={`${blocked && "cursor-not-allowed"} mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-white`}
							required
							disabled={blocked}
						/>
					</div>
					<div>
						<label
							htmlFor="confirm-password"
							className="block text-sm font-medium text-gray-300"
						>
							Confirm Password
						</label>
						<input
							type="password"
							id="confirm-password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className={`${blocked && "cursor-not-allowed"} mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-white`}
							required
							disabled={blocked}
						/>
					</div>
					<button
						type="submit"
						className={`${blocked ? "cursor-not-allowed bg-gray-400" : "hover:bg-blue-700"} w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm`}
						disabled={blocked}
					>
						Reset Password
					</button>
				</form>
				{message && (
					<p
						className={`${message.includes("Failed") || message.includes("Unable") ? "text-red-400" : "text-green-400"} mt-4 text-center text-sm`}
					>
						{message}
					</p>
				)}
				<div className="mt-6 text-center">
					<Link
						href="/signin"
						className="text-blue-400 hover:text-blue-500 text-sm"
					>
						Back to Sign In
					</Link>
				</div>
			</div>
		</div>
	);
};

async function hashPassword(plainPassword) {
	try {
		const res = await axios.post(
			"/api/hash",
			{ plainPassword: plainPassword },
			{
				withCredentials: true,
				headers: {
					Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
				},
			},
		);

		return res.data?.hashedPassword;
	} catch (error) {
		console.error(error);
	}
}

export default ForgotPassword;
