"use client";

import "../../app/globals.css";
import AddFencerInstruction from "./components/AddFencerInstruction";
import TopBar from "./components/TopBar";
import Videos from "./components/Videos";
import Editor from "./components/Editor";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Corrected import for jwtDecode
import axios from "axios";

export default function CoachPage() {
	const [id, setId] = useState(""); // coach id
	const [fencers, setFencers] = useState([]); // Initially an empty array for fencers
	const [currentFencer, setCurrentFencer] = useState({}); // current fencer
	const [coachName, setCoachName] = useState("");

	// Fetch the coach ID and fencers
	useEffect(() => {
		console.log(document.cookie);
		const token = document.cookie
			.split("; ")
			.find((row) => row.startsWith("token="))
			?.split("=")[1];

		if (token) {
			const decoded = jwtDecode(token);
			setId(decoded.id);
			setCoachName(decoded.name);
			getInfo("getCoach", decoded.id);
		} else {
			console.log("No cookies found");
		}
	}, []); // Runs only once on mount

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

	function getInfo(queryType, id) {
		const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/${queryType}/${id}`;

		axios
			.get(workerUrl)
			.then((response) => {
				setFencers(response.data.data); // Setting the fencers data from the response
			})
			.catch((error) => console.log(error));
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
			<AddFencerInstruction />
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
