"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import axiosInstance from "@/src/components/axios";
import Link from "next/link";
import TournamentCard from "@/src/components/tournaments/TournamentCard";
import checkAuth from "../hooks/jwt_verify";
import RestrictedAlert from "@/src/components/ui/RestrictedAlert";
import Loader from "@/src/components/ui/Loader";

function Navbar({ setLoggedIn, loggedIn }) {
	const [menuOpen, setMenuOpen] = useState(false);
	const router = useRouter();

	const handleAuth = async () => {
		if (loggedIn) {
			try {
				await axios.get("/api/logout", { withCredentials: true });
				setLoggedIn(false);
			} catch (error) {
				console.error(error);
			}
		} else {
			router.push("/signin?redirect=/tournaments");
		}
	};

	const handleMyTournamentClick = () => {
		router.push("/tournaments/my-tournaments");
	};

	return (
		<nav className="relative flex items-center justify-between bg-gray-900 text-white p-4 shadow-md">
			{/* Back Button */}
			<Link href="/" className="cursor-pointer">
				<button
					type="button"
					className="bg-white text-black py-2 px-3 rounded text-base font-semibold hover:bg-gray-300 transition-transform duration-200 hover:scale-110 active:scale-100"
					title="Go Back"
				>
					&#8592;
				</button>
			</Link>

			{/* Title */}
			<h1 className="text-2xl sm:text-xl md:text-3xl absolute left-1/2 transform -translate-x-1/2 font-bold">
				Tournaments
			</h1>

			{/* Menu Section */}
			<div className="ml-auto flex items-center gap-4">
				{/* Desktop Menu */}
				<div className="hidden md:flex gap-4">
					<button
						type="button"
						className="hover:text-blue-500"
						onClick={handleMyTournamentClick}
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

				{/* Mobile Hamburger Menu */}
				<div className="md:hidden">
					<button
						type="button"
						className="p-2 rounded focus:outline-none hover:bg-gray-700"
						onClick={() => setMenuOpen((prev) => !prev)}
					>
						{/* Hamburger Icon */}
						<div className="space-y-1">
							<div className="w-6 h-1 bg-white" />
							<div className="w-6 h-1 bg-white" />
							<div className="w-6 h-1 bg-white" />
						</div>
					</button>
				</div>
			</div>

			{menuOpen && (
				<div className="absolute top-full right-0 w-full bg-gray-800 p-4 md:hidden z-50">
					<button
						type="button"
						className="block w-full text-left text-white hover:text-blue-500 mb-2"
						onClick={handleMyTournamentClick}
					>
						My Tournaments
					</button>
					<button
						type="button"
						className="block w-full text-left text-white hover:text-blue-500"
						onClick={handleAuth}
					>
						{loggedIn ? "Logout" : "Signin"}
					</button>
				</div>
			)}
		</nav>
	);
}

export default function TournamentsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Tournaments />
		</Suspense>
	);
}

function Tournaments() {
	const [tournaments, setTournaments] = useState([]);
	const [loggedIn, setLoggedIn] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const fetchTournaments = async () => {
			try {
				setLoading(true);
				const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getTournaments`;
				const response = await axiosInstance.get(workerUrl);

				setTournaments(response.data.tournaments);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		const checkToken = async () => {
			try {
				const decoded = await checkAuth(router, "tournaments", "", true);

				if (decoded) {
					setLoggedIn(true);
				}

				const expirationTime = decoded?.exp * 1000 - Date.now();
				if (!Number.isNaN(expirationTime)) {
					const timer = setTimeout(() => {
						alert("Your session has expired. Please log in again.");
						setLoggedIn(false);
					}, expirationTime);

					return () => clearTimeout(timer);
				}
			} catch (error) {
				console.error(error);
				router.push("tournaments?restricted=true");
				setLoggedIn(false);
			}
		};

		checkToken();
		fetchTournaments();
	}, [router]);

	const handleOrganize = () => {
		router.push("/tournaments/organize");
	};

	return (
		<>
			<Loader loading={loading} />
			<div className="bg-black text-white min-h-screen">
				<Navbar setLoggedIn={setLoggedIn} loggedIn={loggedIn} />
				<div className="p-6 max-w-7xl mx-auto">
					<section className="mb-12">
						<h2 className="text-2xl font-semibold mb-4">Popular Tournaments</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{tournaments?.map((tournament) => (
								<TournamentCard
									key={`${tournament.id}_popular`}
									tournament={tournament}
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
				<RestrictedAlert redirect={"/tournaments"} />
			</div>
		</>
	);
}
