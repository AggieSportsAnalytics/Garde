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
			} else if (request.method === "PUT") {
				if (url.pathname === "/putVideo") {
					const body = await request.formData();

					const file = body.get("file");
					const filename = file.name;
					return await uploadVideo(file, filename, BUCKET);
				}
			}

			// Return an error for unsupported methods
			return new Response("Method not allowed", { status: 405 });
		} catch (error) {
			const err = new Response(
				JSON.stringify({
					error: error.message,
				}),
				{
					status: error.status,
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
	return new Response(JSON.stringify({ message: "success" }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

// Function to handle preflight OPTIONS requests (CORS)
function handleOptionsRequest() {
	return new Response(null, {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT", // Allow GET, POST, and OPTIONS methods
			"Access-Control-Allow-Headers": "Content-Type, Range", // Allow headers like Content-Type
		},
	});
}

function addCorsHeaders(response) {
	const newHeaders = new Headers(response.headers);
	newHeaders.set("Access-Control-Allow-Origin", "*");
	newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT");
	newHeaders.set("Access-Control-Allow-Headers", "Content-Type");

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders,
	});
}

async function getVideoChunks(videoId, range, BUCKET) {
	const video = await BUCKET.get(videoId);
	if (!video) {
		return new Response(JSON.stringify({ message: "Video not found" }), {
			status: 404,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
	const { size } = video;
	let [start, end] = range.split("-").map(Number);
	start = Number.isNaN(start) ? 0 : start;
	end = Number.isNaN(end) ? size - 1 : Math.min(end, size - 1);
	const stream = video.body;
	const res = new Response(stream, {
		status: 200,
		headers: {
			"Content-Type": "video/mp4",
		},
	});
	return addCorsHeaders(res);
}

// uploading video to bucket
async function uploadVideo(file, filename, BUCKET) {
	await BUCKET.put(filename, file.stream(), {
		httpMetadata: { contentType: file.type },
	});

	const res = new Response(JSON.stringify({ message: "Success" }), {
		status: 201,
		headers: {
			"Content-Type": "application/json",
		},
	});
	return addCorsHeaders(res);
}

// Listing bucket under prefix (user id)
async function listBucket(prefix, BUCKET) {
	if (prefix === "") {
		const res = new Response(JSON.stringify({ error: "No fencer detected" }), {
			status: 404,
			headers: {
				"Content-Type": "application/json",
			},
		});

		return addCorsHeaders(res);
	}
	const items = await BUCKET.list({ prefix: prefix });
	const videos = items.objects.map((object) => ({
		key: object.key,
		lastModified: object.uploaded,
	}));

	const res = new Response(
		JSON.stringify({ videos: videos, message: "Successfully listed bucket" }),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	return addCorsHeaders(res);
}
