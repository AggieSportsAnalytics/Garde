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
import { FaTrophy } from "react-icons/fa";
import { BiLogIn, BiLogOut } from "react-icons/bi";
import { TextGenerateEffect } from "@/src/components/ui/TextGenerateEffect";
import { BackgroundStars } from "@/src/components/ui/background-stars";
import { motion } from "framer-motion";
import { SparklesCore } from "@/src/components/ui/sparkles";

function Navbar({ setLoggedIn, loggedIn }) {
	const [menuOpen, setMenuOpen] = useState(false);
	const router = useRouter();

	const handleAuth = async () => {
		if (loggedIn) {
			try {
				await axios.get("/api/logout", {
					headers: {
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
					},
					withCredentials: true,
				});
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
		<motion.nav
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ type: "spring", stiffness: 100 }}
			className="relative flex items-center justify-between backdrop:blur- bg-slate-950 text-gray-400 p-4 border-b border-white/10 font-platypi"
		>
			{/* Back Button */}
			<motion.div
				initial={{ x: -20, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ delay: 0.2 }}
				className="z-20"
			>
				<Link href="/" className="cursor-pointer">
					<button
						type="button"
						className="bg-white text-black py-2 px-3 rounded text-base font-extrabold hover:bg-gray-400 transition-transform duration-200"
						title="Go Back"
					>
						&#8592;
					</button>
				</Link>
			</motion.div>

			<TextGenerateEffect
				duration={2}
				filter={false}
				words="Tournaments"
				className="hidden md:block text-lg md:text-2xl lg:text-3xl absolute left-1/2 -translate-x-1/2 font-bold mb-4 whitespace-nowrap"
			/>
			<div className="text-white md:hidden text-2xl absolute left-1/2 -translate-x-1/2 font-bold mb-4 whitespace-nowrap">
				Tournaments
			</div>

			{/* Menu Section */}
			<motion.div
				initial={{ x: 20, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ delay: 0.2 }}
				className="ml-auto flex items-center gap-4"
			>
				{/* Desktop Menu */}
				<div className="hidden md:flex items-center gap-6">
					<button
						className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block"
						onClick={handleMyTournamentClick}
					>
						<span className="absolute inset-0 overflow-hidden rounded-full">
							<span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
						</span>
						<div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
							<FaTrophy size={20} />
							<span>My Tournaments</span>
							<svg
								fill="none"
								height="16"
								viewBox="0 0 24 24"
								width="16"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M10.75 8.75L14.25 12L10.75 15.25"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="1.5"
								/>
							</svg>
						</div>
						<span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
					</button>
					<button
						className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block"
						onClick={handleAuth}
					>
						<span className="absolute inset-0 overflow-hidden rounded-full">
							<span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
						</span>
						<div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
							{loggedIn ? (
								<>
									<BiLogOut size={20} />
									<span>Logout</span>
								</>
							) : (
								<>
									<BiLogIn size={20} />
									<span>Sign-In/Sign-Up</span>
								</>
							)}
							<svg
								fill="none"
								height="16"
								viewBox="0 0 24 24"
								width="16"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M10.75 8.75L14.25 12L10.75 15.25"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="1.5"
								/>
							</svg>
						</div>
						<span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
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
			</motion.div>
			{/* Mobile Menu Dropdown */}
			{menuOpen && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					className="absolute top-full right-0 w-64 bg-gray-800/95 backdrop-blur-sm p-4 rounded-lg shadow-lg md:hidden z-50 mt-2"
				>
					<button
						className="w-full mb-4 bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white"
						onClick={handleMyTournamentClick}
					>
						<span className="absolute inset-0 overflow-hidden rounded-full">
							<span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
						</span>
						<div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
							<FaTrophy size={20} />
							<span>My Tournaments</span>
							<svg
								fill="none"
								height="16"
								viewBox="0 0 24 24"
								width="16"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M10.75 8.75L14.25 12L10.75 15.25"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="1.5"
								/>
							</svg>
						</div>
						<span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
					</button>
					<button
						className="w-full bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white"
						onClick={handleAuth}
					>
						<span className="absolute inset-0 overflow-hidden rounded-full">
							<span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
						</span>
						<div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
							{loggedIn ? (
								<>
									<BiLogOut size={20} />
									<span>Logout</span>
								</>
							) : (
								<>
									<BiLogIn size={20} />
									<span>Sign-In/Sign-Up</span>
								</>
							)}
							<svg
								fill="none"
								height="16"
								viewBox="0 0 24 24"
								width="16"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M10.75 8.75L14.25 12L10.75 15.25"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="1.5"
								/>
							</svg>
						</div>
						<span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
					</button>
				</motion.div>
			)}
		</motion.nav>
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

	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.3,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 },
	};

	return (
		<>
			<Loader loading={loading} />
			<div className="bg-black text-white min-h-screen flex flex-col justify-start">
				<Navbar setLoggedIn={setLoggedIn} loggedIn={loggedIn} />

				{/* Sparkles Section - Adjusted height for mobile */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8 }}
					className="w-full relative"
				>
					<div className="w-full h-24 sm:h-40 relative">
						{/* Gradients - Centered with animations */}
						<motion.div
							initial={{ opacity: 0, width: "0%" }}
							animate={{ opacity: 1, width: "80%" }}
							transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
							className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] blur-sm"
						/>
						<motion.div
							initial={{ opacity: 0, width: "0%" }}
							animate={{ opacity: 1, width: "80%" }}
							transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
							className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px"
						/>
						<motion.div
							initial={{ opacity: 0, width: "0%" }}
							animate={{ opacity: 1, width: "60%" }}
							transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
							className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] blur-sm"
						/>
						<motion.div
							initial={{ opacity: 0, width: "0%" }}
							animate={{ opacity: 1, width: "60%" }}
							transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
							className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px"
						/>

						{/* Core component with animation */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 1, delay: 0.6 }}
						>
							<SparklesCore
								background="transparent"
								minSize={0.4}
								maxSize={1}
								particleDensity={1200}
								className="w-full h-full"
								particleColor="#FFFFFF"
							/>
						</motion.div>

						{/* Radial Gradient - Centered mask with animation */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 1, delay: 0.7 }}
							className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(600px_200px_at_center_top,transparent_20%,white)]"
						/>
					</div>
				</motion.div>

				<div className="flex-1 relative">
					<BackgroundStars className="absolute inset-0">
						<div className="relative z-0 p-3 sm:p-6 max-w-7xl mx-auto">
							{/* Header Section with Buttons - Improved mobile layout */}
							<motion.div
								variants={containerVariants}
								initial="hidden"
								animate="show"
								className="flex flex-col sm:flex-row justify-start items-center gap-4 sm:gap-6 mb-8 sm:mb-12 mt-2 sm:mt-4"
							>
								<motion.button
									variants={itemVariants}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="w-full sm:w-auto shadow-[inset_0_0_0_2px_#616467] text-white px-4 sm:px-8 py-2 sm:py-3 rounded-full tracking-widest uppercase text-sm sm:text-base font-bold bg-transparent hover:bg-[#616467] hover:text-white transition duration-200"
									onClick={handleOrganize}
								>
									Organize a Tournament
								</motion.button>
								<motion.h2
									variants={itemVariants}
									className="text-xl sm:text-2xl font-semibold px-4 sm:px-8 py-2 sm:py-3 border-2 border-white/20 rounded-full bg-black/20 backdrop-blur-sm"
								>
									Popular Tournaments
								</motion.h2>
							</motion.div>

							{/* Tournament Cards Grid - Improved responsive grid */}
							<motion.div
								variants={containerVariants}
								initial="hidden"
								animate="show"
								className="w-full"
							>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
									{tournaments
										?.slice()
										.sort((a, b) => {
											const isPinnedA = pinned.includes(a.tournament_id)
												? 1
												: 0;
											const isPinnedB = pinned.includes(b.tournament_id)
												? 1
												: 0;
											return isPinnedB - isPinnedA;
										})
										.map((tournament) => (
											<motion.div
												key={`${tournament.tournament_id}_popular`}
												variants={itemVariants}
												whileHover={{ scale: 1.02 }}
												transition={{ type: "spring", stiffness: 300 }}
												className="w-full"
											>
												<TournamentCard
													tournament={tournament}
													pinned={pinned.find(
														(tour) => tour === tournament.tournament_id,
													)}
												/>
											</motion.div>
										))}
								</div>
							</motion.div>
						</div>
					</BackgroundStars>
				</div>
				<RestrictedAlert redirect={"/tournaments"} />
			</div>
		</>
	);
}
