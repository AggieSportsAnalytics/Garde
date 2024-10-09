export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const { DB } = env;
		const path = url.pathname;

		try {
			if (request.method === "OPTIONS") {
				return handleOptionsRequest();
			}

			if (request.method === "POST") {
				const body = await request.json();

				if (path === "/verifyEmail") {
					return await verifyEmail(body.email, body.type, DB);
				}
				if (path === "/authGoogle") {
					return await authGoogle(
						body.id,
						body.email,
						body.name,
						body.type,
						DB,
					);
				}
				if (path === "/auth") {
					return await auth(
						body.type,
						body.name,
						body.email,
						body.password,
						body.id,
						DB,
					);
				}
			}

			if (request.method === "DELETE") {
				if (path === "/deleteCoachFencer") {
					return await deleteCoachFencers(
						url.searchParams.get("fencerId"),
						url.searchParams.get("coachId"),
						DB,
					);
				}

				if (path === "/deleteUser") {
					return await deleteUser(
						url.searchParams.get("id"),
						url.searchParams.get("type"),
						DB,
					);
				}
			}

			if (request.method === "GET") {
				if (path === "/") {
					return handleGetRequest();
				}

				if (path === "/verify") {
					return await verify(
						url.searchParams.get("type"),
						url.searchParams.get("email"),
						DB,
					);
				}

				if (path.includes("/getCoach")) {
					const pathName = path.split("/");
					return await getCoach(pathName[pathName.length - 1], DB);
				}

				if (path.includes("/getFencer")) {
					const pathName = path.split("/");
					return await getFencer(pathName[pathName.length - 1], DB);
				}
			}

			if (request.method === "PUT") {
				if (path.includes("/putInstruction")) {
					const pathName = path.split("/");
					return await putInstruction(pathName[pathName.length - 1], DB);
				}

				const body = await request.json();

				if (path === "/putCoachFencer") {
					return await putCoachFencer(
						body.fencerId,
						body.coachId,
						body.fencerName,
						DB,
					);
				}

				if (path === "/putAngleData") {
					return await putAngleData(body.fencerId, body.angleData, DB);
				}
			}
			return addCorsHeaders(
				new Response("Method not allowed", { status: 405 }),
			);
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

// default get method (test)
function handleGetRequest() {
	return new Response(JSON.stringify({ message: "success" }));
}

// Function to handle preflight OPTIONS requests (CORS)
function handleOptionsRequest() {
	return new Response(null, {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE", // Allow GET, POST, and OPTIONS methods
			"Access-Control-Allow-Headers": "Content-Type", // Allow headers like Content-Type
		},
	});
}

// adding headers so response isn't rejected by browser
function addCorsHeaders(response) {
	const newHeaders = new Headers(response.headers);
	newHeaders.set("Access-Control-Allow-Origin", "*");
	newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT");
	newHeaders.set("Access-Control-Allow-Headers", "Content-Type");

	return new Response(response.body, {
		status: response.status, // Keep the original status
		statusText: response.statusText, // Keep the status text
		headers: newHeaders, // Use modified headers
	});
}

