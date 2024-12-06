"use client";

import "@/src/app/globals.css";
import TopBar from "@/src/components/coach_page/TopBar";
import Videos from "@/src/components/coach_page/Videos";
import Editor from "@/src/components/coach_page/Editor";
import Analytics from "@/src/components/coach_page/Analytics";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useRouter } from "next/navigation";
import CoachPageScaffold from "@/src/components/coach_page/CoachPageScaffold";

export default function CoachPage() {
	const [id, setId] = useState(""); // coach id
	const [fencers, setFencers] = useState([]); // Initially an empty array for fencers
	const [currentFencer, setCurrentFencer] = useState({}); // current fencer
	const [coachName, setCoachName] = useState("");
	const [currentVideo, setCurrentVideo] = useState("");
	const [videos, setVideos] = useState([]);
	const router = useRouter();
	const [refreshKey, setRefreshKey] = useState(0);
	const [loading, setLoading] = useState(true);

	const handleRefresh = () => {
		setLoading(true);
		setRefreshKey((prevKey) => prevKey + 1);
	};

	// Fetch the coach ID and fencers
	useEffect(() => {
		try {
			const token = document.cookie
				.split("; ")
				.find((row) => row.startsWith("token="))
				?.split("=")[1];

			if (token) {
				const decoded = jwtDecode(token);
				const currentTime = Date.now() / 1000;

				if (decoded.type !== "coach" || decoded.exp <= currentTime) {
					router.push("coach_signin?restricted=true");
				}
				setId(decoded.id);
				setCoachName(decoded.name);
				getInfo("getCoach", decoded.id);
			} else {
				console.error("No cookies found");
				router.push("coach_signin?restricted=true");
			}
		} catch (error) {
			console.error(error);
			router.push("coach_signin?restricted=true");
		}
	}, [refreshKey]);

	async function getInfo(queryType, id) {
		const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/${queryType}/${id}`;

		try {
			const response = await axios.get(workerUrl);
			setFencers(response.data.data);
			if (response.data.data.length > 0) {
				setCurrentFencer(response.data.data[0]);
			} else {
				setCurrentFencer({});
			}
		} catch (error) {
			setLoading(false);
			console.error(error);
		}
	}

	return (
		<>
			{loading && <CoachPageScaffold />}
			<div key={refreshKey} className={`${loading && "hidden"}`}>
				<TopBar
					id={id}
					fencers={fencers}
					currentFencer={currentFencer}
					setCurrentFencer={setCurrentFencer}
				/>
				<Feedback
					fencer={currentFencer}
					coachName={coachName}
					setCurrentVideo={setCurrentVideo}
					currentVideo={currentVideo}
					videos={videos}
					setVideos={setVideos}
					handleRefresh={handleRefresh}
					setLoading={setLoading}
				/>
				<Analytics
					fencer={currentFencer}
					currentVideo={currentVideo}
					videos={videos}
				/>
			</div>
		</>
	);
}

function Feedback({
	fencer,
	coachName,
	setCurrentVideo,
	currentVideo,
	videos,
	setVideos,
	handleRefresh,
	setLoading,
}) {
	return (
		<div className="flex flex-row mx-10 pt-10 text-white space-x-6">
			{/* Video Gallery */}
			<div className="w-1/2">
				<Videos
					fencer={fencer}
					setCurrentVideo={setCurrentVideo}
					currentVideo={currentVideo}
					videos={videos}
					setVideos={setVideos}
					handleRefresh={handleRefresh}
					setLoading={setLoading}
				/>
			</div>

			{/* Editor Component */}
			<div className="w-1/2">
				<Editor
					fencer={fencer}
					coachName={coachName}
					currentVideo={currentVideo}
				/>
			</div>
		</div>
	);
}
