"use client";

import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import axios from "axios";
import {
	FiRefreshCw,
	FiGrid,
	FiAlignJustify,
	FiDownload,
	FiShare2,
	FiCheck,
	FiRepeat,
	FiBookmark,
} from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";

const ShareButton = ({ link }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async (e) => {
		try {
			e.stopPropagation();
			await navigator.clipboard.writeText(link);
			setCopied(true);

			// Reset "Copied" message after 2 seconds
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text:", err);
		}
	};

	return (
		<button
			type="button"
			onClick={(e) => handleCopy(e)}
			className="inline-flex items-center text-blue-500 hover:underline text-sm text-center gap-1"
		>
			{copied ? (
				<>
					<FiCheck size={16} /> Copied!
				</>
			) : (
				<>
					<FiShare2 size={16} /> Share
				</>
			)}
		</button>
	);
};

const HLSPlayer = ({ videoUrl, isLooping }) => {
	const videoRef = useRef(null);

	useEffect(() => {
		try {
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
		} catch (error) {
			console.error("HLS connection failed:", error);
		}
	}, [videoUrl]);

	return (
		<div className="max-w-[800px] mx-auto">
			<video
				ref={videoRef}
				controls
				loop={isLooping}
				muted={false}
				className="w-full max-w-full h-[445px] aspect-video rounded-lg"
			/>
		</div>
	);
};

const VideoSource = ({ videoUrl, thumbnail, isGridLayout }) => {
	const videoRef = useRef(null);
	const hlsRef = useRef(null);
	const [isBuffering, setIsBuffering] = useState(false);

	useEffect(() => {
		return () => {
			if (hlsRef.current) {
				hlsRef.current.destroy();
				hlsRef.current = null;
			}
		};
	}, []);

	const handleMouseEnter = () => {
		setIsBuffering(true);
		try {
			if (Hls.isSupported()) {
				const hls = new Hls();
				hlsRef.current = hls;
				hls.loadSource(videoUrl);
				hls.attachMedia(videoRef.current);

				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					setIsBuffering(false);
					videoRef.current.play();
				});
			} else if (
				videoRef.current.canPlayType("application/vnd.apple.mpegurl")
			) {
				videoRef.current.src = videoUrl;
				videoRef.current.play();
			}
		} catch (error) {
			setIsBuffering(false);
			console.error(error);
		}
	};

	const handleMouseLeave = () => {
		setIsBuffering(false);
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
		<>
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
				{isBuffering && (
					<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
						<div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
					</div>
				)}
			</div>
		</>
	);
};

