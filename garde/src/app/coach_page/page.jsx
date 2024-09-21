"use client";

import "../../app/globals.css";
import React, { useEffect, useState /*useRef*/ } from "react";
import { Pie } from "react-chartjs-2";
// import "chart.js/auto";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
// import { createFencerInstruction } from "../../../prisma/fencer_instructions";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { Button, Input } from "antd";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import axios from "axios";
// import { FormEvent } from "react";
import Logout from "../../components/Logout";
import { jwtDecode } from "jwt-decode"; // To decode the token
import DeleteAccountButton from "../../components/DeleteAccount";

export default function CoachPage() {
	const [coachFencers, setCoachFencers] = useState({});
	const [currentFencer, setCurrentFencer] = useState("");
	const [fencerData, setFencerData] = useState({});
	const [id, setId] = useState("");

	useEffect(() => {
		const token = document.cookie
			.split("; ")
			.find((row) => row.startsWith("token="))
			?.split("=")[1];

		if (token) {
			const decoded = jwtDecode(token);
			setId(decoded.id);
			getInfo("getCoach", decoded.id);
		} else {
			console.log("No cookies found");
		}
	}, []);

	return (
		<div>
			<DeleteAccountButton type="coach" otherId="" />
			<UuidReveal uuid={id} />
			<TopBar />
			<Feedback />
			{/* <Analytics /> */}
			<AddFencerInstruction />
		</div>
	);
}

function UuidReveal({ uuid }) {
	const [isRevealed, setIsRevealed] = useState(false);

	const handleToggle = () => {
		setIsRevealed(!isRevealed);
	};

	return (
		<div className="text-white">
			<p>{isRevealed ? uuid : "••••••••••••••••••••••••••••••••••"}</p>
			<button onClick={handleToggle}>
				{isRevealed ? "Hide ID" : "Reveal ID"}
			</button>
		</div>
	);
}

function Feedback() {
	return (
		<div className="flex flex-row w-full pt-10 text-white">
			<Videos />
			<Editor />
		</div>
	);
}

