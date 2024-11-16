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
		const fileExtension =
			videoFile.type.split("/")[1].split(";")[0] || "unknown";

		const tempInputPath = path.join(
			"/tmp",
			`input_${videoId}.${fileExtension}`,
		);
		const outputDir = path.join("/tmp", `hls_output_${videoId}`);
		await fsPromises.mkdir(outputDir, { recursive: true });

		// Save the video blob to a file
		const arrayBuffer = await videoFile.arrayBuffer();
		await fsPromises.writeFile(tempInputPath, Buffer.from(arrayBuffer));

		// const metadata = await getVideoMetadata(tempInputPath);
		await uploadMetadata({}, videoId, fencerId);

		// If hls conversion fails, upload full video to bucket as failsafe so video is not lost
		let files;
		try {
			await new Promise((resolve, reject) => {
				ffmpeg(tempInputPath)
					.outputOptions([
						"-c:v libx264",
						"-preset fast",
						"-c:a aac",
						"-b:a 128k",
						"-movflags +faststart",
						"-start_number 0",
						"-hls_time 10",
						"-hls_list_size 0",
						"-hls_segment_type mpegts",
						"-f hls",
					])
					.output(path.join(outputDir, "playlist.m3u8"))
					.on("start", (commandLine) => {
						console.log("FFmpeg HLS command:", commandLine);
					})
					.on("stderr", (stderrLine) => {
						console.log("FFmpeg stderr (HLS):", stderrLine);
					})
					.on("end", () => {
						console.log("HLS generation completed");
						resolve();
					})
					.on("error", (error) => {
						console.error("Error generating HLS:", error);
						reject(error);
					})
					.run();
			});

			// Read and upload the .m3u8 and .ts files to Cloudflare R2 or similar storage
			files = await fsPromises.readdir(outputDir);
			if (
				!files.includes("playlist.m3u8") ||
				!files.some((file) => file.endsWith(".ts"))
			) {
				throw new Error(
					"HLS generation failed: Missing required files in outputDir",
				);
			}
		} catch (error) {
			console.error(error);
			await uploadToR2(
				arrayBuffer,
				videoId,
				`full_video.${fileExtension}`,
				fencerId,
				videoFile.type,
			);
			return NextResponse.json(
				{ message: "Error converting video" },
				{ status: 500 },
			);
		}

		const thumbPath = path.join(outputDir, "thumbnail.jpeg");
		try {
			const len = (files.length - 1) * 10 - 5;
			const timestamp = Math.floor(len / 2);

			await generateThumbnail(tempInputPath, thumbPath, timestamp);
			const buff = await fsPromises.readFile(thumbPath);
			await uploadThumbnail(buff, videoId, fencerId);
			await fsPromises.unlink(thumbPath);
		} catch (error) {
			console.error(error);
		}

		const uploadPromises = files.map(async (file) => {
			const filePath = path.join(outputDir, file);
			const fileBuffer = await fsPromises.readFile(filePath);

			await limit(() => uploadToR2(fileBuffer, videoId, file, fencerId));
		});

		await Promise.all(uploadPromises);

		// Clean up temporary files
		await fsPromises.unlink(tempInputPath);
		await Promise.all(
			files.map(async (file) => {
				const filePath = path.join(outputDir, file);
				try {
					await fsPromises.unlink(filePath);
				} catch (error) {
					console.warn(
						`Warning: Could not delete file ${filePath}:`,
						error.message,
					);
				}
			}),
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

const uploadToR2 = async (
	video,
	videoId,
	segmentId,
	fencerId,
	contentType = null,
) => {
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
		let type;
		if (!contentType) {
			if (segmentId.endsWith(".m3u8")) {
				type = "application/vnd.apple.mpegurl";
			} else {
				type = "video/MP2T";
			}
		}

		await r2Client.send(
			new PutObjectCommand({
				Bucket: process.env.BUCKET_NAME,
				Key: `${fencerId}/${videoId}/${segmentId}`,
				Body: video,
				ContentType: contentType || type,
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
	timestamp = "00:00:01",
) => {
	try {
		await new Promise((resolve, reject) => {
			ffmpeg(inputPath)
				.inputOptions(["-skip_frame nokey"])
				.seekInput(timestamp)
				.frames(1)
				.outputOptions(["-q:v 2", "-update 1", "-strict unofficial"])
				.output(outputPath)
				.on("start", (commandLine) => {
					console.log("FFmpeg Thumbnail command:", commandLine);
				})
				.on("stderr", (stderrLine) => {
					console.log("FFmpeg stderr (Thumbnail):", stderrLine);
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
	}
};

const getVideoMetadata = async (videoPath) => {
	return new Promise((resolve, reject) => {
		ffmpeg(videoPath).ffprobe((err, metadata) => {
			if (err) {
				return reject(err);
			}
			resolve(metadata);
		});
	});
};

const uploadMetadata = async (metadata, videoId, fencerId) => {
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
		metadata.timestamp = new Date().toISOString();
		const metadataJson = JSON.stringify(metadata);

		await r2Client.send(
			new PutObjectCommand({
				Bucket: process.env.BUCKET_NAME,
				Key: `${fencerId}/${videoId}/metadata.json`,
				Body: metadataJson,
				ContentType: "application/json",
			}),
		);
	} catch (error) {
		console.error("Error uploading to R2:", error);
	}
};
