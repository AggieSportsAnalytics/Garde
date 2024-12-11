"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import TournamentDetail from "@/src/components/tournaments/TournamentDetail";
import checkAuth from "../../hooks/jwt_decode";

export default function OrganizeTournament() {
	const router = useRouter();
	const [tok, setToken] = useState({});
	const tournamentId = uuidv4();

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		category: "",
		prize_pool: "",
		organizer_name: "",
		organizer_email: "",
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

	useEffect(() => {
		try {
			const decoded = checkAuth(router, "tournaments", "");

			setToken(decoded);

			setFormData({
				...formData,
				organizer_name: decoded.name,
				organizer_email: decoded.email,
				user_id: decoded.id,
			});
		} catch (error) {
			console.error(error);
			router.push("/tournaments?restricted=true");
		}
	}, [router]);

	const handleSubmit = async () => {
		try {
			const tournamentUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/putTournament/${tournamentId}`;

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

			const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/putOwned/${tok.id}`;
			const queryData = {
				user_type: tok.type,
				user_name: tok.name,
				user_email: tok.email,
				relation: "organizer",
				tournament_id: tournamentId,
			};

			await axios.put(workerUrl, queryData, {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error(error);
		}

		router.push("/tournaments");
	};

	return (
		<TournamentDetail
			handleSubmit={handleSubmit}
			formData={formData}
			setFormData={setFormData}
			isOrganize={true}
			backTo={"/tournaments"}
		/>
	);
}
