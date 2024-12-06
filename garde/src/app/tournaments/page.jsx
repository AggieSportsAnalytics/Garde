"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Modal from "react-modal";
import { jwtDecode } from "jwt-decode";

function TournamentCard({ tournament, onClick }) {
	return (
		<button
			type="button"
			className="p-4 border border-gray-700 rounded-lg shadow-lg bg-gray-900 text-white hover:bg-gray-800 transition-transform duration-200 transform hover:scale-105 cursor-pointer"
			onClick={onClick}
		>
			<h3 className="text-xl font-bold mb-2">{tournament.event_name}</h3>
			<div className="text-gray-400 space-y-1">
				<p>
					<span className="font-semibold text-white">Organizer:</span>{" "}
					{tournament.organizer_name}
				</p>
				<p>
					<span className="font-semibold text-white">Location:</span>{" "}
					{tournament.location}
				</p>
				<p>
					<span className="font-semibold text-white">Privacy:</span>{" "}
					{tournament.privacy}
				</p>
				<p>
					<span className="font-semibold text-white">Start Time:</span>{" "}
					{new Date(tournament.start_time).toLocaleString()}
				</p>
			</div>
		</button>
	);
}

function Navbar({ setLoggedIn, loggedIn, setIsModalOpen }) {
	const router = useRouter();

	const handleAuth = async () => {
		if (loggedIn) {
			try {
				await axios.get("/api/logout");
				setLoggedIn(false);
			} catch (error) {
				console.error(error);
			}
		} else {
			setIsModalOpen(true);
		}
	};

	return (
		<>
			<nav className="relative flex items-center bg-gray-900 text-white p-4 shadow-md">
				<Link href="/" className="cursor-pointer">
					<button
						type="button"
						className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 transition-transform duration-200 hover:scale-110 active:scale-100"
						title="Go Back"
					>
						&#8592;
					</button>
				</Link>

				<h1 className="text-3xl absolute left-1/2 transform -translate-x-1/2 font-bold">
					Tournaments
				</h1>

				<div className="ml-auto flex gap-4">
					<button
						type="button"
						className="hover:text-blue-500"
						onClick={() => router.push("/tournaments/my-tournaments")}
					>
						My Tournaments
					</button>
					<button
						type="button"
						className="hover:text-blue-500"
						onClick={handleAuth}
					>
						{loggedIn ? "Logout" : "Signin"}
					</button>
				</div>
			</nav>
		</>
	);
}

function LoginModal({ isModalOpen, setIsModalOpen }) {
	const router = useRouter();

	const handleRoleSelection = (role) => {
		setIsModalOpen(false); // Close the modal
		if (role === "fencer") {
			router.push("/fencer_signin?redirect=tournaments");
		} else if (role === "coach") {
			router.push("/coach_signin?redirect=tournaments");
		}
	};

	return (
		<Modal
			isOpen={isModalOpen}
			onRequestClose={() => setIsModalOpen(false)}
			className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto mt-20"
			overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
		>
			<h2 className="text-xl font-semibold mb-4 text-center">
				Are you a Fencer or a Coach?
			</h2>
			<div className="flex justify-center gap-4">
				<button
					type="button"
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					onClick={() => handleRoleSelection("fencer")}
				>
					Fencer
				</button>
				<button
					type="button"
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
					onClick={() => handleRoleSelection("coach")}
				>
					Coach
				</button>
			</div>
		</Modal>
	);
}

export default function Tournaments() {
	const [tournaments, setTournaments] = useState([]);
	const [loggedIn, setLoggedIn] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showAlert, setShowAlert] = useState(false);
	const searchParams = useSearchParams();

	useEffect(() => {
		const fetchTournaments = async () => {
			try {
				const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getTournaments`;
				const response = await axios.get(workerUrl);

				setTournaments(response.data.tournaments);
			} catch (error) {
				console.error(error);
			}
		};

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
						setLoggedIn(true);
					}
				} catch (error) {
					setLoggedIn(false);
					console.error(error);
				}
			}
		};

		const restricted = searchParams.get("restricted");
		if (restricted === "true") {
			setShowAlert(true);
		}

		checkToken();
		fetchTournaments();
	}, [searchParams]);

	const router = useRouter();

	const handleOrganize = () => {
		if (loggedIn) {
			router.push("/tournaments/organize");
		} else {
			window.alert("You must login to organize tournaments");
			setIsModalOpen(true);
		}
	};

	const closeModal = () => {
		setShowAlert(false);
		router.push("/tournaments");
	};

	return (
		<div className="bg-black text-white min-h-screen">
			<Navbar
				setLoggedIn={setLoggedIn}
				loggedIn={loggedIn}
				setIsModalOpen={setIsModalOpen}
			/>
			<div className="p-6 max-w-7xl mx-auto">
				<section className="mb-12">
					<h2 className="text-2xl font-semibold mb-4">Popular Tournaments</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{tournaments?.map((tournament) => (
							<TournamentCard
								key={`${tournament.id}_popular`}
								tournament={tournament}
								onClick={() => router.push(`/tournaments/${tournament.id}`)}
							/>
						))}
					</div>
				</section>

				<div className="flex justify-center gap-6">
					<button
						type="button"
						className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
						onClick={handleOrganize}
					>
						Organize a Tournament
					</button>
				</div>
			</div>
			<LoginModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
			{showAlert && (
				<div className="fixed inset-0 bg-opacity-50 flex justify-center items-center px-4">
					<div className="p-6 bg-gray-900 rounded-lg shadow-lg max-w-sm w-full">
						<h2 className="text-lg font-semibold mb-3">Restricted Access</h2>
						<p className="mb-5">
							You must sign in to access the requested page.
						</p>
						<button
							type="button"
							onClick={closeModal}
							className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full"
						>
							Dismiss
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
