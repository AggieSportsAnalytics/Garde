import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
// import ffmpegPath from "ffmpeg-static";
import { promises as fsPromises } from "node:fs";
import path from "node:path";

// console.log("Resolved FFmpeg path:", ffmpegPath);
// ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH); // global ffmpeg path

export const config = {
	api: {
		bodyParser: false, // Disable the default body parser to handle FormData manually
	},
};

// Helper function to convert video to WebM
const convertToWebM = (inputFilePath, outputFilePath) => {
	return new Promise((resolve, reject) => {
		ffmpeg(inputFilePath)
			.output(outputFilePath)
			.on("end", () => resolve(outputFilePath))
			.on("error", (err) => reject(err))
			.run();
	});
};

// API handler for video conversion
export async function POST(req) {
	const formData = await req.formData();
	const videoFile = formData.get("video");

	if (!videoFile) {
		return NextResponse.json(
			{ message: "No video file uploaded" },
			{ status: 400 },
		);
	}

	// Create a temporary file to store the uploaded video
	const tempInputFilePath = path.join("/tmp", `${Date.now()}.mp4`); // Assuming original video is mp4
	const tempOutputFilePath = path.join("/tmp", `converted_${Date.now()}.webm`);

	// Write the uploaded video file to the temporary path
	const arrayBuffer = await videoFile.arrayBuffer();
	await fsPromises.writeFile(tempInputFilePath, Buffer.from(arrayBuffer));

	try {
		// Convert the video to WebM
		await convertToWebM(tempInputFilePath, tempOutputFilePath);

		// Read the converted WebM file (as Buffer)
		const convertedFileBuffer = await fsPromises.readFile(tempOutputFilePath);

		// Clean up the temporary files
		await fsPromises.unlink(tempInputFilePath);
		await fsPromises.unlink(tempOutputFilePath);

		// Return the WebM file as a Buffer (automatically sent as binary data)
		return new NextResponse(convertedFileBuffer, {
			headers: {
				"Content-Type": "video/webm",
			},
		});
	} catch (error) {
		console.error("Error during conversion:", error);
		return NextResponse.json(
			{ message: "Error converting video" },
			{ status: 500 },
		);
	}
}
