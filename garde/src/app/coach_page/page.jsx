"use client";

import "@/src/app/globals.css";
import TopBar from "@/src/components/coach_page/TopBar";
import Videos from "@/src/components/coach_page/Videos";
import Editor from "@/src/components/coach_page/Editor";
import Analytics from "@/src/components/coach_page/Analytics";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CoachPageScaffold from "@/src/components/coach_page/CoachPageScaffold";
import checkAuth from "@/src/app/hooks/jwt_verify";
import axiosInstance from "@/src/components/axios";
import renewSession from "../hooks/renew_session";

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
		const initPage = async () => {
			try {
				const decoded = await checkAuth(router, "signin", "coach");

				setId(decoded.id);
				setCoachName(decoded.name);
				getInfo("getCoach", decoded.id);

				renewSession(decoded).then((val) => {
					if (!val) {
						alert("Your session has expired. Please log in again.");
						router.push("/signin");
					}
				});
			} catch (error) {
				console.error(error);
				router.push("/signin?restricted=true");
			}
		};

		initPage();
	}, [refreshKey]);

	async function getInfo(queryType, id) {
		const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/${queryType}/${id}`;

		try {
			const response = await axiosInstance.get(workerUrl);
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
					handleRefresh={handleRefresh}
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
		<div className="flex flex-row px-10 py-10 text-white space-x-6 bg-black">
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
