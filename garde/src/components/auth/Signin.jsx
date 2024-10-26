"use client";

import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

export default function Signin({ isSignUpDefault, type }) {
	const [isSignUp, setIsSignUp] = useState(isSignUpDefault || false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState(""); // Only used for sign-up
	const [error, setError] = useState(null);
	const [showAlert, setShowAlert] = useState(false);
	const [success, setSuccess] = useState("");
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const restricted = searchParams.get("restricted");
		if (restricted === "true") {
			setShowAlert(true);
		}
	}, [searchParams]);

	useEffect(() => {
		const checkToken = async () => {
			// Get the token from cookies
			const token = document.cookie
				.split("; ")
				.find((row) => row.startsWith("token="))
				?.split("=")[1];

			if (token) {
				try {
					// Decode the token to check its validity
					const decoded = jwtDecode(token);

					// Check if the token is still valid (i.e., not expired)
					const currentTime = Date.now() / 1000;
					if (decoded.exp > currentTime) {
						if (decoded.type === type) {
							router.push(`/${type}_page`);
						} else {
							router.push(`${type}_signin`);
						}
					}
				} catch (error) {}
			}
		};

		checkToken();
	}, [router, type]);

	const closeModal = () => {
		setShowAlert(false);
		router.push(`/${type}_signin`); // Add restricted flag
	};

	// Handle form submission for both sign-in and sign-up
	const handleSubmit = async (e) => {
		e.preventDefault();

		const endpoint = isSignUp ? "/api/signup" : "/api/signin";
		const body = isSignUp
			? { email, password, name, type }
			: { email, password, type };

		try {
			const res = await axios.post(endpoint, body, {
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (res.status >= 200 && res.status < 300 && !isSignUp) {
				setError("");
				setSuccess("Please wait, logging in...");
				router.push(`/${type}_page`); // Redirect to the appropriate page
			} else if (res.status >= 200 && res.status < 300 && isSignUp) {
				setError("");
				setSuccess("Please verify your email address...");
			}
		} catch (error) {
			setName("");
			setEmail("");
			setPassword("");
			setSuccess("");
			setError(error.response.data.error || "Failed to login/sign up");
		} finally {
			await new Promise((r) => setTimeout(r, 2000));
			setEmail("");
			setPassword("");
			setName("");
			setSuccess("");
			setError("");
		}
	};

	// Handle Google Auth Success
	const handleGoogleSuccess = async (response) => {
		try {
			setError("");

			const queryData = {
				userData: response.credential,
				type: type,
			};
			const res = await axios.post("/api/google-auth", queryData, {
				headers: { "Content-Type": "application/json" },
			});

			if (res.status >= 200 && res.status < 300) {
				setSuccess("Please wait, logging in...");
				router.push(`/${type}_page`);
			}
		} catch (error) {
			setSuccess("");
			setError(error.response.data.error || "Failed to sign up");
			await new Promise((r) => setTimeout(r, 2000));
			setError("");
		}
	};

	const handleGoogleError = () => {
		setSuccess("");
		setError("Google Auth failed");
	};

	const toggleSignUp = () => {
		setError("");
		setSuccess("");
		setName("");
		setEmail("");
		setPassword("");
		setIsSignUp(!isSignUp);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
			<div className="absolute top-4 left-4">
				<Link href="/" className="cursor-pointer">
					<button
						type="button"
						className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 duration-200 hover:scale-125 active:scale-100"
						title="Go Back"
					>
						&#8592;
					</button>
				</Link>
			</div>
			{showAlert && (
				<div className="fixed inset-0 bg-opacity-50 flex justify-center items-center">
					<div className="p-8 bg-gray-900 rounded-lg shadow-lg max-w-md w-full">
						<h2 className="text-xl font-semibold mb-4">Restricted Access</h2>
						<p className="mb-6">
							You must sign in to access the requested page.
						</p>
						<button
							type="button"
							onClick={closeModal}
							className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
						>
							Dismiss
						</button>
					</div>
				</div>
			)}
			<div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
				<h1 className="text-center text-2xl font-semibold mb-6">
					{isSignUp ? "Sign Up" : "Sign In"}
				</h1>

				<form onSubmit={handleSubmit} className="space-y-6">
					{isSignUp && (
						<div>
							<label htmlFor="name" className="block text-sm font-medium">
								Name
							</label>
							<input
								type="text"
								id="name"
								className="mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required={isSignUp}
							/>
						</div>
					)}

					<div>
						<label htmlFor="email" className="block text-sm font-medium">
							Email
						</label>
						<input
							type="email"
							id="email"
							className="mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium">
							Password
						</label>
						<input
							type="password"
							id="password"
							className="mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					{error && <p className="text-red-500">{error}</p>}
					{success && <p className="text-green-500">{success}</p>}

					<button
						type="submit"
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
					>
						{isSignUp ? "Sign Up" : "Sign In"}
					</button>
				</form>

				{/* Google Auth Button */}
				<div className="mt-4">
					<GoogleLogin
						width="385"
						onSuccess={handleGoogleSuccess}
						onError={handleGoogleError}
					/>
				</div>

				<button
					type="button"
					onClick={toggleSignUp}
					className="w-full text-blue-400 hover:text-blue-500 text-sm mt-4"
				>
					{isSignUp ? "Already have an account? Sign In" : "New here? Sign Up"}
				</button>
			</div>
		</div>
	);
}
