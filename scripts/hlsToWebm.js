/**
 * hlsToWebm.js
 */
const path = require("node:path");
const fs = require("node:fs");
const {
	S3Client,
	GetObjectCommand,
	PutObjectCommand,
	ListObjectsV2Command,
} = require("@aws-sdk/client-s3");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
require("dotenv").config();
const cliProgress = require("cli-progress");
const { Worker } = require("node:worker_threads");

const argv = yargs(hideBin(process.argv))
	.option("bucket", {
		alias: "b",
		describe: "Name of the S3 bucket",
		type: "string",
		demandOption: true,
	})
	.option("user_id", {
		alias: "u",
		describe: "User/Tournament ID to process",
		type: "string",
		demandOption: true,
	})
	.option("check", {
		alias: "c",
		describe: "See how many videos need to be processed",
		type: "boolean",
		demandOption: false,
	})
	.option("retry", {
		alias: "r",
		describe: "Run FFmpeg even if .webm file exists",
		type: "boolean",
		demandOption: false,
	})
	.option("no_timeout", {
		alias: "n",
		describe: "See how many videos need to be processed",
		type: "boolean",
		demandOption: false,
	})
	.help().argv;

const bucketName = argv.bucket;
const userId = argv.user_id;
const check = argv.check;
const retry = argv.retry;
const noTimeout = argv.no_timeout;

// Configure S3 client
const s3Client = new S3Client({
	region: "auto",
	endpoint: "https://aab5b28251de4c153b96e6f8d3179cbc.r2.cloudflarestorage.com",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

// Temporary directories
const tempDir = path.join(__dirname, "temp");
const outputDir = path.join(tempDir, "output");

// Ensure directories exist
fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

/**
 * List all .ts and .m3u8 files under `userId/` prefix (including continuation).
 */
async function listVideosUnderUser() {
	console.log(
		`Listing videos for prefix "${userId}" in bucket "${bucketName}"...`,
	);
	let continuationToken = null;
	const allObjects = [];

	do {
		const response = await s3Client.send(
			new ListObjectsV2Command({
				Bucket: bucketName,
				Prefix: `${userId}/`,
				ContinuationToken: continuationToken,
			}),
		);

		if (response.Contents) {
			allObjects.push(...response.Contents);
		}

		continuationToken = response.NextContinuationToken;
	} while (continuationToken);

	if (allObjects.length === 0) {
		throw new Error(`No videos found under user ID: ${userId}`);
	}

	// Filter by .ts or .m3u8, then group by videoId (the second segment in the key)
	const videoPrefixes = allObjects
		.map((obj) => obj.Key)
		.filter(
			(key) =>
				key.includes(".ts") || key.includes(".m3u8") || key.includes(".webm"),
		)
		.reduce((acc, key) => {
			const videoId = key.split("/")[1]; // userId/videoId/...
			if (!acc[videoId]) {
				acc[videoId] = [];
			}
			acc[videoId].push(key);
			return acc;
		}, {});

	const webmFiles = allObjects
		.map((obj) => obj.Key)
		.filter((key) => key.endsWith(".webm"));

	console.log(webmFiles);

	if (!retry) {
		for (const webmKey of webmFiles) {
			const videoId = webmKey.split("/")[1];
			delete videoPrefixes[videoId];
			console.log(`Not considering ${videoId} because it has full video`);
		}
	}

	console.log(
		`Found ${allObjects.length} objects total. ` +
			`${Object.keys(videoPrefixes).length} videos need to be processed`,
		`${webmFiles.length} full videos found`,
	);

	if (check) {
		console.log("Exiting, check flag enabled");
		process.exit(0);
	}

	return videoPrefixes;
}

/**
 * Download all .ts and .m3u8 files to tempDir
 */
async function downloadVideo(videos) {
	for (const videoKey of videos) {
		const localPath = path.join(tempDir, videoKey);

		// Check if the file already exists
		if (fs.existsSync(localPath)) {
			console.log(`.ts segments already exist, skipping: ${localPath}`);
			continue; // Skip this file if it already exists
		}

		console.log(`Downloading: s3://${bucketName}/${videoKey}`);

		const data = await s3Client.send(
			new GetObjectCommand({ Bucket: bucketName, Key: videoKey }),
		);

		fs.mkdirSync(path.dirname(localPath), { recursive: true });
		const writeStream = fs.createWriteStream(localPath);
		data.Body.pipe(writeStream);
		await new Promise((resolve) => writeStream.on("close", resolve));
	}
}

/**
 * Worker Pool Approach: runWorker spawns the worker.js script to handle FFmpeg.
 */
function runWorker(videoM3U8, tempDir, outputDir) {
	return new Promise((resolve, reject) => {
		const worker = new Worker(path.join(__dirname, "worker.js"), {
			workerData: {
				m3u8File: videoM3U8,
				tempDir,
				outputDir,
				noTimeout,
				retry,
			},
		});

		worker.on("message", (message) => {
			if (message.success) {
				resolve(message.outputFile);
			} else {
				if (message.error === "Processing timeout") {
					console.warn(`[Main] Skipping video: ${videoM3U8} due to timeout.`);
				}
				reject(new Error(message.error));
			}
		});

		worker.on("error", reject);
		worker.on("exit", (code) => {
			if (code !== 0) {
				reject(new Error(`Worker stopped with exit code ${code}`));
			}
		});
	});
}

async function uploadWebM(filePath, fileKey) {
	console.log(`Uploading WebM to s3://${bucketName}/${fileKey}`);

	const fileStream = fs.createReadStream(filePath);
	await s3Client.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key: fileKey,
			Body: fileStream,
			ContentType: "video/webm",
		}),
	);

	console.log(`Upload complete: s3://${bucketName}/${fileKey}`);
}

