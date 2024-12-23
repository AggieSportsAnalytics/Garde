"use client";

import { useState, useEffect } from "react";
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
import axiosInstance from "../axios";

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

function Analytics({ fencer, currentVideo, videos }) {
	const [allSessions, setAllSessions] = useState([]);
	const [fencerSessions, setFencerSessions] = useState([]);
	const poses = ["onguard", "lunge", "advance", "retreat"];
	const [selectedPose, setSelectedPose] = useState(poses[0]);

	const determineIndex = (videoId) => {
		const index = videos.findIndex((video) => video.key === videoId);

		return index !== -1 ? index + 1 : -1;
	};

	useEffect(() => {
		const getFencerData = async () => {
			try {
				const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getFencerAngles/${fencer.fencer_id}`;
				const response = await axiosInstance.get(workerUrl);
				setFencerSessions(
					response.data.angles.results.filter(
						(session) => session.pose === selectedPose,
					),
				);
				setAllSessions(response.data.angles.results);
			} catch (error) {
				console.error(error);
			}
		};

		getFencerData();
	}, [fencer]);

	useEffect(() => {
		let currentPose = selectedPose;
		if (!currentVideo && selectedPose === "all") {
			setSelectedPose("onguard");
			currentPose = "onguard";
		}

		setFencerSessions(
			allSessions.filter(
				(session) =>
					session.video_id === (currentVideo || session.video_id) &&
					(session.pose === currentPose || currentPose === "all"),
			),
		);
	}, [currentVideo, selectedPose]);

	useEffect(() => {
		if (currentVideo) {
			setSelectedPose("all");
		}
	}, [currentVideo]);

	// Prepare chart data for metrics
	const metricsData = {
		labels: fencerSessions.map((session) => session.timestamp),
		datasets: [
			{
				label: "Speed (m/s)",
				data: fencerSessions.map((session) => Math.abs(session.speed)),
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
				text: `Fencer ${fencer.fencer_name}'s Data Over Time`,
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

	const Cards = ({ fencerSessions }) => {
		return (
			<div className="text-white flex flex-wrap gap-6 mt-4 h-[600px] overflow-y-auto">
				{fencerSessions.map((session, i) => (
					<div
						key={`${i}_${session.timestamp}`}
						className="bg-gray-800 p-4 rounded-lg w-full sm:w-[48%] md:w-[31%] lg:w-[23%] border border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300"
					>
						<h3 className="text-lg font-semibold text-blue-400 mb-2">
							Video #{determineIndex(session.video_id)}
						</h3>
						<ul className="space-y-1 text-sm">
							<li>
								<span className="font-medium">Timestamp:</span>{" "}
								{new Date(session.timestamp).toLocaleString()}
							</li>
							<li>
								<span className="font-medium">Pose:</span> {session.pose}
							</li>
							<li>
								<span className="font-medium">Speed:</span>{" "}
								{session.speed.toFixed(3)} m/s
							</li>
							<li>
								<span className="font-medium">Feet Distance:</span>{" "}
								{session.feet_distance.toFixed(3)} m
							</li>
							<li>
								<span className="font-medium">Elbow Left:</span>{" "}
								{session.elbow_left.toFixed(3)}°
							</li>
							<li>
								<span className="font-medium">Elbow Right:</span>{" "}
								{session.elbow_right.toFixed(3)}°
							</li>
							<li>
								<span className="font-medium">Hip Left:</span>{" "}
								{session.hip_left.toFixed(3)}°
							</li>
							<li>
								<span className="font-medium">Hip Right:</span>{" "}
								{session.hip_right.toFixed(3)}°
							</li>
							<li>
								<span className="font-medium">Knee Left:</span>{" "}
								{session.knee_left.toFixed(3)}°
							</li>
							<li>
								<span className="font-medium">Knee Right:</span>{" "}
								{session.knee_right.toFixed(3)}°
							</li>
						</ul>
					</div>
				))}
			</div>
		);
	};

	return (
		<div className="p-4 bg-gray-900 rounded-lg shadow-lg mt-10">
			<div className="flex flex-row items-center">
				<h2 className="text-white text-xl mb-4">
					Fencer {fencer.name}'s Sessions
				</h2>
				<select
					value={selectedPose}
					onChange={(event) => setSelectedPose(event.target.value)}
					className="ml-4 mb-4 px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-600 transition duration-200"
				>
					{currentVideo
						? ["all", ...poses].map((pose) => (
								<option key={pose} className="bg-gray-800 text-white">
									{pose}
								</option>
							))
						: poses.map((pose) => (
								<option key={pose} className="bg-gray-800 text-white">
									{pose}
								</option>
							))}
				</select>
			</div>

			{fencerSessions.length > 0 ? (
				<>
					{currentVideo ? (
						<Cards fencerSessions={fencerSessions} />
					) : (
						<>
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
							<Cards fencerSessions={fencerSessions} />
						</>
					)}
				</>
			) : (
				<p className="text-gray-400">No sessions to display</p>
			)}
		</div>
	);
}

export default Analytics;
