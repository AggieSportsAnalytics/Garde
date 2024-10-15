export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const { DB, BUCKET } = env;
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
			} else if (request.method === "DELETE") {
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
						BUCKET,
					);
				}
			} else if (request.method === "GET") {
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

				if (path.includes("/getFencerAngles")) {
					const pathName = path.split("/");
					return await getFencerAngles(pathName[pathName.length - 1], DB);
				}

				if (path === "/getIdealAngles") {
					return await getIdealAngles(DB);
				}

				if (path.includes("/getCoach")) {
					const pathName = path.split("/");
					return await getCoach(pathName[pathName.length - 1], DB);
				}

				if (path.includes("/getFencer")) {
					const pathName = path.split("/");
					return await getFencer(pathName[pathName.length - 1], DB);
				}
			} else if (request.method === "PUT") {
				if (path.includes("/putInstruction")) {
					const pathName = path.split("/");
					return await putInstruction(pathName[pathName.length - 1], DB);
				}

				const body = await request.json();

				if (path.includes("/putUserAngles")) {
					const pathName = path.split("/");
					return await putAngleData(
						pathName[pathName.length - 1],
						body.accuracy,
						DB,
					);
				}

				if (path === "/putCoachFencer") {
					return await putCoachFencer(
						body.fencerId,
						body.coachId,
						body.fencerName,
						body.fencerEmail,
						DB,
					);
				}
			}
			return addCorsHeaders(
				new Response(JSON.stringify({ message: "Method not allowed" }), {
					status: 405,
					headers: {
						"Content-Type": "application/json",
					},
				}),
			);
		} catch (error) {
			const err = new Response(
				JSON.stringify({
					error: error.message,
				}),
				{
					status: 200 <= error.status < 300 ? 500 : error.status,
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
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders,
	});
}