const Videos = ({
	fencer,
	setCurrentVideo,
	currentVideo,
	videos,
	setVideos,
	handleRefresh,
	setLoading,
}) => {
	const [videoUrl, setVideoUrl] = useState(null);
	const [isGridLayout, setIsGridLayout] = useState(true); // New state for layout toggle
	const [isLooping, setIsLooping] = useState(false);
	const [pinned, setPinned] = useState([]);
	const [videoNumber, setVideoNumber] = useState(-1);
	const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL;

	useEffect(() => {
		const fetchVideos = async () => {
			try {
				setLoading(true);
				setVideoUrl(null);
				const listUrl = `/api/get-videos/${fencer.fencer_id}`;
				const response = await axios.get(listUrl, { withCredentials: true });
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

					const pin = localStorage.getItem("pinned");
					if (pin) {
						setPinned(JSON.parse(pin));
					}
					setVideos(
						vids.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
					);
				} else {
					setVideos([]);
				}
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		fetchVideos();
	}, [fencer]);

	const handleVideoClick = (i, videoId) => {
		setVideoNumber(i);
		setCurrentVideo(videoId);
		setVideoUrl(`${bucketUrl}/${fencer.fencer_id}/${videoId}/playlist.m3u8`);
	};

	const handleDownload = async (videoUrl, filename) => {
		try {
			const response = await axios.get(videoUrl, {
				withCredentials: true,
				responseType: "blob",
			});

			const blob = await response.data;
			const blobUrl = window.URL.createObjectURL(blob);

			// Create a temporary link element
			const a = document.createElement("a");
			a.href = blobUrl;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);

			// Revoke the object URL to free memory
			window.URL.revokeObjectURL(blobUrl);
		} catch (error) {
			console.error("Error downloading video:", error);
		}
	};

	const togglePin = (videoId) => {
		if (pinned.find((vid) => vid === videoId)) {
			const newPinned = pinned.filter((vid) => vid !== currentVideo);
			setPinned(newPinned);
			localStorage.setItem("pinned", JSON.stringify(newPinned));

			return;
		}

		const newPinned = [...pinned, currentVideo];
		setPinned(newPinned);
		localStorage.setItem("pinned", JSON.stringify(newPinned));
	};

	return (
		<>
			{videos.length > 0 ? (
				<>
					{videoUrl ? (
						<>
							<div className="video-player mt-6">
								<HLSPlayer videoUrl={videoUrl} isLooping={isLooping} />
							</div>
							<div className="mt-2 space-x-4 flex text-blue-500 justify-center">
								<button
									type="button"
									className="flex gap-2 cursor-pointer"
									onClick={() => setIsLooping(!isLooping)}
								>
									{isLooping ? (
										<button
											type="button"
											className="inline-flex items-center hover:underline text-sm text-center gap-1"
										>
											<FiRepeat className="text-yellow-400" size={16} /> Stop
											Loop
										</button>
									) : (
										<button
											type="button"
											className="inline-flex items-center hover:underline text-sm text-center gap-1"
										>
											<FiRepeat size={16} /> Loop
										</button>
									)}
								</button>
								<button
									type="button"
									className="inline-flex items-center hover:underline text-sm text-center gap-1"
								>
									{pinned.find((video) => video === currentVideo) ? (
										<button
											onClick={() => togglePin(currentVideo)}
											type="button"
											className="inline-flex items-center hover:underline text-sm text-center gap-1"
										>
											<FaBookmark size={12} className="text-yellow-400" />{" "}
											Unsave
										</button>
									) : (
										<button
											type="button"
											className="inline-flex items-center hover:underline text-sm text-center gap-1"
											onClick={() => togglePin(currentVideo)}
										>
											<FiBookmark size={16} /> Save
										</button>
									)}
								</button>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										handleDownload(
											`${bucketUrl}/${fencer.fencer_id}/${currentVideo}/full_video.webm`,
											`Video_${videoNumber + 1}.webm`,
										);
									}}
									className="inline-flex items-center hover:underline text-sm text-center gap-1"
								>
									<FiDownload size={16} /> Download
								</button>
								<ShareButton
									link={`${bucketUrl}/${fencer.fencer_id}/${currentVideo}/full_video.webm`}
								/>
							</div>
							<div className="flex justify-center mt-4">
								<button
									type="button"
									onClick={() => {
										setIsLooping(false);
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
									<div
										key={video.key}
										onClick={() => handleVideoClick(i, video.key)}
										className="cursor-pointer focus:outline-none"
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
												{pinned.find((vid) => vid === video.key) ? (
													<p className="mt-2 text-sm font-medium text-white text-center">
														Video {i + 1}{" "}
														<FaBookmark className="inline-block text-yellow-400" />
													</p>
												) : (
													<p className="mt-2 text-sm font-medium text-white text-center">
														Video {i + 1}
													</p>
												)}

												<p className="text-xs text-gray-400 text-center">
													{new Date(video.timestamp).toLocaleString()}{" "}
												</p>

												<div className="flex flex-col items-center mt-2 gap-1">
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															handleDownload(
																`${bucketUrl}/${fencer.fencer_id}/${video.key}/full_video.webm`,
																`Video_${i + 1}.webm`,
															);
														}}
														className="inline-flex items-center text-blue-500 hover:underline text-sm"
													>
														<FiDownload size={16} /> Download
													</button>
													<ShareButton
														link={`${bucketUrl}/${fencer.fencer_id}/${video.key}/full_video.webm`}
													/>
												</div>
											</div>
										</div>
									</div>
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
						className="px-4 py-2 text-white rounded-md hover:bg-blue-400 transition duration-200"
					>
						<FiRefreshCw size={20} />
					</button>
				</div>
			)}
		</>
	);
};

export default Videos;
