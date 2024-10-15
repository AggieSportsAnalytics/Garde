"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2"; // Import Chart.js
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js"; // Import the necessary components from Chart.js

// Register the necessary Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
);

function Analytics({ fencer }) {
	const [fencerSessions, setFencerSessions] = useState([]);

	useEffect(() => {
		console.log(fencer);
		const getFencerData = async () => {
			const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getFencerAngles/${fencer.fencer_id}`;
			return await axios.get(workerUrl);
		};

		getFencerData()
			.then((res) => setFencerSessions(res.data.angles.results))
			.catch((error) => console.log(error));
	}, [fencer]);

	// Prepare the data for the chart
	const chartData = {
		labels: fencerSessions.map((_, index) => `Session ${index + 1}`), // Label for each session
		datasets: [
			{
				label: "Accuracy (%)",
				data: fencerSessions.map((session) => session.accuracy), // Accuracy data for each session
				borderColor: "rgba(75, 192, 192, 1)", // Line color
				backgroundColor: "rgba(75, 192, 192, 0.2)", // Fill color under the line
				fill: true, // Fill under the line
			},
		],
	};

	// Chart options
	const chartOptions = {
		responsive: true,
		plugins: {
			legend: {
				display: true,
				position: "top",
			},
			title: {
				display: true,
				text: `Fencer ${fencer.name}'s Accuracy Over Sessions`,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				max: 100, // Set max to 100% for accuracy
				ticks: {
					stepSize: 10, // Set the interval of the y-axis ticks
				},
			},
		},
	};

	return (
		<div className="p-4 bg-gray-900 rounded-lg shadow-lg mt-10">
			<h2 className="text-white text-xl mb-4">
				Fencer {fencer.name}'s Sessions
			</h2>

			{fencerSessions.length > 0 ? (
				<>
					{/* Render the chart */}
					<div className="mb-8">
						<Line data={chartData} options={chartOptions} />
					</div>

					{/* Display session details */}
					<div className="text-white space-y-2">
						{fencerSessions.map((session, i) => (
							<div
								key={`${i}_${session}`}
								className="bg-gray-800 p-2 rounded-md"
							>
								Session #{i + 1}: {session.accuracy}% accuracy
							</div>
						))}
					</div>
				</>
			) : (
				<p className="text-gray-400">Loading fencer data...</p>
			)}
		</div>
	);
}

export default Analytics;
