"use client";

import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import axios from "axios";

const Videos = ({ fencer }) => {
	const [videoUrl, setVideoUrl] = useState(null);
	const [videos, setVideos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [videoNumber, setVideoNumber] = useState(-1);

	useEffect(() => {
		const fetchVideos = async () => {
			try {
				setVideoUrl(null);
				const listUrl = `${process.env.NEXT_PUBLIC_R2_WORKER}/listBucket/${fencer.fencer_id}`;
				const response = await axios.get(listUrl);
				setVideos(response.data.videos);
			} catch (error) {
				console.error(error.message);
			}
		};

		fetchVideos(); // Call the async function
	}, [fencer]);

	const fetchVideoChunks = async (videoId) => {
		const range = "0-"; // Start with an initial range
		const splitVideo = videoId.split("/");
		const fencerId = splitVideo[0];
		const video = splitVideo[1];
		const url = `${process.env.NEXT_PUBLIC_R2_WORKER}/getVideoChunks?fencerId=${fencerId}&videoId=${video}&range=${range}`;

		try {
			// Fetch video chunk from backend
			const response = await axios.get(url, { responseType: "blob" });
			const videoObjectUrl = URL.createObjectURL(response.data);

			setVideoUrl(videoObjectUrl);
		} catch (error) {
			console.error("Failed to fetch video:", error.message);
		}
	};

	const handleVideoClick = (i, videoId) => {
		setLoading(true);
		setVideoNumber(i);
		fetchVideoChunks(videoId);
	};

	const handleVideoReady = () => {
		setLoading(false);
	};

	const readableDate = (dateString) => {
		const date = new Date(dateString);
		const formattedDate = date.toLocaleString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			// second: "numeric",
			hour12: true,
		});

		return formattedDate;
	};

	return (
		<>
			{videos.length > 0 ? (
				<>
					{videoUrl ? (
						<>
							<div className="video-player mt-6">
								<ReactPlayer
									url={videoUrl}
									controls={true}
									playing={false}
									onReady={handleVideoReady}
									width="100%"
									height="450px"
								/>
							</div>
							<div className="flex justify-center mt-4">
								<button
									type="button"
									onClick={() => setVideoUrl(null)}
									className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400"
								>
									Back to Gallery
								</button>
							</div>
						</>
					) : (
						<>
							<h2 className="text-lg font-bold mb-4">Fencer Videos</h2>
							<div className="video-gallery grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
								{videos.map((video, i) => (
									<button
										type="button"
										key={video.key}
										onClick={() => handleVideoClick(i, video.key)}
										className="focus:outline-none"
									>
										<div className="video-thumbnail border border-gray-300 p-2 rounded-md shadow-md bg-gray-800 hover:bg-gray-700 text-center text-white">
											<p>
												{i + 1}. {readableDate(video.lastModified)}
											</p>
										</div>
									</button>
								))}
							</div>
						</>
					)}
				</>
			) : (
				<p>No videos available</p>
			)}
			{loading && <p className="mt-3">Loading Video {videoNumber + 1} ...</p>}
		</>
	);
};

export default Videos;
