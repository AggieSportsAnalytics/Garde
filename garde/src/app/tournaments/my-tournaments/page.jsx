"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import TournamentCard from "@/src/components/tournaments/TournamentCard";
import checkAuth from "../../hooks/jwt_decode";

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
			try {
				const decoded = checkAuth(router, "tournaments", "");
				return decoded?.id;
			} catch (error) {
				console.error(error);
				router.push("/tournaments?restricted=true");
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
