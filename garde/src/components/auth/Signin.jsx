"use client";

import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Loader from "../ui/Loader";
import CoachPageScaffold from "../coach_page/CoachPageScaffold";
import checkAuth from "@/src/app/hooks/jwt_verify";
import RestrictedAlert from "../ui/RestrictedAlert";

export default function Signin({ isSignUpDefault, type }) {
	const [isSignUp, setIsSignUp] = useState(isSignUpDefault || false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState(""); // Only used for sign-up
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const initPage = async () => {
			try {
				const decoded = await checkAuth(router, `${type}_signin`, type, true);

				if (decoded?.type === type) {
					router.push(`${type}_page`);
				}
			} catch (error) {
				console.error(error);
				router.push(`${type}_signin?restricted=true`);
			}
		};

		initPage();
	}, [router, type]);

	// Handle form submission for both sign-in and sign-up
	const handleSubmit = async (e) => {
		setLoading(true);
		e.preventDefault();

		const endpoint = isSignUp ? "/api/signup" : "/api/signin";
		const body = isSignUp
			? { email, password, name, type }
			: { email, password, type };

		try {
			const res = await axios.post(endpoint, body, {
				withCredentials: true,
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!isSignUp) {
				// setLoading(false);
				setError("");
				setSuccess("Please wait, logging in...");

				const redirect = searchParams.get("redirect");
				if (redirect) {
					router.push(redirect);
				} else {
					router.push(`/${type}_page`);
				}
			} else if (isSignUp) {
				setLoading(false);
				setError("");
				setSuccess("Please verify your email address...");
			}
		} catch (error) {
			setLoading(false);
			setName("");
			setEmail("");
			setPassword("");
			setSuccess("");
			setError(error.response.data.error || "Failed to login/sign up");
		} finally {
			setEmail("");
			setPassword("");
			setName("");
			setTimeout(() => {
				setSuccess("");
				setError("");
			}, 2000);
		}
	};

	// Handle Google Auth Success
	const handleGoogleSuccess = async (response) => {
		try {
			const redirect = searchParams.get("redirect");
			if (redirect) {
				setLoading(true);
			}
			setError("");

			const queryData = {
				userData: response.credential,
				type: type,
			};
			const res = await axios.post("/api/google-auth", queryData, {
				withCredentials: true,
				headers: { "Content-Type": "application/json" },
			});

			setSuccess("Please wait, logging in...");

			if (redirect) {
				router.push(redirect);
			} else {
				router.push(`/${type}_page`);
			}
		} catch (error) {
			setLoading(false);
			setSuccess("");
			setError(error.response.data.error || "Failed to sign up");
			setTimeout(() => setError(""), 2000);
		}
	};

	const handleGoogleError = () => {
		setLoading(false);
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
		<>
			{loading ? (
				<>
					{type === "coach" ? (
						<CoachPageScaffold />
					) : (
						<Loader loading={loading} />
					)}
				</>
			) : (
				<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
					<div className="absolute top-4 left-4">
						<Link href="/" className="cursor-pointer">
							<button
								type="button"
								className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 duration-200 hover:scale-110 active:scale-100"
								title="Go Back"
							>
								&#8592;
							</button>
						</Link>
					</div>

					<RestrictedAlert redirect={`${type}_signin`} />
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
										className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
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
									className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
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
									className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</div>

							{error && <p className="text-red-500 text-sm">{error}</p>}
							{success && <p className="text-green-500 text-sm">{success}</p>}

							<button
								type="submit"
								className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
							>
								{isSignUp ? "Sign Up" : "Sign In"}
							</button>
						</form>

						{/* Google Auth Button */}
						<div className="mt-4 flex justify-center">
							<GoogleLogin
								width="280"
								onSuccess={handleGoogleSuccess}
								onError={handleGoogleError}
							/>
						</div>

						<button
							type="button"
							onClick={toggleSignUp}
							className="w-full text-blue-400 hover:text-blue-500 text-sm mt-4"
						>
							{isSignUp
								? "Already have an account? Sign In"
								: "New here? Sign Up"}
						</button>
					</div>
				</div>
			)}
		</>
	);
}