async function putInstruction(fencerInstruction, DB) {
	const query = `
        INSERT OR IGNORE INTO fencer_instructions (name)
		VALUES (?);
    `;
	await DB.prepare(query).bind(fencerInstruction).run();

	const res = new Response(
		JSON.stringify({ message: "Successfully put instruction" }),
		{
			status: 201,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
	return addCorsHeaders(res);
}

async function putCoachFencer(fencerId, coachId, fencerName, fencerEmail, DB) {
	const query =
		"INSERT OR IGNORE INTO coach_fencer (coach_id, fencer_id, fencer_name, fencer_email) VALUES (?, ?, ?, ?);";
	await DB.prepare(query)
		.bind(coachId, fencerId, fencerName, fencerEmail)
		.run();

	const res = new Response(
		JSON.stringify({ message: "Successfully added fencer to coach" }),
		{
			status: 201,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
	return addCorsHeaders(res);
}

async function putAngleData(fencerId, accuracy, DB) {
	const queryPut =
		"INSERT OR REPLACE INTO fencer_sessions (fencer_id, accuracy) VALUES (?, ?);";

	await DB.prepare(queryPut).bind(fencerId, accuracy).run();

	const res = new Response(
		JSON.stringify({ message: "Successfully added angle data" }),
		{
			status: 201,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
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
				headers: {
					"Content-Type": "application/json",
				},
			}),
		);
	}

	const updateQuery = `UPDATE ${type} SET is_verified = 1 WHERE email = ?`;
	await DB.prepare(updateQuery).bind(email).run();

	const newUser = await DB.prepare(query).bind(email).all();

	if (newUser.results[0].is_verified === 1) {
		return addCorsHeaders(
			new Response(JSON.stringify({ message: "Successfully verified email" }), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			}),
		);
	}

	return addCorsHeaders(
		new Response(JSON.stringify({ error: "Failed to verify email" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		}),
	);
}

async function authGoogle(id, email, name, type, DB) {
	// remove this code once Garde goes public
	const isWhitelisted = await isOnWhitelist(email, DB);
	if (!isWhitelisted) {
		return addCorsHeaders(
			new Response(
				JSON.stringify({
					error:
						"Garde is currently in closed beta please contact 'gardefencing@gmail.com' to be granted access to Garde",
				}),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json",
					},
				},
			),
		);
	}

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
			const res = new Response(
				JSON.stringify({
					message: "User exists, logging in",
					data: {
						id: user.unique_id,
					},
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			return addCorsHeaders(res);
		}

		return addCorsHeaders(
			new Response(
				JSON.stringify({
					error: "Non-google signin found, please use email/password signin",
				}),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				},
			),
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
		return addCorsHeaders(
			new Response(
				JSON.stringify({
					error: "Failed to create user",
				}),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
					},
				},
			),
		);
	}

	const res = new Response(
		JSON.stringify({ message: "Successfully created user", data: { id: id } }),
		{
			status: 201,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	return addCorsHeaders(res);
}

// remove this code once Garde goes public
async function isOnWhitelist(email, DB) {
	const fetched = await DB.prepare("SELECT * FROM whitelist WHERE email = ?")
		.bind(email)
		.all();

	if (fetched.results.length < 1) {
		return false;
	}

	return true;
}

async function auth(type, name, email, password, id, DB) {
	// remove this code once Garde goes public
	const isWhitelisted = await isOnWhitelist(email, DB);
	if (!isWhitelisted) {
		return addCorsHeaders(
			new Response(
				JSON.stringify({
					error:
						"Garde is currently in closed beta please contact 'gardefencing@gmail.com' to be granted access to Garde",
				}),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json",
					},
				},
			),
		);
	}

	// Check if the user already exists in the database
	const fetched = await DB.prepare(`SELECT * FROM ${type} WHERE email = ?`)
		.bind(email)
		.all();

	if (fetched.results.length > 0) {
		return addCorsHeaders(
			new Response(
				JSON.stringify({
					error: "User already exists",
				}),
				{
					status: 409,
					headers: {
						"Content-Type": "application/json",
					},
				},
			),
		);
	}

	// User does not exist, create a new user
	const result = await DB.prepare(`
        INSERT OR IGNORE INTO ${type} (unique_id, name, email, password, is_verified)
        VALUES (?, ?, ?, ?, ?);
    `)
		.bind(id, name, email, password, 0)
		.run();

	if (!result.success) {
		return addCorsHeaders(
			new Response(
				JSON.stringify({
					error: "Failed to create user",
				}),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
					},
				},
			),
		);
	}

	const res = new Response(
		JSON.stringify({ message: "Successfully created user" }),
		{
			status: 201,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	return addCorsHeaders(res);
}

async function getFencer(id, DB) {
	const result = await DB.prepare(
		"SELECT * FROM fencer_sessions WHERE fencer_id = ?",
	)
		.bind(id)
		.all();

	const res = new Response(
		JSON.stringify({
			data: result.results,
			message: "Succesfully retrieved fencer sessions",
		}),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	return addCorsHeaders(res);
}

async function getCoach(id, DB) {
	const result = await DB.prepare(
		"SELECT * FROM coach_fencer WHERE coach_id = ?",
	)
		.bind(id)
		.all();

	const res = new Response(
		JSON.stringify({
			data: result.results,
			message: "Successfully got coach's fencers",
		}),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	return addCorsHeaders(res);
}

async function verify(type, email, DB) {
	// Query the user by email
	const fetched = await DB.prepare(`SELECT * FROM ${type} WHERE email = ?`)
		.bind(email)
		.all();

	if (fetched.results.length === 0) {
		return addCorsHeaders(
			new Response(
				JSON.stringify({
					error: "User does not exist",
				}),
				{
					status: 404,
					headers: {
						"Content-Type": "application/json",
					},
				},
			),
		);
	}

	const user = fetched.results[0];

	if (user.is_verified === 0) {
		return addCorsHeaders(
			new Response(
				JSON.stringify({
					error: "User has not verified their email",
				}),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
					},
				},
			),
		);
	}

	const res = new Response(
		JSON.stringify({
			data: {
				id: user.unique_id,
				name: user.name,
				password: user.password,
			},
			message: "Successfully verified user",
		}),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json",
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
	await DB.prepare(query).bind(fencerId, coachId).run();

	const res = new Response(
		JSON.stringify({ message: "Coach-Fencer relation deleted" }),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	return addCorsHeaders(res);
}

async function deleteUser(id, type, DB, BUCKET) {
	const query = `
        DELETE FROM ${type}
        WHERE unique_id = ?;
    `;
	await DB.prepare(query).bind(id).run();

	const listResult = await BUCKET.list({ prefix: id });

	if (listResult.objects.length > 0) {
		await Promise.all(
			listResult.objects.map(async (video) => {
				await BUCKET.delete(video.key);
			}),
		);
	}

	const res = new Response(JSON.stringify({ message: `${type} deleted` }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});

	return addCorsHeaders(res);
}

async function getIdealAngles(DB) {
	const query = "SELECT * FROM ideal_angles";
	const angles = await DB.prepare(query).run();

	const res = new Response(
		JSON.stringify(
			{ message: "Successfully got angles", angles: angles },
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			},
		),
	);

	return addCorsHeaders(res);
}

async function getFencerAngles(id, DB) {
	const query = "SELECT * FROM fencer_sessions WHERE fencer_id = ?";
	const angles = await DB.prepare(query).bind(id).run();

	const res = new Response(
		JSON.stringify(
			{ message: "Successfully got angles", angles: angles },
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			},
		),
	);

	return addCorsHeaders(res);
}
