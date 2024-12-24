"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiDownload, FiRepeat, FiBookmark } from "react-icons/fi";
import ShareButton from "@/src/components/tournaments/ShareButton";
import { FaBookmark } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import HLSPlayer from "@/src/components/videos/HlsPlayer";

export default function VideoPage({ params }) {
	const [isLooping, setIsLooping] = useState(false);
	const [pinned, setPinned] = useState([]);
	const { tournament_id, videoId } = params;

	const videoNumber = useSelector((state) => state.videoNumber.videoNumber);

	useEffect(() => {
		const pin = localStorage.getItem("pinned");
		if (pin) {
			setPinned(JSON.parse(pin));
		}
	}, []);

	const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL;
	const videoUrl = `${bucketUrl}/${tournament_id}/${videoId}/playlist.m3u8`;
	const router = useRouter();

	const togglePin = (videoId) => {
		if (pinned.find((vid) => vid === videoId)) {
			const newPinned = pinned.filter((vid) => vid !== videoId);
			setPinned(newPinned);
			localStorage.setItem("pinned", JSON.stringify(newPinned));

			return;
		}

		const newPinned = [...pinned, videoId];
		setPinned(newPinned);
		localStorage.setItem("pinned", JSON.stringify(newPinned));
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

	return (
		<div className="bg-gray-900">
			<div className="text-white text-center pt-5 text-3xl">
				Video {videoNumber}
			</div>
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
						<div className="inline-flex items-center hover:underline text-sm text-center gap-1">
							<FiRepeat className="text-yellow-400" size={16} /> Stop Loop
						</div>
					) : (
						<div className="inline-flex items-center hover:underline text-sm text-center gap-1">
							<FiRepeat size={16} /> Loop
						</div>
					)}
				</button>
				<button
					type="button"
					className="inline-flex items-center hover:underline text-sm text-center gap-1"
				>
					{pinned.find((video) => video === videoId) ? (
						<div
							onClick={() => togglePin(videoId)}
							className="inline-flex items-center hover:underline text-sm text-center gap-1"
						>
							<FaBookmark size={12} className="text-yellow-400" /> Unsave
						</div>
					) : (
						<div
							className="inline-flex items-center hover:underline text-sm text-center gap-1"
							onClick={() => togglePin(videoId)}
						>
							<FiBookmark size={16} /> Save
						</div>
					)}
				</button>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						handleDownload(
							`${bucketUrl}/${tournament_id}/${videoId}/full_video.webm`,
							`Video_${videoNumber}.webm`,
						);
					}}
					className="inline-flex items-center hover:underline text-sm text-center gap-1"
				>
					<FiDownload size={16} /> Download
				</button>
				<ShareButton
					link={`${bucketUrl}/${tournament_id}/${videoId}/full_video.webm`}
				/>
			</div>
			<div className="flex justify-center mt-4">
				<button
					type="button"
					onClick={() => router.push(`/tournaments/${tournament_id}/videos`)}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400"
				>
					Back to Gallery
				</button>
			</div>
		</div>
	);
}
