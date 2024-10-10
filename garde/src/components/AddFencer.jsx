import { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function AddFencer() {
	const [coachToken, setCoachToken] = useState("");
	const [status, setStatus] = useState("");
	const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/putCoachFencer`;

	const handleAddFencer = async () => {
		try {
			const token = document.cookie
				.split("; ")
				.find((row) => row.startsWith("token="))
				?.split("=")[1];

			const decoded = jwtDecode(token);
			const queryData = {
				fencerId: decoded.id,
				fencerName: decoded.name,
				coachId: coachToken,
				fencerEmail: decoded.email,
			};

			const response = await axios.put(workerUrl, queryData, {
				headers: { "Content-Type": "application/json" },
			});

			if (response.status >= 200 && response.status < 300) {
				setStatus("Added to coach successfully!");
			} else {
				setStatus("Failed to add fencer.");
			}
		} catch (error) {
			setStatus("Error adding fencer.");
			console.error(error);
		}
	};

	return (
		<div>
			<input
				className="text-black"
				type="text"
				placeholder="Enter coach access token"
				value={coachToken}
				onChange={(e) => setCoachToken(e.target.value)}
			/>
			<button onClick={handleAddFencer}>Join Coach</button>
			{status && <p>{status}</p>}
		</div>
	);
}
