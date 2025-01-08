"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
	FiRefreshCw,
	FiGrid,
	FiAlignJustify,
	FiDownload,
	FiShare2,
} from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { selectVideoNumber } from "@/src/stores/features/videoNumberSlice";
import VideoSource from "@/src/components/videos/VideoSource";
import Loader from "@/src/components/ui/Loader";
import CopyButton from "@/src/components/ui/CopyButton";

export default function Videos({ params }) {
	const { tournament_id } = params;
	const [isGridLayout, setIsGridLayout] = useState(true);
	const [pinned, setPinned] = useState([]);
	const [videos, setVideos] = useState([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [loading, setLoading] = useState(false);
	const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL;
	const router = useRouter();
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchVideos = async () => {
			try {
				setLoading(true);
				const listUrl = `/api/get-videos/${tournament_id}`;
				const response = await axios.get(listUrl, {
					headers: {
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
					},
				});
				const vidNames = response.data.videos;

				if (vidNames) {
					const vids = await Promise.all(
						vidNames.map(async (name) => {
							const metadataUrl = `${bucketUrl}/${tournament_id}/${name}/metadata.json`;
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
								thumbnail: `${bucketUrl}/${tournament_id}/${name}/thumbnail.jpeg`,
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
	}, [tournament_id, refreshKey]);

	const handleVideoClick = (i, videoId) => {
		dispatch(selectVideoNumber(i + 1));
		router.push(`/tournaments/${tournament_id}/videos/${videoId}`);
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

	const handleRefresh = () => {
		setRefreshKey((prev) => prev + 1);
	};

	return (
		<>
			<Loader loading={loading} />
			<div className="min-h-screen w-full bg-gray-900 text-white flex flex-col select-none z-0">
				<div className="flex items-center space-x-5 justify-between px-6 py-4 border-b border-gray-700">
					<Link
						href={`/tournaments/${tournament_id}`}
						className="cursor-pointer"
					>
						<button
							type="button"
							className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 transition-transform duration-200 hover:scale-110 active:scale-100"
							title="Go Back"
						>
							&#8592;
						</button>
					</Link>
					<h1 className="text-2xl font-bold">Tournament Videos</h1>
					<button
						type="button"
						onClick={handleRefresh}
						className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-md shadow-md transition-transform duration-200 hover:scale-105"
					>
						<FiRefreshCw size={20} /> Refresh
					</button>
				</div>

				<>
					{videos.length > 0 ? (
						<>
							<div className="flex justify-between items-center mb-4 mx-5">
								<h2 className="text-lg font-bold">Fencer Videos</h2>
								<div className="flex gap-2">
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
										? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ml-5"
										: "flex flex-col gap-4 mx-5"
								} overflow-y-auto`}
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
											className="cursor-pointer focus:outline-none"
										>
											<div
												className={`video-thumbnail border border-gray-300 p-2 rounded-lg shadow-lg bg-gray-800 hover:bg-gray-700 transition duration-200 ease-in-out ${
													!isGridLayout ? "flex items-center gap-4" : ""
												}`}
											>
												<VideoSource
													videoUrl={`${bucketUrl}/${tournament_id}/${video.key}/playlist.m3u8`}
													thumbnail={video.thumbnail}
													isGridLayout={isGridLayout}
												/>
												<div className={!isGridLayout ? "flex flex-col" : ""}>
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

													<div className="flex flex-col items-center mt-2 gap-1">
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																handleDownload(
																	`${bucketUrl}/${tournament_id}/${video.key}/full_video.webm`,
																	`Video_${video.index + 1}.webm`,
																);
															}}
															className="inline-flex items-center text-blue-500 hover:underline text-sm"
														>
															<FiDownload size={16} /> Download
														</button>
														<CopyButton
															text={`${bucketUrl}/${tournament_id}/${video.key}/full_video.webm`}
															style="inline-flex items-center text-blue-500 hover:underline text-sm text-center gap-1"
															before="Share"
															after="Copied!"
															size={16}
															BeforeIcon={FiShare2}
														/>
													</div>
												</div>
											</div>
										</div>
									))}
							</div>
						</>
					) : (
						<div className="flex flex-col items-center justify-center text-center mt-12">
							<h2 className="text-lg font-bold">No videos available</h2>
						</div>
					)}
				</>
			</div>
		</>
	);
}
