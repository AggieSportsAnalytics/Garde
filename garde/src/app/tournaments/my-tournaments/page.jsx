"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import TournamentCard from "@/src/components/tournaments/TournamentCard";
import checkAuth from "../../hooks/jwt_verify";
import axiosInstance from "@/src/components/axios";
import Loader from "@/src/components/ui/Loader";
import renewSession from "../../hooks/renew_session";

export default function MyTournaments() {
	const [pTournies, setPTournies] = useState([]);
	const [oTournies, setOTournies] = useState([]);
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

		const fetchTournaments = async (id) => {
			try {
				setLoading(true);
				const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getMyTournaments/${id}`;
				const response = await axiosInstance.get(workerUrl);

				const allTournaments = response.data.tournaments;
				const participating = allTournaments?.filter(
					(tournament) => tournament.user_id !== id,
				);
				const organizing = allTournaments?.filter(
					(tournament) => tournament.user_id === id,
				);

				setPTournies(participating);
				setOTournies(organizing);
			} catch (error) {
				console.error("Failed to fetch tournaments:", error);
			} finally {
				setLoading(false);
			}
		};

		const checkToken = async () => {
			try {
				const decoded = await checkAuth(router, "tournaments", "");
				return decoded;
			} catch (error) {
				console.error(error);
				router.push("/tournaments?restricted=true");
			}
		};

		getPinned();
		(async () => {
			const decoded = await checkToken();
			if (decoded?.id) {
				await fetchTournaments(decoded.id);

				renewSession(decoded).then((val) => {
					if (!val) {
						alert("Your session has expired. Please log in again.");
						router.push("/tournaments");
					}
				});

				return () => clearTimeout(timer);
			}
		})();
	}, [router]);

	return (
		<>
			<Loader loading={loading} />
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
					<h2 className="text-2xl font-semibold mb-4">
						Organizing Tournaments
					</h2>
					{oTournies?.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{oTournies
								?.slice()
								.sort((a, b) => {
									const isPinnedA = pinned.includes(a.tournament_id) ? 1 : 0;
									const isPinnedB = pinned.includes(b.tournament_id) ? 1 : 0;
									return isPinnedB - isPinnedA;
								})
								.map((tournament) => (
									<TournamentCard
										key={`${tournament.id}_organizing`}
										tournament={tournament}
										pinned={pinned.find(
											(tour) => tour === tournament.tournament_id,
										)}
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
					{pTournies?.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{pTournies
								?.slice()
								.sort((a, b) => {
									const isPinnedA = pinned.includes(a.tournament_id) ? 1 : 0;
									const isPinnedB = pinned.includes(b.tournament_id) ? 1 : 0;
									return isPinnedB - isPinnedA;
								})
								.map((tournament) => (
									<TournamentCard
										key={`${tournament.id}_participating`}
										tournament={tournament}
										pinned={pinned.find(
											(tour) => tour === tournament.tournament_id,
										)}
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
		</>
	);
}
