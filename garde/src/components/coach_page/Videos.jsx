"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
	FiRefreshCw,
	FiGrid,
	FiAlignJustify,
	FiDownload,
	FiShare2,
	FiRepeat,
} from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import axiosInstance from "../axios";
import VideoSource from "@/src/components/videos/VideoSource";
import HLSPlayer from "@/src/components/videos/HlsPlayer";
import CopyButton from "../ui/CopyButton";
import Pinned from "../videos/Pinned";

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
	const [thumbUrl, setThumbUrl] = useState(null);
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
				const response = await axiosInstance.get(listUrl);
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

					const pin = localStorage.getItem("pinnedVideo");
					if (pin) {
						setPinned(JSON.parse(pin));
					}
					setVideos(
						vids
							.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
							.map((video, index) => ({ ...video, index })),
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
		setThumbUrl(`${bucketUrl}/${fencer.fencer_id}/${videoId}/thumbnail.jpeg`);
	};

	const handleDownload = async (videoUrl, filename) => {
		try {
			const response = await axios.get(videoUrl, {
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
					{videoUrl && thumbUrl ? (
						<>
							<div className="video-player mt-6">
								<HLSPlayer
									videoUrl={videoUrl}
									isLooping={isLooping}
									thumbnail={thumbUrl}
								/>
							</div>
							<div className="mt-2 flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 text-blue-500 justify-center">
								<button
									type="button"
									className="flex items-center gap-2 cursor-pointer hover:underline text-sm text-center"
									onClick={() => setIsLooping(!isLooping)}
								>
									{isLooping ? (
										<>
											<FiRepeat className="text-yellow-400" size={16} /> Stop
											Loop
										</>
									) : (
										<>
											<FiRepeat size={16} /> Loop
										</>
									)}
								</button>
								<Pinned
									pinned={pinned}
									setPinned={setPinned}
									id={currentVideo}
									stored="pinnedVideo"
								/>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										handleDownload(
											`${bucketUrl}/${fencer.fencer_id}/${currentVideo}/full_video.webm`,
											`Video_${videoNumber + 1}.webm`,
										);
									}}
									className="flex items-center gap-2 cursor-pointer hover:underline text-sm text-center"
								>
									<FiDownload size={16} /> Download
								</button>

								<CopyButton
									text={`${bucketUrl}/${fencer.fencer_id}/${currentVideo}/full_video.webm`}
									before="Share"
									after="Copied!"
									BeforeIcon={FiShare2}
									size={16}
									style="inline-flex items-center text-blue-500 hover:underline text-sm text-center gap-1"
									className="flex items-center gap-2 cursor-pointer hover:underline text-sm text-center"
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
										className="hidden px-4 py-2 text-white rounded-md hover:bg-blue-400 transition duration-200 md:flex items-center gap-2"
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
										? "md:grid md:grid-cols-2 lg:grid-cols-4"
										: "flex flex-col"
								} gap-4 max-h-96 overflow-y-auto`}
							>
								{videos
									?.slice()
									.sort((a, b) => {
										const isPinnedA = pinned.includes(a.key) ? 1 : 0;
										const isPinnedB = pinned.includes(b.key) ? 1 : 0;
										return isPinnedB - isPinnedA;
									})
									.map((video) => (
										<div
											key={video.key}
											onClick={() => handleVideoClick(video.index, video.key)}
											className="cursor-pointer focus:outline-none pb-4"
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
												<div className="md:hidden">
													{pinned.find((vid) => vid === video.key) ? (
														<p className="mt-2 text-sm font-medium text-white text-center">
															Video {video.index + 1}{" "}
															<FaBookmark className="inline-block text-yellow-400" />
														</p>
													) : (
														<p className="mt-2 text-sm font-medium text-white text-center">
															Video {video.index + 1}
														</p>
													)}

													<p className="text-xs text-gray-400 text-center">
														{new Date(video.timestamp).toLocaleString()}{" "}
													</p>
												</div>
												<div
													className={
														!isGridLayout
															? "hidden md:flex flex-col"
															: "hidden md:block"
													}
												>
													{pinned.find((vid) => vid === video.key) ? (
														<p className="mt-2 text-sm font-medium text-white text-center">
															Video {video.index + 1}{" "}
															<FaBookmark className="inline-block text-yellow-400" />
														</p>
													) : (
														<p className="mt-2 text-sm font-medium text-white text-center">
															Video {video.index + 1}
														</p>
													)}

													<p className="text-xs text-gray-400 text-center">
														{new Date(video.timestamp).toLocaleString()}{" "}
													</p>

													<div className="md:flex flex-col items-center mt-2 gap-1 hidden">
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																handleDownload(
																	`${bucketUrl}/${fencer.fencer_id}/${video.key}/full_video.webm`,
																	`Video_${video.index + 1}.webm`,
																);
															}}
															className="inline-flex items-center text-blue-500 hover:underline text-sm"
														>
															<FiDownload size={16} /> Download
														</button>
														<CopyButton
															text={`${bucketUrl}/${fencer.fencer_id}/${currentVideo}/full_video.webm`}
															before="Share"
															after="Copied!"
															BeforeIcon={FiShare2}
															size={16}
															style="inline-flex items-center text-blue-500 hover:underline text-sm text-center gap-1"
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
