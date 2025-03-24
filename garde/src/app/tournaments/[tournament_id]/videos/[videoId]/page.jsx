"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiDownload, FiRepeat } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import HLSPlayer from "@/src/components/videos/HlsPlayer";
import CopyButton from "@/src/components/ui/CopyButton";
import { FiShare2 } from "react-icons/fi";
import Pinned from "@/src/components/videos/Pinned";

export default function VideoPage({ params }) {
	const [isLooping, setIsLooping] = useState(false);
	const [pinned, setPinned] = useState([]);
	const { tournament_id, videoId } = React.use(params);

	const videoNumber = useSelector((state) => state.videoNumber.videoNumber);

	useEffect(() => {
		const pin = localStorage.getItem("pinnedVideo");
		if (pin) {
			setPinned(JSON.parse(pin));
		}
	}, []);

	const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL;
	const videoUrl = `${bucketUrl}/${tournament_id}/${videoId}/playlist.m3u8`;
	const router = useRouter();

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
		<div className="bg-gray-900 pb-6">
			<div className="text-white text-center pt-5 text-3xl">
				Video {videoNumber}
			</div>
			<div className="video-player mt-6">
				<HLSPlayer
					videoUrl={videoUrl}
					isLooping={isLooping}
					thumbnail={`${bucketUrl}/${tournament_id}/${videoId}/thumbnail.jpeg`}
				/>
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
				<Pinned
					pinned={pinned}
					setPinned={setPinned}
					id={videoId}
					stored="pinnedVideo"
				/>
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
				<CopyButton
					text={`${bucketUrl}/${tournament_id}/${videoId}/full_video.webm`}
					style="inline-flex items-center text-blue-500 hover:underline text-sm text-center gap-1"
					before="Share"
					after="Copied!"
					size={16}
					BeforeIcon={FiShare2}
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
