"use client";

import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import axios from "axios";
import { FiRefreshCw, FiGrid, FiAlignJustify } from "react-icons/fi";
import Loader from "../ui/Loader";

const HLSPlayer = ({ videoUrl }) => {
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
		<div className="max-w-[800px] mx-auto">
			<video
				ref={videoRef}
				controls
				muted={false}
				className="w-full max-w-full h-[445px] aspect-video rounded-lg"
			/>
		</div>
	);
};

const VideoSource = ({ videoUrl, thumbnail, isGridLayout }) => {
	const videoRef = useRef(null);
	const hlsRef = useRef(null);

	const [videPlaying, setVideoPlaying] = useState(false);

	useEffect(() => {
		return () => {
			if (hlsRef.current) {
				hlsRef.current.destroy();
				hlsRef.current = null;
			}
		};
	}, []);

	const handleMouseEnter = () => {
		setVideoPlaying(true);
		try {
			if (Hls.isSupported()) {
				const hls = new Hls();
				hlsRef.current = hls;
				hls.loadSource(videoUrl);
				hls.attachMedia(videoRef.current);

				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					videoRef.current.play();
				});
			} else if (
				videoRef.current.canPlayType("application/vnd.apple.mpegurl")
			) {
				videoRef.current.src = videoUrl;
				videoRef.current.play();
			}
		} catch (error) {
			console.error(error);
			setVideoPlaying(false);
		}
	};

	const handleMouseLeave = () => {
		setVideoPlaying(false);
		if (videoRef.current) {
			videoRef.current.pause();
			videoRef.current.currentTime = 0;
		}
		if (hlsRef.current) {
			hlsRef.current.destroy();
			hlsRef.current = null;
		}
	};

	return (
		<div
			className={`relative overflow-hidden rounded-lg ${
				isGridLayout
					? "w-full aspect-video"
					: "w-full max-w-sm md:max-w-md lg:max-w-lg aspect-video"
			}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<video
				className="w-full h-full object-cover"
				ref={videoRef}
				muted
				playsInline
				poster={thumbnail}
			/>
		</div>
	);
};

const Videos = ({
	fencer,
	setCurrentVideo,
	videos,
	setVideos,
	handleRefresh,
}) => {
	const [videoUrl, setVideoUrl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [isGridLayout, setIsGridLayout] = useState(true); // New state for layout toggle
	const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL;

	useEffect(() => {
		const fetchVideos = async () => {
			if (!fencer || !fencer.fencer_id) {
				return;
			}
			try {
				setLoading(true);
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

					setVideos(
						vids.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
					);
				}
				setLoading(false);
			} catch (error) {
				setLoading(false);
				console.error(error);
			}
		};

		fetchVideos();
	}, [fencer]);

	const handleVideoClick = (videoId) => {
		setCurrentVideo(videoId);
		setVideoUrl(`${bucketUrl}/${fencer.fencer_id}/${videoId}/playlist.m3u8`);
	};

	return (
		<>
			<Loader loading={loading} />
			{videos.length > 0 ? (
				<>
					{videoUrl ? (
						<>
							<div className="video-player mt-6">
								<HLSPlayer videoUrl={videoUrl} />
							</div>
							<div className="flex justify-center mt-4">
								<button
									type="button"
									onClick={() => {
										setVideoUrl(null);
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
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-lg font-bold">Fencer Videos</h2>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={handleRefresh}
										className="px-4 py-2 text-white rounded-md hover:bg-blue-400 transition duration-200"
									>
										<FiRefreshCw size={20} />
									</button>
									<button
										type="button"
										onClick={() => setIsGridLayout(!isGridLayout)}
										className="px-4 py-2 text-white rounded-md hover:bg-blue-400 transition duration-200 flex items-center gap-2"
									>
										{isGridLayout ? (
											<FiAlignJustify size={20} />
										) : (
											<FiGrid size={20} />
										)}
									</button>
								</div>
							</div>
							<div
								className={`video-gallery ${
									isGridLayout
										? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
										: "flex flex-col gap-4"
								} max-h-96 overflow-y-auto`}
							>
								{videos.map((video, i) => (
									<button
										type="button"
										key={video.key}
										onClick={() => handleVideoClick(video.key)}
										className="focus:outline-none"
									>
										<div
											className={`video-thumbnail border border-gray-300 p-2 rounded-lg shadow-lg bg-gray-800 hover:bg-gray-700 transition duration-200 ease-in-out ${
												!isGridLayout ? "flex items-center gap-4" : ""
											}`}
										>
											<VideoSource
												videoUrl={`${bucketUrl}/${fencer.fencer_id}/${video.key}/playlist.m3u8`}
												thumbnail={video.thumbnail}
												isGridLayout={isGridLayout}
											/>
											<div className={!isGridLayout ? "flex flex-col" : ""}>
												<p className="mt-2 text-sm font-medium text-white text-center">
													Video {i + 1}
												</p>
												<p className="text-xs text-gray-400 text-center">
													{new Date(video.timestamp).toLocaleString()}{" "}
												</p>
											</div>
										</div>
									</button>
								))}
							</div>
						</>
					)}
				</>
			) : (
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-bold">No videos available</h2>
					<button
						type="button"
						onClick={handleRefresh}
						className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 transition duration-200"
					>
						<FiRefreshCw size={20} />
					</button>
				</div>
			)}
		</>
	);
};

export default Videos;
