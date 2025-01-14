/**
 * worker.js
 */
const { parentPort, workerData } = require("node:worker_threads");
const ffmpeg = require("fluent-ffmpeg");
const path = require("node:path");
const fs = require("node:fs");

/**
 * workerData = {
 *   m3u8File: "userId/videoId/video/playlist.m3u8", // the S3 key for the .m3u8
 *   tempDir: "/.../temp",
 *   outputDir: "/.../temp/output"
 * }
 */
async function processVideo({ m3u8File, tempDir, outputDir }) {
	// Construct the local path of the .m3u8 we downloaded
	const localM3U8Path = path.join(tempDir, m3u8File);

	// We will create full_video.webm in the same relative path inside `outputDir`
	const dirname = path.dirname(m3u8File); // e.g. "userId/videoId/video"
	const outputFile = path.join(outputDir, dirname, "full_video.webm");

	if (fs.existsSync(outputFile)) {
		console.log(`Webm File already exists, skipping: ${outputFile}`);
		return outputFile;
	}

	// Ensure output directory exists
	fs.mkdirSync(path.dirname(outputFile), { recursive: true });

	console.log(`\n[Worker] Processing M3U8: ${localM3U8Path}`);
	console.log(`[Worker] Output File: ${outputFile}\n`);

	return new Promise((resolve, reject) => {
		ffmpeg(localM3U8Path)
			.outputOptions([
				"-c:v libvpx-vp9", // Video codec
				"-b:v 1M", // Video bitrate
				"-c:a libopus", // Audio codec
				"-movflags +faststart", // Optimize for progressive playback
			])
			.on("start", (commandLine) => {
				console.log(`[Worker] FFmpeg command: ${commandLine}`);
			})
			.on("stderr", (stderrLine) => {
				// Remove or redirect if too verbose
				console.error(`[Worker] FFmpeg stderr: ${stderrLine}`);
			})
			.on("end", () => {
				console.log(`[Worker] Completed: ${outputFile}`);
				resolve(outputFile);
			})
			.on("error", (error) => {
				console.error(`[Worker] FFmpeg error: ${error.message}`);
				reject(error);
			})
			.save(outputFile);
	});
}

async function processVideoWithTimeout(
	{ m3u8File, tempDir, outputDir },
	timeoutMs,
) {
	const timeoutPromise = new Promise((_, reject) =>
		setTimeout(() => reject(new Error("Processing timeout")), timeoutMs),
	);

	const processPromise = processVideo({ m3u8File, tempDir, outputDir });

	return Promise.race([processPromise, timeoutPromise]);
}

processVideoWithTimeout(workerData, 5 * 60 * 1000) // Set timeout to 5 minutes
	.then((outputFile) => {
		parentPort.postMessage({ success: true, outputFile });
	})
	.catch((error) => {
		parentPort.postMessage({ success: false, error: error.message });
	});