function Videos() {
	const videos = [
		{
			id: 1,
			thumbnail: "/fencing-thumbnail.png",
			videoUrl: "/fencing-demo.mov",
		},
		{
			id: 2,
			thumbnail: "/fencing-thumbnail.png",
			videoUrl: "/fencing-demo.mov",
		},
		{
			id: 3,
			thumbnail: "/fencing-thumbnail.png",
			videoUrl: "/fencing-demo.mov",
		},
		{
			id: 4,
			thumbnail: "/fencing-thumbnail.png",
			videoUrl: "/fencing-demo.mov",
		},
		{
			id: 5,
			thumbnail: "/fencing-thumbnail.png",
			videoUrl: "/fencing-demo.mov",
		},
	];

	const [selectedVideo, setSelectedVideo] = useState(null);

	if (selectedVideo) {
		return (
			<div className="video-player w-1/2 ml-10 rounded-xl">
				<div className="video-wrapper" style={{ height: "384px" }}>
					<video className="rounded-xl border border-white" controls>
						<source src={selectedVideo.videoUrl} type="video/mp4" />
						Your browser does not support the video tag.
					</video>
				</div>
				<div className="text-center">
					<button
						type="button"
						onClick={() => setSelectedVideo(null)}
						className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
					>
						Back to video gallery
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="video-thumbnails border border-white w-1/2 h-96 ml-10 rounded-xl flex flex-wrap overflow-y-auto">
			{videos.map((video) => (
				<div key={video.id} className="thumbnail w-1/4 p-1">
					<img
						src={video.thumbnail}
						alt="Video thumbnail"
						className="w-full h-auto cursor-pointer"
						onClick={() => setSelectedVideo(video)}
					/>
				</div>
			))}
		</div>
	);
}

function Editor() {
	const editor = useEditor({
		extensions: [StarterKit],
		content: "Enter feedback",
	});

	const handleSubmit = () => {
		editor.commands.setContent("Enter feedback");
		console.log("Submitting feedback:", editor.getHTML());
	};

	return (
		<div className="text-black editor-content w-1/2 pr-10 ml-10">
			<EditorContent editor={editor} />
			<div className="text-center">
				<button
					type="button"
					className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
					onClick={handleSubmit}
				>
					Submit Feedback
				</button>
			</div>
		</div>
	);
}

function Analytics() {
	const [pieData, setPieData] = useState({ labels: [], values: [] });
	const [lineData, setLineData] = useState([
		{ name: "", accuracy: 0 },
		{ name: "", accuracy: 0 },
	]);

	useEffect(() => {
		setPieData({
			labels: ["Advance", "Retreat", "Lunge"],
			values: [12, 19, 3],
		});
		setLineData([
			{ name: "1", accuracy: 35 },
			{ name: "2", accuracy: 45 },
			{ name: "3", accuracy: 30 },
			{ name: "4", accuracy: 60 },
		]);
	}, []);

	return (
		<section className="text-white">
			<p className="text-center text-2xl py-10">Analytics</p>
			<div className="flex justify-center items-center space-x-4 w-full">
				<PieChart data={pieData} />
				<LineGraph data={lineData} />
			</div>
		</section>
	);
}

function PieChart({ data }) {
	const chartData = {
		labels: data.labels,
		datasets: [
			{
				data: data.values,
				backgroundColor: [
					"#FF6384",
					"#36A2EB",
					"#FFCE56",
					"#cc65fe",
					"#445ce2",
				],
				hoverBackgroundColor: [
					"#FF6384",
					"#36A2EB",
					"#FFCE56",
					"#cc65fe",
					"#445ce2",
				],
			},
		],
	};

	const options = {
		plugins: {
			tooltip: {
				callbacks: {
					label: (context) => {
						let label = "";
						if (context.parsed !== null) {
							label += ` ${context.parsed} seconds`;
						}
						return label;
					},
				},
			},
		},
	};

	return (
		<div className="h-80 w-80">
			<Pie data={chartData} options={options} />
		</div>
	);
}

function LineGraph({ data }) {
	return (
		<ResponsiveContainer width={700} height={300}>
			<LineChart
				data={data}
				margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis
					dataKey="name"
					label={{
						value: "Session",
						position: "insideBottom",
						offset: -20,
					}}
				/>
				<YAxis
					label={{
						value: "Average Accuracy",
						angle: -90,
						position: "insideLeft",
						dx: -10,
						dy: 80,
					}}
					tickFormatter={(accuracy) => `${accuracy}%`}
				/>
				<Tooltip />
				<Legend wrapperStyle={{ bottom: -20, right: 0 }} />
				<Line
					type="monotone"
					dataKey="accuracy"
					stroke="#8884d8"
					activeDot={{ r: 8 }}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}

function TopBar() {
	const nameList = ["Chris", "Bob", "Steven", "Vikram"];

	const [name, setName] = useState(nameList[0]);
	const [isVisible, setIsVisible] = useState(false);

	const doSomething = () => {
		console.log("something");
	};

	const handleClick = () => {
		setIsVisible(!isVisible);
	};

	const handleNameClick = (selectedName) => {
		setName(selectedName);
		setIsVisible(false);
	};

	return (
		<div className="text-white">
			<header className="flex items-center justify-between border-b py-4">
				{/* Link for navigation - Go back */}
				<Link href="/" className="cursor-pointer ml-4">
					<button
						type="button"
						className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 duration-200 hover:scale-125 active:scale-100"
						title="Go Back"
					>
						&#8592;
					</button>
				</Link>

				{/* User name and dropdown */}
				<span className="flex-grow text-center text-3xl relative">
					{name}
					<span onClick={handleClick} className="cursor-pointer">
						{" "}
						&#9660;
					</span>
					{isVisible && (
						<div className="overflow-y-auto h-56 text-black absolute left-1/2 transform -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg">
							{nameList.map((nameItem, index) => (
								<div
									key={index}
									className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b"
									onClick={() => handleNameClick(nameItem)}
								>
									{nameItem}
								</div>
							))}
						</div>
					)}
				</span>

				{/* Logout button positioned to the right */}
				<div className="absolute right-4 top-4">
					<Logout />
				</div>
			</header>
		</div>
	);
}

function getInfo(queryType, id) {
	const workerUrl = "https://garde.gardefencing.workers.dev"; // Replace with your actual Worker URL
	// Define the query data (e.g., query by ID or name)
	const queryData = {
		queryType: queryType, // getFencer, getCoach
		id: id,
	};

	const response = axios
		.post(workerUrl, queryData, {
			headers: { "Content-Type": "application/json" },
		})
		.then((data) => console.log(""))
		.catch((error) => console.log(error));
}

function deleteFencer() {
	const onSubmit = (fencerId, coachId) => {
		const workerUrl = "https://garde.gardefencing.workers.dev";

		const queryData = {
			fencerId: fencerId,
			coachId: coachId,
		};

		axois
			.delete(workerUrl, queryData, {
				headers: { "Content-Type": "application/json" },
			})
			.then((res) => console.log(res))
			.catch((e) => console.log(e));
	};

	return <div>Hello</div>;
}

function AddFencerInstruction() {
	const [res, setRes] = useState({});

	const onSubmit = (name) => {
		const workerUrl = "https://garde.gardefencing.workers.dev"; // Replace with your actual Worker URL

		const queryData = {
			fencerInstruction: name,
		};

		axois
			.put(workerUrl, queryData, {
				headers: { "Content-Type": "application/json" },
			})
			.then((res) => setRes(res))
			.catch((e) => console.log(e));
	};

	return (
		<div>
			<div className="flex justify-center mt-5">
				<Input
					placeholder="Input Instruction Here"
					type="text"
					className="w-[300px]"
					id="textInput"
				/>
			</div>
			<div className="flex justify-center mt-2">
				<Button
					type="dashed"
					onClick={() => onSubmit(document.getElementById("textInput").value)}
				>
					Add Instruction
				</Button>
			</div>
		</div>
	);
}
