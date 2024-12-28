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
import renewSession from "@/src/app/hooks/renew_session";
import { Trophy, LogIn, LogOut } from "lucide-react";
import { TextGenerateEffect } from "@/src/components/ui/TextGenerateEffect";

const words = "Fencing Tournaments Powered by Garde";

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
		<nav className="relative flex items-center justify-between backdrop-blur-sm bg-black/10 text-white p-4 border-b border-white/10">
			{/* Back Button */}
			<Link href="/" className="cursor-pointer">
				<button
					type="button"
						className="bg-red-600 text-black py-2 px-3 rounded text-base font-extrabold hover:bg-red-500 transition-transform duration-200"
						title="Go Back"
				>
					X
				</button>
			</Link>

			{/* Replace static title with TextGenerateEffect */}
			<TextGenerateEffect 
				duration={2} 
				filter={false} 
				words={words} 
				className="text-2xl sm:text-base md:text-3xl absolute left-1/2 transform -translate-x-1/2 font-bold mb-4"
			/>

			{/* Menu Section */}
			<div className="ml-auto flex items-center gap-4">
				{/* Desktop Menu */}
				<div className="hidden md:flex items-center gap-6">
					<button
						type="button"
						className="flex items-center gap-2 hover:text-blue-500 transition-colors duration-200"
						onClick={handleMyTournamentClick}
					>
						<Trophy className="w-5 h-5" />
						<span>My Tournaments</span>
					</button>
					<button
						type="button"
						className="flex items-center gap-2 hover:text-blue-500 transition-colors duration-200"
						onClick={handleAuth}
					>
						{loggedIn ? (
							<>
								<LogOut className="w-5 h-5" />
								<span>Logout</span>
							</>
						) : (
							<>
								<LogIn className="w-5 h-5" />
								<span>Sign-In/Sign-Up</span>
							</>
						)}
					</button>
				</div>

				{/* Mobile Menu Button */}
				<div className="md:hidden">
					<button
						type="button"
						className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
						onClick={() => setMenuOpen((prev) => !prev)}
					>
						<div className="space-y-1">
							<div className="w-6 h-1 bg-white" />
							<div className="w-6 h-1 bg-white" />
							<div className="w-6 h-1 bg-white" />
						</div>
					</button>
				</div>
			</div>

			{/* Mobile Menu Dropdown */}
			{menuOpen && (
				<div className="absolute top-full right-0 w-48 bg-gray-800/95 backdrop-blur-sm p-4 rounded-lg shadow-lg md:hidden z-50 mt-2">
					<button
						type="button"
						className="flex items-center gap-2 w-full text-left text-white hover:text-blue-500 mb-4 transition-colors duration-200"
						onClick={handleMyTournamentClick}
					>
						<Trophy className="w-5 h-5" />
						<span>My Tournaments</span>
					</button>
					<button
						type="button"
						className="flex items-center gap-2 w-full text-left text-white hover:text-blue-500 transition-colors duration-200"
						onClick={handleAuth}
					>
						{loggedIn ? (
							<>
								<LogOut className="w-5 h-5" />
								<span>Logout</span>
							</>
						) : (
							<>
								<LogIn className="w-5 h-5" />
								<span>Sign-In/Sign-Up</span>
							</>
						)}
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
	const [pinned, setPinned] = useState([]);
	const router = useRouter();

	useEffect(() => {
		const getPinned = () => {
			const pin = localStorage.getItem("pinnedTournament");
			if (pin) {
				setPinned(JSON.parse(pin));
			}
		};

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
				if (!Number.isNaN(expirationTime) && expirationTime > 0) {
					renewSession(decoded).then((val) => {
						if (!val) {
							alert("Your session has expired. Please log in again.");
							setLoggedIn(false);
						}
					});
				}
			} catch (error) {
				console.error(error);
				router.push("/tournaments?restricted=true");
				setLoggedIn(false);
			}
		};

		checkToken();
		fetchTournaments();
		getPinned();
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
									key={`${tournament.tournament_id}_popular`}
									tournament={tournament}
									pinned={pinned.find(
										(tour) => tour === tournament.tournament_id,
									)}
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
