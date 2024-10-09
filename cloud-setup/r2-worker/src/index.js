export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const { BUCKET } = env;
		const path = url.pathname;

		try {
			if (request.method === "OPTIONS") {
				return handleOptionsRequest();
			}

			if (request.method === "GET") {
				if (url.pathname === "/") {
					return handleGetRequest();
				}

				if (path === "/getVideoChunks") {
					const fencerId = url.searchParams.get("fencerId");
					const videoId = url.searchParams.get("videoId");

					const key = `${fencerId}/${videoId}`;
					return await getVideoChunks(
						key,
						url.searchParams.get("range"),
						BUCKET,
					);
				}

				if (path.includes("/listBucket")) {
					const pathName = path.split("/");
					return await listBucket(pathName[pathName.length - 1], BUCKET);
				}

				return new Response("Not found", { status: 404 });
			}

			if (request.method === "PUT") {
				if (url.pathname === "/putVideo") {
					const body = await request.formData();

					const file = body.get("file");
					const filename = file.name;
					return await uploadVideo(file, filename, BUCKET);
				}

				return new Response("Not found", { status: 404 });
			}

			// Return an error for unsupported methods
			return new Response("Method not allowed", { status: 405 });
		} catch (error) {
			const err = new Response(
				JSON.stringify({
					error: error.message,
				}),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			return addCorsHeaders(err);
		}
	},
};

// default get request (test)
function handleGetRequest() {
	return new Response(JSON.stringify({ message: "success" }));
}

// Function to handle preflight OPTIONS requests (CORS)
function handleOptionsRequest() {
	return new Response(null, {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT", // Allow GET, POST, and OPTIONS methods
			"Access-Control-Allow-Headers": "Content-Type", // Allow headers like Content-Type
		},
	});
}

function addCorsHeaders(response) {
	const newHeaders = new Headers(response.headers);
	newHeaders.set("Access-Control-Allow-Origin", "*");
	newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT");
	newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Range");

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders,
	});
}

async function getVideoChunks(videoId, range, BUCKET) {
	const video = await BUCKET.get(videoId);
	if (!video) {
		return new Response("Video not found", { status: 404 });
	}

	// Ensure the range request is handled correctly
	const { size } = video;
	let [start, end] = range
		.replace(/bytes=/, "")
		.split("-")
		.map(Number);
	start = Number.isNaN(start) ? 0 : start;
	end = Number.isNaN(end) ? size - 1 : Math.min(end, size - 1);

	// Chunk size and video slicing
	const chunkSize = end - start + 1;
	const stream = video.slice(start, end + 1);

	// Prepare headers for partial content response
	const headers = new Headers({
		"Content-Range": `bytes ${start}-${end}/${size}`,
		"Accept-Ranges": "bytes",
		"Content-Length": chunkSize,
		"Content-Type": "video/mp4", // Adjust based on actual content type
	});

	const res = new Response(stream, {
		status: 206, // Partial content
		headers,
	});

	return addCorsHeaders(res); // Ensure CORS headers are added
}

// uploading video to bucket
async function uploadVideo(file, filename, BUCKET) {
	await BUCKET.put(filename, file.stream(), {
		httpMetadata: { contentType: file.type },
	});

	const res = new Response(JSON.stringify({ message: "Success" }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
	return addCorsHeaders(res);
}

// Listing bucket under prefix (user id)
async function listBucket(prefix, BUCKET) {
	const items = await BUCKET.list({ prefix: prefix });
	const videos = items.objects.map((object) => ({
		key: object.key,
		lastModified: object.uploaded,
	}));

	const res = new Response(JSON.stringify({ videos: videos }), {
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		},
	});

	return addCorsHeaders(res);
}
