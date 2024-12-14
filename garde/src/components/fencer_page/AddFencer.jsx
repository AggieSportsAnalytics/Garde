import { useState } from "react";
import axios from "axios";

export default function AddFencer({ decoded }) {
	const [coachToken, setCoachToken] = useState("");
	const [status, setStatus] = useState("");
	const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/putCoachFencer`;

	const handleAddFencer = async () => {
		try {
			const queryData = {
				fencerId: decoded.id,
				fencerName: decoded.name,
				coachId: coachToken,
				fencerEmail: decoded.email,
			};

			await axios.put(workerUrl, queryData, {
				withCredentials: true,
				headers: { "Content-Type": "application/json" },
			});

			setStatus("Added to coach successfully!");
			setCoachToken("");
		} catch (error) {
			setStatus("Error adding fencer.");
			console.error(error);
		} finally {
			setTimeout(() => setStatus(""), 2000);
		}
	};

	return (
		<div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-lg mt-10">
			<h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
				Join a Coach
			</h2>

			<input
				className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 mb-4"
				type="text"
				placeholder="Enter coach access token"
				value={coachToken}
				onChange={(e) => setCoachToken(e.target.value)}
			/>

			<button
				type="button"
				onClick={handleAddFencer}
				className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
			>
				Join Coach
			</button>

			{status && (
				<p
					className={`mt-4 text-center text-lg font-medium ${
						status.includes("successfully") ? "text-green-500" : "text-red-500"
					}`}
				>
					{status}
				</p>
			)}
		</div>
	);
}
