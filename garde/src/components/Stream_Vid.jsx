import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { jwtDecode } from "jwt-decode";

const Stream_Vid = ({ onVideoChange, isRecording, toggleRecording }) => {
	const webcamRef = useRef(null);
	const refFileInput = useRef(null);
	const [videoAdded, setVideoAdded] = useState(false); // Track if video has been added
	const [selectedFile, setSelectedFile] = useState(null);

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			const videoURL = URL.createObjectURL(file);
			onVideoChange(videoURL);
			setVideoAdded(true); // Update state to show video has been added
			handleVideoUpload(file);
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

	const captureScreenshot = () => {
		if (webcamRef.current) {
			const screenshot = webcamRef.current.getScreenshot();
			onVideoChange(screenshot);
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
					className="bg-white text-black font-bold py-2 px-4 rounded shadow-md hover:bg-gray-100"
					onClick={addVideo}
				>
					{videoAdded ? "Remove Video" : "Add Video"}
				</button>
				<button
					className="bg-white text-black font-bold py-2 px-4 rounded shadow-md hover:bg-gray-100"
					onClick={toggleRecording}
				>
					{isRecording ? "Stop Recording" : "Record Video"}
				</button>
			</div>
		</div>
	);
};

const handleVideoUpload = async (file) => {
	let decoded = "";
	const token = document.cookie
		.split("; ")
		.find((row) => row.startsWith("token="))
		?.split("=")[1];

	if (token) {
		try {
			decoded = jwtDecode(token);
		} catch (error) {
			console.log("Invalid JWT token");
			return;
		}
	} else {
		console.log("No cookies found");
		return;
	}

	const uniqueId = uuidv4();
	const fencerId = decoded.id;
	const videoId = uniqueId;
	const workerUrl = `${process.env.NEXT_PUBLIC_R2_WORKER}/getPresignedUrl?videoId=${videoId}&fencerId=${fencerId}`;

	try {
		const presignedUrlResponse = await axios.get(workerUrl, {
			headers: {
				"Content-Type": "application/json",
			},
		});

		const presignedUrl = presignedUrlResponse.data.url;

		const uploadResponse = await axios.put(presignedUrl, file, {
			headers: {
				"Content-Type": "video/mp4",
			},
		});

		if (uploadResponse.status >= 200 && uploadResponse.status <= 300) {
			console.log("File uploaded successfully!");
		} else {
			console.error("Failed to upload file");
		}
	} catch (error) {
		console.error("Error during file upload:", error);
	}
};

export default Stream_Vid;