/**
 * Main function: process each "videoId" in parallel, but first download all files,
 * find the .m3u8, run FFmpeg in a worker, then upload the result.
 */
async function processVideos() {
	try {
		const videoPrefixes = await listVideosUnderUser();
		const videoIds = Object.keys(videoPrefixes);

		const progressBar = new cliProgress.SingleBar(
			{
				format:
					"Processing Videos | {bar} | {percentage}% || {value}/{total} videos",
				barCompleteChar: "\u2588",
				barIncompleteChar: "\u2591",
				hideCursor: true,
			},
			cliProgress.Presets.shades_classic,
		);

		progressBar.start(videoIds.length, 0);

		await Promise.all(
			videoIds.map(async (videoId) => {
				try {
					// Example: ["userId/videoId/video/playlist.m3u8", "userId/videoId/video/segment0.ts", ...]
					const videos = videoPrefixes[videoId];

					// 1. Download all .ts and .m3u8
					await downloadVideo(videos);

					// 2. Identify the .m3u8 file
					const m3u8FileKey = videos.find((key) => key.endsWith(".m3u8"));
					if (!m3u8FileKey) {
						throw new Error(`No .m3u8 file found for videoId: ${videoId}`);
					}

					// 3. Offload FFmpeg to a worker
					const outputFile = await runWorker(m3u8FileKey, tempDir, outputDir);

					// 4. Upload final .webm
					const fileKey = outputFile.split("output/")[1]; // e.g. 'videoId/video/full_video.webm'
					await uploadWebM(outputFile, fileKey);

					progressBar.increment();
				} catch (error) {
					console.error(`Error processing video ${videoId}:`, error);
				}
			}),
		);

		progressBar.stop();

		const remainingVideos = await listVideosUnderUser();

		console.log(
			`${Object.keys(remainingVideos).length} videos remaining\n${remainingVideos}`,
		);
		if (Object.keys(remainingVideos).length === 0) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}

		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
	} finally {
		// Cleanup
		fs.rmSync(tempDir, { recursive: true, force: true });
	}
}

processVideos();