async function putInstruction(fencerInstruction, DB) {
	const query = `
        INSERT OR IGNORE INTO fencer_instructions (name)
		VALUES (?);
    `;
	await DB.prepare(query).bind(fencerInstruction).run();

	const res = new Response(JSON.stringify({ message: "Success" }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
	return addCorsHeaders(res);
}

async function putCoachFencer(fencerId, coachId, fencerName, DB) {
	const query =
		"INSERT OR IGNORE INTO coach_fencer (coach_id, fencer_id, fencer_name) VALUES (?, ?, ?);";
	await DB.prepare(query).bind(coachId, fencerId, fencerName).run();

	const res = new Response(JSON.stringify({ message: "Success" }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
	return addCorsHeaders(res);
}

async function putAngleData(fencerId, angleData, DB) {
	const query =
		"INSERT OR REPLACE INTO fencer_sessions (fencer_id, speed, left_elbow, right_elbow, left_hip, right_hip, left_knee, right_knee, feet_distance, accuracy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";

	await DB.prepare(query)
		.bind(
			fencerId,
			angleData.speed,
			angleData.left_elbow,
			angleData.right_elbow,
			angleData.left_hip,
			angleData.right_hip,
			angleData.left_knee,
			angleData.right_knee,
			angleData.feet_distance,
			angleData.accuracy,
		)
		.run();

	const res = new Response(JSON.stringify({ message: "Success" }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
	return addCorsHeaders(res);
}

async function verifyEmail(email, type, DB) {
	const query = `SELECT * FROM ${type} WHERE email = ?`;
	const user = await DB.prepare(query).bind(email).all();

	// Check if the user exists
	if (user.results.length === 0) {
		return addCorsHeaders(
			new Response(JSON.stringify({ error: "User not found" }), {
				status: 404,
			}),
		);
	}

	const updateQuery = `UPDATE ${type} SET is_verified = 1 WHERE email = ?`;
	await DB.prepare(updateQuery).bind(email).run();

	const newUser = await DB.prepare(query).bind(email).all();

	if (newUser.results[0].is_verified === 1) {
		return addCorsHeaders(
			new Response(JSON.stringify({ message: "Successfully verified email" })),
		);
	}

	return addCorsHeaders(
		new Response(JSON.stringify({ error: "Failed to verify email" })),
	);
}

async function authGoogle(id, email, name, type, DB) {
	const googlePassword = "google";

	// Check if the user already exists in the database
	const fetched = await DB.prepare(`SELECT * FROM ${type} WHERE email = ?`)
		.bind(email)
		.all();

	let user;
	if (fetched.results.length > 0) {
		user = fetched.results[0];

		// If the user exists and the password is "google", return id and name
		if (user.password === googlePassword) {
			const res = new Response(JSON.stringify({ id: user.unique_id }), {
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*", // Allow requests from any origin
				},
			});

			return addCorsHeaders(res);
		}

		throw new Error(
			"Non-google signin found, please use email/password signin",
		);
	}

	// User does not exist, create a new user
	const result = await DB.prepare(`
        INSERT INTO ${type} (unique_id, name, email, password, is_verified)
        VALUES (?, ?, ?, ?, ?);
    `)
		.bind(id, name, email, googlePassword, 1)
		.run();

	if (!result.success) {
		throw new Error("Failed to create user");
	}

	const res = new Response(JSON.stringify({ id: id }), {
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*", // Allow requests from any origin
		},
	});

	return addCorsHeaders(res);
}

async function auth(type, name, email, password, id, DB) {
	// Check if the user already exists in the database
	const fetched = await DB.prepare(`SELECT * FROM ${type} WHERE email = ?`)
		.bind(email)
		.all();

	if (fetched.results.length > 0) {
		throw new Error("User already exists");
	}

	// User does not exist, create a new user
	const result = await DB.prepare(`
        INSERT OR IGNORE INTO ${type} (unique_id, name, email, password, is_verified)
        VALUES (?, ?, ?, ?, ?);
    `)
		.bind(id, name, email, password, 0)
		.run();

	if (!result.success) {
		throw new Error("Failed to create user");
	}

	const res = new Response(JSON.stringify({ success: true }), {
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*", // Allow requests from any origin
		},
	});

	return addCorsHeaders(res);
}

async function getFencer(id, DB) {
	const result = await DB.prepare(
		"SELECT * FROM fencer_sessions WHERE fencer_id = ?",
	)
		.bind(id)
		.all();

	const res = new Response(JSON.stringify(result.results), {
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*", // Allow requests from any origin
		},
	});

	return addCorsHeaders(res);
}

async function getCoach(id, DB) {
	const result = await DB.prepare(
		"SELECT * FROM coach_fencer WHERE coach_id = ?",
	)
		.bind(id)
		.all();

	const res = new Response(JSON.stringify(result.results), {
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*", // Allow requests from any origin
		},
	});

	return addCorsHeaders(res);
}

async function verify(type, email, DB) {
	// Query the user by email
	const fetched = await DB.prepare(`SELECT * FROM ${type} WHERE email = ?`)
		.bind(email)
		.all();

	if (fetched.results.length === 0) {
		throw new Error("User does not exist");
	}

	const user = fetched.results[0];

	if (user.is_verified === 0) {
		throw new Error("User has not verified their email");
	}

	const res = new Response(
		JSON.stringify({
			id: user.unique_id,
			name: user.name,
			password: user.password,
		}),
		{
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*", // Allow requests from any origin
			},
		},
	);

	return addCorsHeaders(res);
}

async function deleteCoachFencers(fencerId, coachId, DB) {
	const query = `
        DELETE FROM coach_fencer
        WHERE fencer_id = ? AND coach_id = ?;
    `;
	const result = await DB.prepare(query).bind(fencerId, coachId).run();

	const res = new Response(
		JSON.stringify({ message: "Coach-Fencer relation deleted", result }),
		{
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		},
	);

	return addCorsHeaders(res);
}

async function deleteUser(id, type, DB) {
	const query = `
        DELETE FROM ${type}
        WHERE unique_id = ?;
    `;
	const result = await DB.prepare(query).bind(id).run();

	const res = new Response(
		JSON.stringify({ message: `${type} deleted`, result }),
		{
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		},
	);

	return addCorsHeaders(res);
}
