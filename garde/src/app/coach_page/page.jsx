"use client";

import "../globals.css";
import TopBar from "../../components/coach_page/TopBar";
import Videos from "../../components/coach_page/Videos";
import Editor from "../../components/coach_page/Editor";
import Analytics from "../../components/coach_page/Analytics";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Corrected import for jwtDecode
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CoachPage() {
	const [id, setId] = useState(""); // coach id
	const [fencers, setFencers] = useState([]); // Initially an empty array for fencers
	const [currentFencer, setCurrentFencer] = useState({}); // current fencer
	const [coachName, setCoachName] = useState("");
	const router = useRouter();

	// Fetch the coach ID and fencers
	useEffect(() => {
		try {
			const token = document.cookie
				.split("; ")
				.find((row) => row.startsWith("token="))
				?.split("=")[1];

			if (token) {
				const decoded = jwtDecode(token);
				if (decoded.type !== "coach") {
					router.push("coach_signin");
				}
				setId(decoded.id);
				setCoachName(decoded.name);
				getInfo("getCoach", decoded.id);
			} else {
				console.error("No cookies found");
				router.push("coach_signin");
			}
		} catch (error) {
			console.error(error);
			router.push("coach_signin");
		}
	}, []);

	// Update current fencer when fencers list changes
	useEffect(() => {
		if (fencers.length > 0) {
			setCurrentFencer(fencers[0]);
		} else {
			setCurrentFencer({
				coach_id: "",
				fencer_name: "No fencers added",
				fencer_id: "",
			});
		}
	}, [fencers]); // Runs whenever fencers list is updated

	async function getInfo(queryType, id) {
		const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/${queryType}/${id}`;

		try {
			const response = await axios.get(workerUrl);
			setFencers(response.data.data);
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<div>
			<TopBar
				id={id}
				fencers={fencers}
				currentFencer={currentFencer}
				setCurrentFencer={setCurrentFencer}
			/>
			<Feedback fencer={currentFencer} coachName={coachName} />
			<Analytics fencer={currentFencer} />
		</div>
	);
}

function Feedback({ fencer, coachName }) {
	return (
		<div className="flex flex-row mx-10 pt-10 text-white space-x-6">
			{/* Video Gallery */}
			<div className="w-1/2">
				<Videos fencer={fencer} />
			</div>

			{/* Editor Component */}
			<div className="w-1/2">
				<Editor fencer={fencer} coachName={coachName} />
			</div>
		</div>
	);
}
