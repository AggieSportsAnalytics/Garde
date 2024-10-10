"use client";

import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import axios from "axios";

const Videos = ({ fencer }) => {
	const [videoUrl, setVideoUrl] = useState(null);
	const [videos, setVideos] = useState([]);
	const workerUrl = process.env.NEXT_PUBLIC_R2_WORKER;

	useEffect(() => {
		const fetchVideos = async () => {
			try {
				setVideoUrl(null);
				const listUrl = `${workerUrl}/listBucket/${fencer.fencer_id}`;
				const response = await axios.get(listUrl);
				setVideos(response.data.videos);
			} catch (error) {
				console.error(error.message);
			}
		};

		fetchVideos(); // Call the async function
	}, [fencer, workerUrl]);

	const fetchVideoChunks = async (videoId) => {
		const range = "0-"; // Start with an initial range
		const splitVideo = videoId.split("/");
		const fencerId = splitVideo[0];
		const video = splitVideo[1];
		const url = `${workerUrl}/getVideoChunks?fencerId=${fencerId}&videoId=${video}&range=${range}`;

		try {
			// Fetch video chunk from backend
			const response = await axios.get(url, { responseType: "blob" });
			const videoObjectUrl = URL.createObjectURL(response.data);

			// Set video URL to play it in ReactPlayer
			setVideoUrl(videoObjectUrl);
		} catch (error) {
			// if (error.response.data) {
			// 	const videoObjectUrl = URL.createObjectURL(error.response.data);
			// 	setVideoUrl(videoObjectUrl);
			// }
			console.error("Failed to fetch video:", error.message);
		}
	};

	const handleVideoClick = (videoId) => {
		fetchVideoChunks(videoId);
	};

	return (
		<div>
			<h2 className="text-lg font-bold mb-4">Fencer Videos</h2>
			<div className="video-gallery grid grid-cols-2 gap-4">
				{videos.map((video) => (
					<button
						type="button"
						key={video.key}
						onClick={() => handleVideoClick(video.key)}
						className="focus:outline-none"
					>
						<div className="video-thumbnail border border-gray-300 p-2 rounded-md shadow-md bg-gray-800 hover:bg-gray-700 text-center text-white">
							<p>{video.lastModified}</p>
						</div>
					</button>
				))}
			</div>

			<div className="video-player mt-6">
				{videoUrl ? (
					<ReactPlayer
						url={videoUrl}
						controls={true}
						playing={true}
						width="100%"
						height="300px"
					/>
				) : videos.length > 0 ? (
					<p>Select a video to play</p>
				) : (
					<p>No fencer selected</p>
				)}
			</div>
		</div>
	);
};

export default Videos;
