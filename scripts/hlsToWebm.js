const ffmpeg = require("fluent-ffmpeg");
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
const os = require("node:os");
const cliProgress = require("cli-progress");

// Parse arguments
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
	.option("dry", {
		alias: "d",
		describe: "Dry run",
		type: "boolean",
		demandOption: false,
	})
	.help().argv;

const bucketName = argv.bucket;
const userId = argv.user_id;
const dry = argv.dry;

// S3 client
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

async function listVideosUnderUser() {
	console.log(
		`Listing videos for prefix "${userId}" in bucket "${bucketName}"...`,
	);

	let continuationToken = null;
	const allObjects = [];

	do {
		// Fetch objects from S3 with the continuation token
		const response = await s3Client.send(
			new ListObjectsV2Command({
				Bucket: bucketName,
				Prefix: `${userId}/`,
				ContinuationToken: continuationToken,
			}),
		);

		// Add the fetched objects to the list
		if (response.Contents) {
			allObjects.push(...response.Contents);
		}

		// Update the continuation token
		continuationToken = response.NextContinuationToken;
	} while (continuationToken); // Continue until there are no more results

	if (allObjects.length === 0) {
		throw new Error(`No videos found under user ID: ${userId}`);
	}

	// Filter and organize the objects by video ID
	const videoPrefixes = allObjects
		.map((obj) => obj.Key)
		.filter((key) => key.includes(".ts") || key.includes(".m3u8"))
		.reduce((acc, key) => {
			const videoId = key.split("/")[1];
			if (!acc[videoId]) {
				acc[videoId] = [];
			}
			acc[videoId].push(key);
			return acc;
		}, {});

	console.log(
		`Found ${allObjects.map((obj) => obj.Key).length} objects, or\n${Object.keys(videoPrefixes).length} videos`,
	);
	return videoPrefixes;
}

async function downloadVideo(videos) {
	for (const video of videos) {
		const tempInputPath = path.join(tempDir, video);
		console.log(`Downloading video from S3: ${video}`);

		if (!dry) {
			const data = await s3Client.send(
				new GetObjectCommand({ Bucket: bucketName, Key: video }),
			);
			fs.mkdirSync(path.dirname(tempInputPath), { recursive: true });

			const writeStream = fs.createWriteStream(tempInputPath);
			data.Body.pipe(writeStream);
			await new Promise((resolve) => writeStream.on("close", resolve));
		}
	}
}

async function generateWebM(videos) {
	const tempInputPath = path.join(
		tempDir,
		`${path.dirname(videos[0])}/playlist.m3u8`,
	);

	const outputFile = path.join(
		outputDir,
		`${path.dirname(videos[0])}/full_video.webm`,
	);

	const videoPrefix = path.dirname(videos[0]).split("/")[1];
	// console.log(`Generating WebM file for video ${videoPrefix}...`);

	if (!dry) {
		fs.mkdirSync(path.dirname(outputFile), { recursive: true });

		await new Promise((resolve, reject) => {
			ffmpeg(tempInputPath)
				.outputOptions([
					"-c:v libvpx-vp9",
					"-b:v 1M",
					"-c:a libopus",
					"-movflags +faststart",
				])
				.on("start", (commandLine) => {
					console.log("FFmpeg WebM command:", commandLine);
				})
				.on("stderr", (stderrLine) => {
					console.log("FFmpeg stderr (WebM):", stderrLine);
				})
				.on("end", () => {
					console.log(`WebM generation completed for ${videoPrefix}`);
					resolve();
				})
				.on("error", (error) => {
					console.error("Error generating WebM:", error);
					reject(error);
				})
				.save(outputFile);
		});
	}

	return outputFile;
}

async function uploadWebM(filePath, fileKey) {
	console.log(`Uploading WebM file to S3: ${fileKey}`);

	if (!dry) {
		const fileStream = fs.createReadStream(filePath);

		await s3Client.send(
			new PutObjectCommand({
				Bucket: bucketName,
				Key: fileKey,
				Body: fileStream,
				ContentType: "video/webm",
			}),
		);
	}

	console.log(`WebM file uploaded: ${fileKey}`);
}

// async function processVideos() {
// 	try {
// 		const videoPrefixes = await listVideosUnderUser();

// 		for (const videos of Object.keys(videoPrefixes)) {
// 			await downloadVideo(videoPrefixes[videos]);
// 			const outputFile = await generateWebM(videoPrefixes[videos]);
// 			await uploadWebM(outputFile, outputFile.split("output/")[1]);
// 		}
// 	} catch (error) {
// 		console.error("Error:", error);
// 	} finally {
// 		fs.rmSync(tempDir, { recursive: true, force: true });
// 	}
// }

// async function processVideos() {
// 	try {
// 		const videoPrefixes = await listVideosUnderUser();
// 		const maxConcurrentProcesses = os.cpus().length;
// 		const videoIds = Object.keys(videoPrefixes);

// 		console.log(
// 			`Processing ${videoIds.length} videos with up to ${maxConcurrentProcesses} concurrent workers.`,
// 		);

// 		// Split videos into chunks based on available CPU cores
// 		for (let i = 0; i < videoIds.length; i += maxConcurrentProcesses) {
// 			const videoChunk = videoIds.slice(i, i + maxConcurrentProcesses);

// 			await Promise.all(
// 				videoChunk.map(async (videoId) => {
// 					try {
// 						const videos = videoPrefixes[videoId];
// 						await downloadVideo(videos);
// 						const outputFile = await generateWebM(videos);
// 						await uploadWebM(outputFile, outputFile.split("output/")[1]);
// 					} catch (error) {
// 						console.error(`Error processing video ${videoId}:`, error);
// 					}
// 				}),
// 			);
// 		}
// 	} catch (error) {
// 		console.error("Error:", error);
// 	} finally {
// 		fs.rmSync(tempDir, { recursive: true, force: true });
// 	}
// }

async function processVideos() {
	try {
		const videoPrefixes = await listVideosUnderUser();
		const maxConcurrentProcesses = os.cpus().length;
		const videoIds = Object.keys(videoPrefixes);

		console.log(
			`Processing ${videoIds.length} videos with up to ${maxConcurrentProcesses} concurrent workers.`,
		);

		// Create a progress bar for the number of videos
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

		progressBar.start(videoIds.length, 0); // Start the progress bar

		// Split videos into chunks based on available CPU cores
		for (let i = 0; i < videoIds.length; i += maxConcurrentProcesses) {
			const videoChunk = videoIds.slice(i, i + maxConcurrentProcesses);

			await Promise.all(
				videoChunk.map(async (videoId) => {
					try {
						const videos = videoPrefixes[videoId];
						await downloadVideo(videos);
						const outputFile = await generateWebM(videos);
						await uploadWebM(outputFile, outputFile.split("output/")[1]);
						progressBar.increment(); // Increment progress after each video
					} catch (error) {
						console.error(`Error processing video ${videoId}:`, error);
					}
				}),
			);
		}

		progressBar.stop(); // Stop the progress bar when done
	} catch (error) {
		console.error("Error:", error);
	} finally {
		fs.rmSync(tempDir, { recursive: true, force: true });
	}
}

processVideos();
