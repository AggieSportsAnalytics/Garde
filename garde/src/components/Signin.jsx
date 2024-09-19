"use client"; // This ensures it's a client component

import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useUser } from "../components/UserContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"; // To decode the token

export default function Signin({ isSignUpDefault, type }) {
	const [isSignUp, setIsSignUp] = useState(isSignUpDefault || false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState(""); // Only used for sign-up
	const [error, setError] = useState(null);
	const router = useRouter();
	const { setUserData } = useUser();
	const [showAlert, setShowAlert] = useState(false);
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
						setUserData(decoded);
						router.push(`/${type}_page`);
					}
				} catch (error) {
					console.error("Invalid token", error);
				}
			}
		};

		checkToken();
	}, [router]);

	const closeModal = () => {
		setShowAlert(false);
		router.push(`/${type}_signin`); // Add restricted flag
	};

	// Handle form submission for both sign-in and sign-up
	const handleSubmit = async (e) => {
		e.preventDefault();
		const endpoint = isSignUp ? "/api/signup" : "/api/signin";
		const queryType = isSignUp ? `auth-${type}` : `verify-${type}`;
		const body = isSignUp
			? { email, password, name, queryType }
			: { email, password, queryType };

		try {
			const res = await axios.post(endpoint, body, {
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (res.status === 200) {
				setUserData(res.data); // Update the user data
				router.push(`/${type}_page`); // Redirect to the appropriate page
			}
		} catch (error) {
			setError("Something went wrong. Please try again.");
		}
	};

	// Handle Google Auth Success
	const handleGoogleSuccess = async (response) => {
		try {
			const res = await fetch("/api/google-auth", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token: response.credential }), // Send Google token to backend
			});

			if (res.ok) {
				const data = await res.json();
				router.push(`/${type}_page`);
			} else {
				const errorData = await res.json();
				setError(errorData.error);
			}
		} catch (error) {
			setError("Google Authentication failed. Please try again.");
		}
	};

	return (
		<GoogleOAuthProvider>
			<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
				{showAlert && (
					<div className="fixed inset-0 bg-opacity-50 flex justify-center items-center">
						<div className="p-8 bg-gray-900 rounded-lg shadow-lg max-w-md w-full">
							<h2 className="text-xl font-semibold mb-4">Restricted Access</h2>
							<p className="mb-6">
								You must sign in to access the requested page.
							</p>
							<button
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
							onSuccess={handleGoogleSuccess}
							onError={() =>
								setError("Google Authentication failed. Please try again.")
							}
						/>
					</div>

					<button
						onClick={() => setIsSignUp(!isSignUp)}
						className="w-full text-blue-400 hover:text-blue-500 text-sm mt-4"
					>
						{isSignUp
							? "Already have an account? Sign In"
							: "New here? Sign Up"}
					</button>
				</div>
			</div>
		</GoogleOAuthProvider>
	);
}
