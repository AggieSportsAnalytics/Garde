"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

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
export default function MyTournaments() {
	const [pTournies, setPTournies] = useState([]);
	const [oTournies, setOTournies] = useState([]);
	const router = useRouter();

	useEffect(() => {
		const fetchTournaments = async (id) => {
			try {
				const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getMyTournaments/${id}`;
				const response = await axios.get(workerUrl);

				const allTournaments = response.data.tournaments;
				const participating = allTournaments.filter(
					(tournament) => tournament.user_id !== id,
				);
				const organizing = allTournaments.filter(
					(tournament) => tournament.user_id === id,
				);

				setPTournies(participating);
				setOTournies(organizing);
			} catch (error) {
				console.error("Failed to fetch tournaments:", error);
			}
		};

		const checkToken = async () => {
			const token = document.cookie
				.split("; ")
				.find((row) => row.startsWith("token="))
				?.split("=")[1];

			if (!token) {
				router.push("/tournaments");
				return null;
			}

			try {
				const decoded = jwtDecode(token);
				const currentTime = Date.now() / 1000;
				if (decoded.exp <= currentTime) {
					router.push("/tournaments");
					return null;
				}
				return decoded.id;
			} catch (error) {
				console.error("Invalid token:", error);
				router.push("/tournaments");
				return null;
			}
		};

		(async () => {
			const id = await checkToken();
			if (id) {
				await fetchTournaments(id);
			}
		})();
	}, [router]);

	return (
		<div className="p-6 max-w-7xl mx-auto text-white min-h-screen">
			<Link href="/tournaments" className="cursor-pointer">
				<button
					type="button"
					className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 transition-transform duration-200 hover:scale-110 active:scale-100"
					title="Go Back"
				>
					&#8592;
				</button>
			</Link>
			<h1 className="text-4xl font-bold mb-8 text-center">My Tournaments</h1>

			{/* Organizing Tournaments */}
			<section className="mb-12">
				<h2 className="text-2xl font-semibold mb-4">Organizing Tournaments</h2>
				{oTournies.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{oTournies.map((tournament) => (
							<TournamentCard
								key={`${tournament.id}_organizing`}
								tournament={tournament}
								onClick={() => router.push(`/tournaments/${tournament.id}`)}
							/>
						))}
					</div>
				) : (
					<p className="text-gray-400">
						You are not organizing any tournaments.
					</p>
				)}
			</section>

			{/* Participating Tournaments */}
			<section>
				<h2 className="text-2xl font-semibold mb-4">
					Participating Tournaments
				</h2>
				{pTournies.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{pTournies.map((tournament) => (
							<TournamentCard
								key={`${tournament.id}_participating`}
								tournament={tournament}
								onClick={() => router.push(`/tournaments/${tournament.id}`)}
							/>
						))}
					</div>
				) : (
					<p className="text-gray-400">
						You are not participating in any tournaments.
					</p>
				)}
			</section>
		</div>
	);
}
