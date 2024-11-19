import React, { useRef, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const Stream_Vid = ({
	onVideoChange,
	isRecording,
	toggleRecording,
	fencerId,
	setVideoId,
}) => {
	const refFileInput = useRef(null);
	const [videoAdded, setVideoAdded] = useState(false); // Track if video has been added

	const handleFileChange = async (event) => {
		const file = event.target.files[0];
		if (file) {
			const videoURL = URL.createObjectURL(file);
			onVideoChange(videoURL);
			setVideoAdded(true); // Update state to show video has been added
			await handleVideoUpload(file);
		}
	};

	const addVideo = () => {
		if (!videoAdded) {
			refFileInput.current.click();
		} else {
			onVideoChange(""); // Clear the video source
			setVideoAdded(false); // Reset state to show no video is added
		}
	};

	const handleVideoUpload = async (file) => {
		const formData = new FormData();
		const videoId = uuidv4();
		setVideoId(videoId);
		formData.append("video", file, videoId);

		try {
			const res = await axios.post(`/api/convert-video/${fencerId}`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			if (res.status < 200 || res.status >= 300) {
				console.error("Failed to upload file");
			}
		} catch (error) {
			console.error("Error during file upload:", error);
		}
	};

	return (
		<div
			className="flex flex-col items-start space-y-4"
			style={{ paddingTop: "2rem" }}
		>
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
					className="bg-white text-black font-bold py-2 px-4 rounded shadow-md hover:bg-gray-100"
					onClick={addVideo}
				>
					{videoAdded ? "Remove Video" : "Add Video"}
				</button>
				<button
					type="button"
					className="bg-white text-black font-bold py-2 px-4 rounded shadow-md hover:bg-gray-100"
					onClick={toggleRecording}
				>
					{isRecording ? "Stop Recording" : "Record Video"}
				</button>
			</div>
		</div>
	);
};

export default Stream_Vid;
