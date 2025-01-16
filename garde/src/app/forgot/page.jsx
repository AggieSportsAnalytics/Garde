"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";

const ForgotPassword = () => {
	const [type, setType] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		try {
			e.preventDefault();

			if (email && type) {
				await axios.post(
					"/api/forgot-password",
					{ email: email, type: type },
					{
						withCredentials: true,
						headers: {
							Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
							"Content-Type": "application/json",
						},
					},
				);
				setMessage(
					"If this email is registered, you will receive a reset link.",
				);
			} else {
				setMessage("Please enter a valid email address and type.");
			}

			setType("");
			setEmail("");

			setTimeout(() => {
				setMessage("");
			}, 3000);
		} catch (error) {
			console.error(error);
			setMessage("Email failed to send, please try again.");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
			<div className="absolute top-4 left-4">
				<a href="/signin" className="cursor-pointer">
					<button
						type="button"
						className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 duration-200 hover:scale-110 active:scale-100"
						title="Go Back"
					>
						&#8592;
					</button>
				</a>
			</div>

			<div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
				<h1 className="text-center text-2xl font-semibold mb-6">
					Forgot Password
				</h1>
				<p className="text-sm text-gray-400 mb-6 text-center">
					Enter your email address and user type below, and we'll send you a
					link to reset your password.
				</p>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label htmlFor="type" className="block text-sm font-medium">
							Type
						</label>
						<select
							id="type"
							className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
							value={type}
							onChange={(e) => setType(e.target.value)}
							required
						>
							<option value="" disabled>
								Select a type
							</option>
							<option value="fencer">Fencer</option>
							<option value="coach">Coach</option>
						</select>
					</div>
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-300"
						>
							Email Address
						</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-white"
							placeholder="you@example.com"
							required
						/>
					</div>
					<button
						type="submit"
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
					>
						Send Reset Link
					</button>
				</form>
				{message && (
					<p
						className={`${message.includes("failed") ? "text-red-400" : "text-green-400"} mt-4 text-center text-sm`}
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

export default ForgotPassword;
