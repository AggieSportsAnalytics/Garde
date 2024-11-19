"use client";

import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import axios from "axios";
import Image from "next/image";

const HLSPlayer = ({ videoUrl, setLoading }) => {
	const videoRef = useRef(null);

	useEffect(() => {
		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(videoUrl);
			hls.attachMedia(videoRef.current);

			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				videoRef.current.play();
			});

			return () => {
				hls.destroy();
			};
		}
		if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
			// For Safari and other native HLS-supporting browsers
			videoRef.current.src = videoUrl;
			videoRef.current.addEventListener("loadedmetadata", () => {
				videoRef.current.play();
			});
		}
	}, [videoUrl]);

	return (
		<div style={{ maxWidth: "800px", margin: "0 auto" }}>
			<video
				ref={videoRef}
				controls
				style={{
					width: "100%",
					maxWidth: "100%",
					height: "450px",
					aspectRatio: "16 / 9",
					borderRadius: "8px",
				}}
				onPlay={() => setLoading(false)}
			/>
		</div>
	);
};

const Videos = ({ fencer, setCurrentVideo, videos, setVideos }) => {
	const [videoUrl, setVideoUrl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [videoNumber, setVideoNumber] = useState(-1);
	const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL;

	useEffect(() => {
		const fetchVideos = async () => {
			if (!fencer || !fencer.fencer_id) {
				return;
			}
			try {
				setVideoUrl(null);
				const listUrl = `/api/get-videos/${fencer.fencer_id}`;
				const response = await axios.get(listUrl);
				const vidNames = response.data.videos;

				if (vidNames) {
					const vids = await Promise.all(
						vidNames.map(async (name) => {
							const metadataUrl = `${bucketUrl}/${fencer.fencer_id}/${name}/metadata.json`;
							let timestamp = null;

							try {
								const response = await fetch(metadataUrl);
								if (response.ok) {
									const metadata = await response.json();
									timestamp = metadata.timestamp || null;
								} else {
									console.warn(
										`Failed to fetch metadata for ${name}:`,
										response.statusText,
									);
								}
							} catch (error) {
								console.error(
									`Error fetching metadata for ${name}:`,
									error.message,
								);
							}

							return {
								key: name,
								thumbnail: `${bucketUrl}/${fencer.fencer_id}/${name}/thumbnail.jpeg`,
								timestamp,
							};
						}),
					);

					setVideos(vids);
				}
			} catch (error) {
				console.error(error.message);
			}
		};

		fetchVideos();
	}, [fencer]);

	const handleVideoClick = (i, videoId) => {
		setLoading(true);
		setVideoNumber(i);
		setCurrentVideo(videoId);
		setVideoUrl(`${bucketUrl}/${fencer.fencer_id}/${videoId}/playlist.m3u8`);
	};

	return (
		<>
			{videos.length > 0 ? (
				<>
					{videoUrl ? (
						<>
							<div className="video-player mt-6">
								<HLSPlayer videoUrl={videoUrl} setLoading={setLoading} />
							</div>
							<div className="flex justify-center mt-4">
								<button
									type="button"
									onClick={() => {
										setVideoUrl(null);
										setLoading(false);
										setCurrentVideo(null);
									}}
									className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400"
								>
									Back to Gallery
								</button>
							</div>
						</>
					) : (
						<>
							<h2 className="text-lg font-bold mb-4">Fencer Videos</h2>
							<div className="video-gallery grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
								{videos
									.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
									.map((video, i) => (
										<button
											type="button"
											key={video.key}
											onClick={() => handleVideoClick(i, video.key)}
											className="focus:outline-none"
										>
											<div className="video-thumbnail border border-gray-300 p-2 rounded-lg shadow-lg bg-gray-800 hover:bg-gray-700 transition duration-200 ease-in-out">
												<Image
													src={video.thumbnail}
													width={200}
													height={200}
													className="object-cover rounded-md w-full h-auto"
													alt="Thumbnail"
												/>
												<p className="mt-2 text-sm font-medium text-white text-center">
													Video {i + 1}
												</p>
												<p className="text-xs text-gray-400 text-center">
													{new Date(video.timestamp).toLocaleString()}{" "}
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
