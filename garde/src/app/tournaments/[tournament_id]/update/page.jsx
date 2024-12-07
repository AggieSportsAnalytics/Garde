"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import TournamentDetail from "@/src/components/tournaments/TournamentDetail";
import { useSelector } from "react-redux";

export default function UpdateTournament({ params }) {
	const router = useRouter();
	const { tournament_id } = params;

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		category: "",
		prize_pool: "",
		organizer_phone: "",
		location: "",
		privacy: "public",
		start_time: "",
		end_time: "",
		registration_fee: "",
		max_participants: "",
		eligibility: "",
		is_team_based: false,
		rules: "",
		signup_deadline: "",
	});

	const selectedTournament = useSelector(
		(state) => state.tournament.selectedTournament,
	);

	useEffect(() => {
		const fetchTournament = async () => {
			try {
				const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getTournament/${tournament_id}`;
				const response = await axios.get(workerUrl);
				return response.data.tournament[0];
			} catch (error) {
				console.error("Error fetching tournament:", error);
				return null;
			}
		};

		const validateAndSetData = async () => {
			const tournamentData =
				selectedTournament?.unique_id === tournament_id
					? selectedTournament
					: await fetchTournament();

			// Token validation
			try {
				const token = document.cookie
					.split("; ")
					.find((row) => row.startsWith("token="))
					?.split("=")[1];

				if (!token) {
					console.error("No cookies found");
					router.push("/tournaments?restricted=true");
					return;
				}

				const decoded = jwtDecode(token);
				const currentTime = Date.now() / 1000;

				if (
					decoded.exp <= currentTime ||
					tournamentData?.user_id !== decoded?.id
				) {
					router.push("/tournaments?restricted=true");
					return;
				}

				// Set form data if validation passes
				setFormData({
					name: tournamentData?.event_name || "",
					description: tournamentData?.description || "",
					category: tournamentData?.category || "",
					prize_pool: tournamentData?.prize_pool || "",
					organizer_phone: tournamentData?.organizer_phone || "",
					location: tournamentData?.location || "",
					privacy: tournamentData?.privacy || "public",
					start_time: tournamentData?.start_time || "",
					end_time: tournamentData?.end_time || "",
					signup_deadline: tournamentData?.signup_deadline || "",
					registration_fee: tournamentData?.registration_fee || "",
					max_participants: tournamentData?.max_participants || "",
					eligibility: tournamentData?.eligibility || "",
					is_team_based: tournamentData?.is_team_based || false,
					rules: tournamentData?.rules || "",
				});
			} catch (error) {
				console.error("Token validation error:", error);
				router.push("/tournaments?restricted=true");
			}
		};

		validateAndSetData();
	}, [router, tournament_id, selectedTournament]);

	const handleSubmit = async () => {
		try {
			const tournamentUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/updateTournament/${tournament_id}`;

			const updatedFormData = {
				...formData,
				signup_deadline:
					formData.signup_deadline === "" || !formData.signup_deadline
						? formData.start_time
						: formData.signup_deadline,
			};

			await axios.put(tournamentUrl, updatedFormData, {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error(error);
		}

		router.push(`/tournaments/${tournament_id}`);
	};

	return (
		<TournamentDetail
			handleSubmit={handleSubmit}
			formData={formData}
			setFormData={setFormData}
			isOrganize={false}
			backTo={`/tournaments/${tournament_id}`}
		/>
	);
}
