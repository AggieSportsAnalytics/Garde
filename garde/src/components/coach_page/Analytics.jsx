"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns"; // Import the date adapter

// Register necessary components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	TimeScale,
);

function Analytics({ fencer }) {
	const [fencerSessions, setFencerSessions] = useState([]);

	useEffect(() => {
		const getFencerData = async () => {
			try {
				const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getFencerAngles/${fencer.fencer_id}`;
				const response = await axios.get(workerUrl);
				setFencerSessions(response.data.angles.results);
			} catch (error) {
				console.error(error);
			}
		};

		getFencerData();
	}, [fencer]);

	// Prepare chart data for metrics
	const metricsData = {
		labels: fencerSessions.map((session) => session.timestamp),
		datasets: [
			{
				label: "Accuracy (%)",
				data: fencerSessions.map((session) => session.accuracy),
				borderColor: "rgba(75, 192, 192, 1)",
				backgroundColor: "rgba(75, 192, 192, 0.2)",
				fill: true,
			},
			{
				label: "Speed (m/s)",
				data: fencerSessions.map((session) => session.speed),
				borderColor: "rgba(255, 99, 132, 1)",
				backgroundColor: "rgba(255, 99, 132, 0.2)",
				fill: true,
			},
			{
				label: "Feet Distance (m)",
				data: fencerSessions.map((session) => session.feet_distance),
				borderColor: "rgba(54, 162, 235, 1)",
				backgroundColor: "rgba(54, 162, 235, 0.2)",
				fill: true,
			},
		],
	};

	// Prepare chart data for angles
	const anglesData = {
		labels: fencerSessions.map((session) => session.timestamp),
		datasets: [
			{
				label: "Elbow Left (°)",
				data: fencerSessions.map((session) => session.elbow_left),
				borderColor: "rgba(153, 102, 255, 1)",
				backgroundColor: "rgba(153, 102, 255, 0.2)",
				fill: true,
			},
			{
				label: "Elbow Right (°)",
				data: fencerSessions.map((session) => session.elbow_right),
				borderColor: "rgba(255, 159, 64, 1)",
				backgroundColor: "rgba(255, 159, 64, 0.2)",
				fill: true,
			},
			{
				label: "Hip Left (°)",
				data: fencerSessions.map((session) => session.hip_left),
				borderColor: "rgba(199, 199, 199, 1)",
				backgroundColor: "rgba(199, 199, 199, 0.2)",
				fill: true,
			},
			{
				label: "Hip Right (°)",
				data: fencerSessions.map((session) => session.hip_right),
				borderColor: "rgba(255, 206, 86, 1)",
				backgroundColor: "rgba(255, 206, 86, 0.2)",
				fill: true,
			},
			{
				label: "Knee Left (°)",
				data: fencerSessions.map((session) => session.knee_left),
				borderColor: "rgba(75, 192, 192, 1)",
				backgroundColor: "rgba(75, 192, 192, 0.2)",
				fill: true,
			},
			{
				label: "Knee Right (°)",
				data: fencerSessions.map((session) => session.knee_right),
				borderColor: "rgba(54, 162, 235, 1)",
				backgroundColor: "rgba(54, 162, 235, 0.2)",
				fill: true,
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
				text: `Fencer ${fencer.name}'s Data Over Time`,
			},
		},
		scales: {
			x: {
				type: "time",
				time: {
					unit: "minute",
				},
				title: {
					display: true,
					text: "Timestamp",
				},
			},
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: "Values",
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
					{/* Side-by-side Charts */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-gray-800 p-2 rounded-md">
							<h3 className="text-white text-lg mb-2">General Metrics</h3>
							<Line data={metricsData} options={chartOptions} />
						</div>
						<div className="bg-gray-800 p-2 rounded-md">
							<h3 className="text-white text-lg mb-2">Angles</h3>
							<Line data={anglesData} options={chartOptions} />
						</div>
					</div>

					{/* Session Details */}
					<div className="text-white space-y-2 mt-4">
						{fencerSessions.map((session, i) => (
							<div
								key={`${i}_${session.timestamp}`}
								className="bg-gray-800 p-2 rounded-md"
							>
								Session #{i + 1}:
								<ul>
									<li>Timestamp: {session.timestamp}</li>
									<li>Accuracy: {session.accuracy}%</li>
									<li>Speed: {session.speed} m/s</li>
									<li>Feet Distance: {session.feet_distance} m</li>
									<li>Elbow Left: {session.elbow_left}°</li>
									<li>Elbow Right: {session.elbow_right}°</li>
									<li>Hip Left: {session.hip_left}°</li>
									<li>Hip Right: {session.hip_right}°</li>
									<li>Knee Left: {session.knee_left}°</li>
									<li>Knee Right: {session.knee_right}°</li>
								</ul>
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
