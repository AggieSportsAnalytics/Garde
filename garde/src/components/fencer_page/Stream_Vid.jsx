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

	const handleFileChange = async (event) => {
		const file = event.target.files[0];
		if (file) {
			const videoURL = URL.createObjectURL(file);
			onVideoChange(videoURL);
			setVideoAdded(true); // Update state to show video has been added
			const convertedFile = await convertFile(file);
			// handleVideoUpload(file);
			if (convertedFile) {
				handleVideoUpload(convertedFile);
			}
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
				"Content-Type": "video/webm; codecs=vp9",
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

const convertFile = async (selectedFile) => {
	const formData = new FormData();
	formData.append("video", selectedFile);

	try {
		// Request backend conversion, expecting a blob response
		const response = await axios.post("/api/convert-video", formData, {
			headers: {
				// "Content-Type": "multipart/form-data", // Correct header for FormData
				"Content-Type": "video/webm; codecs=vp9",
			},
		});

		if (response.status >= 200 && response.status < 300) {
			// Receive the blob from the response and convert it into a File object
			const fileBlob = response.data;
			const convertedFile = new File(
				[fileBlob],
				`converted_${selectedFile.name}.webm`,
				{
					type: "video/webm; codecs=vp9",
				},
			);

			console.log("File converted successfully!");
			return convertedFile; // Return the converted file as a File object
		}

		console.error("Failed to upload and convert file");
		return null;
	} catch (error) {
		console.error("Error during file conversion:", error);
		return null;
	}
};

export default Stream_Vid;
