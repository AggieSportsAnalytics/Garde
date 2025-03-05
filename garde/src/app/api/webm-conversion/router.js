import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import { promises as fsPromises } from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);

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

		try {
			const webmOutputPath = path.join("/tmp", `webm_output_${videoId}.webm`);

			await transcodeToWebM(tempInputPath, webmOutputPath);
			const transcodedBuffer = await fsPromises.readFile(webmOutputPath);

			await uploadToR2(
				transcodedBuffer,
				videoId,
				"full_video.webm",
				fencerId,
				"video/webm",
			);

			await fsPromises.rm(webmOutputPath);
		} catch (error) {
			try {
				console.error(error);
				await uploadToR2(
					arrayBuffer,
					videoId,
					`full_video.${fileExtension}`,
					fencerId,
					videoFile.type,
				);
			} catch (error) {
				console.error(error);
			}
		}

		await fsPromises.rmdir(outputDir);

		return NextResponse.json(
			{ message: "Video upload successful" },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error during upload:", error);
		return NextResponse.json({ message: "Error uploading" }, { status: 500 });
	}
}

async function transcodeToWebM(inputPath, outputPath) {
	return new Promise((resolve, reject) => {
		ffmpeg(inputPath)
			.outputOptions(["-c:v libvpx", "-b:v 1M", "-c:a libvorbis"])
			.on("end", () => {
				resolve();
			})
			.on("error", (err) => {
				reject(err);
			})
			.save(outputPath);
	});
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
