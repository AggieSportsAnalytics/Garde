import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import { promises as fsPromises } from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import pLimit from "p-limit";

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
const limit = pLimit(5);

export async function POST(req, { params }) {
	try {
		const formData = await req.formData();
		const videoFile = formData.get("video");
		const { fencerId } = params;

		if (!videoFile) {
			return NextResponse.json(
				{ message: "No video file uploaded" },
				{ status: 400 },
			);
		}
		const videoId = videoFile.name;

		const tempInputPath = path.join("/tmp", `input_${videoId}.webm`);
		const outputDir = path.join("/tmp", `hls_output_${videoId}`);
		await fsPromises.mkdir(outputDir, { recursive: true });

		// Save the video blob to a file
		const arrayBuffer = await videoFile.arrayBuffer();
		await fsPromises.writeFile(tempInputPath, Buffer.from(arrayBuffer));

		await new Promise((resolve, reject) => {
			ffmpeg(tempInputPath)
				.outputOptions([
					"-c:v libx264",
					"-c:a aac",
					"-start_number 0",
					"-hls_time 10",
					"-hls_list_size 0",
					"-f hls",
				])
				.output(path.join(outputDir, "playlist.m3u8"))
				.on("end", resolve)
				.on("error", reject)
				.run();
		});

		// Read and upload the .m3u8 and .ts files to Cloudflare R2 or similar storage
		const files = await fsPromises.readdir(outputDir);
		const len = files.length;
		const uploadPromises = files.map(async (file, i) => {
			const filePath = path.join(outputDir, file);
			const fileBuffer = await fsPromises.readFile(filePath);

			if (i === Math.floor(len / 2)) {
				const thumbPath = path.join(outputDir, "thumbnail.jpeg");
				await generateThumbnail(filePath, thumbPath);
				const buff = await fsPromises.readFile(thumbPath);
				await uploadThumbnail(buff, videoId, fencerId);
				await fsPromises.unlink(thumbPath);
			}

			await limit(() => uploadToR2(fileBuffer, videoId, file, fencerId));
		});

		await Promise.all(uploadPromises);

		// Clean up temporary files
		await fsPromises.unlink(tempInputPath);
		await Promise.all(
			files.map((file) => fsPromises.unlink(path.join(outputDir, file))),
		);
		await fsPromises.rmdir(outputDir);

		return NextResponse.json(
			{ message: "HLS conversion successful" },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error during HLS conversion:", error);
		return NextResponse.json(
			{ message: "Error converting video" },
			{ status: 500 },
		);
	}
}

const uploadToR2 = async (video, videoId, segmentId, fencerId) => {
	const r2Client = new S3Client({
		region: "auto",
		endpoint:
			"https://aab5b28251de4c153b96e6f8d3179cbc.r2.cloudflarestorage.com",
		credentials: {
			accessKeyId: process.env.R2_ACCESS_KEY_ID,
			secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
		},
	});

	try {
		await r2Client.send(
			new PutObjectCommand({
				Bucket: process.env.BUCKET_NAME,
				Key: `${fencerId}/${videoId}/${segmentId}`,
				Body: video,
				ContentType: segmentId.endsWith(".m3u8")
					? "application/vnd.apple.mpegurl"
					: "video/MP2T",
			}),
		);
	} catch (error) {
		console.error("Error uploading to R2:", error);
	}
};

const uploadThumbnail = async (thumbnail, videoId, fencerId) => {
	const r2Client = new S3Client({
		region: "auto",
		endpoint:
			"https://aab5b28251de4c153b96e6f8d3179cbc.r2.cloudflarestorage.com",
		credentials: {
			accessKeyId: process.env.R2_ACCESS_KEY_ID,
			secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
		},
	});

	try {
		await r2Client.send(
			new PutObjectCommand({
				Bucket: process.env.BUCKET_NAME,
				Key: `${fencerId}/${videoId}/thumbnail.jpeg`,
				Body: thumbnail,
				ContentType: "image/jpeg",
			}),
		);
	} catch (error) {
		console.error("Error uploading to R2:", error);
	}
};

const generateThumbnail = async (
	inputPath,
	outputPath,
	timestamp = "00:00:05",
) => {
	try {
		await new Promise((resolve, reject) => {
			ffmpeg(inputPath)
				.seekInput(timestamp) // Set the timestamp for the thumbnail
				.frames(1) // Capture only one frame
				.outputOptions(["-q:v 2", "-update 1", "-frames:v 1"]) // Set quality and ensure only one image
				.output(outputPath)
				.on("start", (commandLine) => {
					console.log("FFmpeg command:", commandLine); // Logs FFmpeg command
				})
				.on("stderr", (stderrLine) => {
					console.log("FFmpeg stderr:", stderrLine); // Logs FFmpeg errors and warnings
				})
				.on("end", () => {
					console.log("Thumbnail generated:", outputPath);
					resolve(outputPath);
				})
				.on("error", (error) => {
					console.error("Error generating thumbnail:", error);
					reject(error);
				})
				.run();
		});
	} catch (error) {
		console.error("Error in thumbnail generation:", error);
		throw error;
	}
};
