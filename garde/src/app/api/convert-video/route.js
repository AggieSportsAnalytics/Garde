import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import { promises as fsPromises } from "node:fs";
import path from "node:path";

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH); // global ffmpeg path

// Helper function to convert video
const convertFile = (inputFilePath, outputFilePath) => {
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
	// Manually disable body parsing (handled via formData)
	const formData = await req.formData();
	const videoFile = formData.get("video");

	if (!videoFile) {
		return NextResponse.json(
			{ message: "No video file uploaded" },
			{ status: 400 },
		);
	}

	// Determine the original MIME type
	const originalMimeType = videoFile.type;

	// Create a temporary file path for the uploaded video
	const fileExtension = originalMimeType.split("/")[1]; // Extract file extension
	const tempInputFilePath = path.join("/tmp", `${Date.now()}.${fileExtension}`);
	const tempOutputFilePath = path.join("/tmp", `converted_${Date.now()}.webm`);

	// Write the uploaded video file to the temporary path
	const arrayBuffer = await videoFile.arrayBuffer();
	await fsPromises.writeFile(tempInputFilePath, Buffer.from(arrayBuffer));

	try {
		let finalFileBuffer;
		let finalMimeType;

		// Check if the file needs conversion
		if (originalMimeType === "video/webm; codecs=vp9") {
			// If the file is already webm, return the original file
			finalFileBuffer = await fsPromises.readFile(tempInputFilePath);
			finalMimeType = originalMimeType;
		} else {
			// Convert the video
			await convertFile(tempInputFilePath, tempOutputFilePath);

			// Read the converted webm file (as Buffer)
			finalFileBuffer = await fsPromises.readFile(tempOutputFilePath);
			finalMimeType = "video/webm; codecs=vp9";
		}

		// Clean up the temporary files
		await fsPromises.unlink(tempInputFilePath);
		await fsPromises.unlink(tempOutputFilePath);

		// Return the video file buffer
		return new NextResponse(finalFileBuffer, {
			headers: {
				"Content-Type": finalMimeType,
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
