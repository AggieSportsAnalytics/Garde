import React, { useRef, useState } from "react";
import axios from "axios";
import axiosInstance from "../axios";

const Stream_Vid = ({
	onVideoChange,
	isRecording,
	toggleRecording,
	fencerId,
	setAnalysis,
	videoCount,
	setInitialLoading,
	videoId,
	initialAnalysis,
}) => {
	const refFileInput = useRef(null);
	const [videoAdded, setVideoAdded] = useState(false); // Track if video has been added
	const [blockUpload, setBlockUpload] = useState(false);
	const [streamDone, setStreamDone] = useState(false);

	const handleFileChange = async (event) => {
		const file = event.target.files[0];
		if (file) {
			const videoURL = URL.createObjectURL(file);
			onVideoChange(videoURL);
			setVideoAdded(true); // Update state to show video has been added
			await handleVideoUpload(file);

			event.target.value = null;
		}
	};

	const addVideo = async () => {
		if (!videoAdded) {
			setBlockUpload(true);
			refFileInput.current.click();
		} else {
			onVideoChange(null); // Clear the video source
			setVideoAdded(false); // Reset state to show no video is added
			if (isRecording) {
				toggleRecording();
			}
			if (refFileInput.current) {
				refFileInput.current.value = null;
			}
		}
	};

	const handleVideoUpload = async (file) => {
		setInitialLoading(true);

		const formData = new FormData();
		// videoId should be set to this uuid when video ends automatically so angles can upload
		formData.append("video", file, videoId);

		try {
			const newId = fencerId ? fencerId : "no-id";

			const API_URL = `${process.env.NEXT_PUBLIC_CONVERT_URL}/convert-video/${newId}`;

			const results = await Promise.allSettled([
				axios.post(API_URL, formData, {
					withCredentials: true,
					headers: {
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
						"Content-Type": "multipart/form-data",
					},
				}),
				axiosInstance.put(
					`${process.env.NEXT_PUBLIC_GARDE_WORKER}/putVideo/${newId}/${videoId}`,
					{ messages: [] },
					{
						headers: { "Content-Type": "application/json" },
					},
				),
				axios.post(
					`${process.env.NEXT_PUBLIC_CHAT_URL}/analyze/upload`,
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					},
				),
			]);

			// const response = await axios.post(
			// 	`${process.env.NEXT_PUBLIC_CHAT_URL}/upload`,
			// 	{ videoUrl: videoUrl },
			// 	{
			// 		headers: {
			// 			"Content-Type": "application/json",
			// 		},
			// 	},
			// );

			const uploadResult = results[2];
			if (uploadResult.status === "fulfilled") {
				const { analysis } = uploadResult.value.data;
				setAnalysis(analysis);
			}
		} catch (error) {
			console.error("Error during file upload:", error);
		} finally {
			setInitialLoading(false);
		}
	};

	return (
		<div className="flex flex-col">
			<input
				type="file"
				accept="video/*"
				ref={refFileInput}
				style={{ display: "none" }}
				onChange={handleFileChange}
			/>
			<div className="flex gap-2">
				<button
					type="button"
					className={
						(videoCount >= 3 && !fencerId) ||
						blockUpload ||
						streamDone ||
						initialAnalysis
							? "bg-gray-200 cursor-not-allowed text-gray-400 font-bold py-2 px-4 rounded shadow-md"
							: "bg-white text-black font-bold py-2 px-4 rounded shadow-md hover:bg-gray-100"
					}
					onClick={addVideo}
					disabled={
						(videoCount >= 3 && !fencerId) ||
						blockUpload ||
						streamDone ||
						initialAnalysis
					}
				>
					{videoAdded ? "Remove Video" : "Add Video"}
				</button>
				<button
					type="button"
					className={
						(videoCount >= 3 && !fencerId) ||
						blockUpload ||
						streamDone ||
						initialAnalysis
							? "bg-gray-200 cursor-not-allowed text-gray-400 font-bold py-2 px-4 rounded shadow-md"
							: "bg-white text-black font-bold py-2 px-4 rounded shadow-md hover:bg-gray-100"
					}
					onClick={() => {
						toggleRecording();
						if (isRecording) {
							setStreamDone(true);
						}
					}}
					disabled={
						(videoCount >= 3 && !fencerId) ||
						blockUpload ||
						streamDone ||
						initialAnalysis
					}
				>
					{isRecording && !videoAdded ? "Stop Recording" : "Record Video"}
				</button>
			</div>
		</div>
	);
};

export default Stream_Vid;
