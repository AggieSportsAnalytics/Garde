export default {
	async fetch(request, env) {
		// Handle preflight OPTIONS request
		if (request.method === "OPTIONS") {
			return handleOptionsRequest();
		}

		// Handle POST requests
		if (request.method === "POST") {
			// coach page: SEND (coach id) -> RECEIVE (fencer ids, names) ## coach_fencers table
			// coach page: SEND (fencer id) -> RECEIVE (avg times, accuracy, all session data (based on analytics we wanna show)) ## fencers, fencer_sessions table
			return await handlePostRequest(request, env);
		}

		// else if request.method === "GET" {}

		if (request.method === "PUT") {
			// fencer page: SEND (fencer id, angle data) ## fencer_sessions table
			// coach page: SEND (fencer instruction) ## fencer_instructions table
			// signup/login: SEND (role (fencer or coach), uuid, name, email) ## fencer or coach table
			return await handlePutRequest(request, env);
		}

		if (request.method === "DELETE") {
			// coach page: SEND (fencer id, coach id) ## coach_fencers table
			return await handleDeleteRequest(request, env);
		}

		// Return an error for unsupported methods
		return new Response("Method not allowed", { status: 405 });
	},
};

// Function to handle preflight OPTIONS requests (CORS)
function handleOptionsRequest() {
	return new Response(null, {
		headers: {
			"Access-Control-Allow-Origin": "*", // Allow requests from any origin
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Allow GET, POST, and OPTIONS methods
			"Access-Control-Allow-Headers": "Content-Type", // Allow headers like Content-Type
		},
	});
}

async function handleDeleteRequest(request, env) {
	const { DB } = env;

	try {
		const body = await request.json();
		const { fencerId, coachId } = body; // Expecting fencer_id and coach_id in the body

		if (!fencerId || !coachId) {
			throw new Error("Both fencer_id and coach_id must be provided.");
		}

		// SQL query to delete the row where fencer_id and coach_id match
		const query = `
            DELETE FROM coach_fencers
            WHERE fencer_id = ? AND coach_id = ?;
        `;

		// Execute the query with the bound fencer_id and coach_id
		const result = await DB.prepare(query).bind(fencerId, coachId).run();
		return result;
	} catch (error) {
		console.log(`Error: ${error.message}`);
		return { error: error.message };
	}
}

async function handlePutRequest(request, env) {
	const { DB } = env;

	try {
		const body = await request.json();

		if (
			body.queryType === "addFencer" &&
			body.unique_id &&
			body.name &&
			body.email
		) {
			await env.DB.prepare(`
            INSERT OR IGNORE INTO fencers (unique_id, name, email)
            VALUES (?, ?, ?);
          `)
				.bind(unique_id, name, email)
				.run();
		}
		if (
			body.queryType === "addCoach" &&
			body.unique_id &&
			body.name &&
			body.email
		) {
			await env.DB.prepare(`
            INSERT OR IGNORE INTO coaches (unique_id, name, email)
            VALUES (?, ?, ?);
          `)
				.bind(unique_id, name, email)
				.run();
		}

		if (body.queryType === "instruction" && body.fencerInstruction) {
			const { fencerInstruction } = body;
			const query = `
                INSERT OR IGNORE INTO fencer_instructions (name)
                VALUES (?);
            `;
			const result = await DB.prepare(query).bind(fencerInstruction).run();
			return result;
		}
		if (body.queryType === "angleData" && body.fencerId && body.angleData) {
			const { fencerId, angleData } = body;

			const query =
				"INSERT OR REPLACE INTO fencer_sessions (fencer_id, speed, left_elbow, right_elbow, left_hip, right_hip, left_knee, right_knee, feet_distance, accuracy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";

			const result = await DB.prepare(query)
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
			return result;
		}
	} catch (error) {
		console.log(`Error: ${error}`);
	}
}

async function handlePostRequest(request, env) {
	const { DB } = env;

	try {
		const body = await request.json();

		let result;

		if (body.queryType === "auth" && body.name && body.email && body.password) {
			const auth = true; // salting, hashing, querying, etc
			const id = "1"; // query db for this

			if (!auth) {
				return new Response(
					JSON.stringify({ error: "Failed to authenticate" }),
					{
						headers: { "Content-Type": "application/json" },
						status: 500,
					},
				);
			}

			return new Response(JSON.stringify({ id: id, name: body.name }), {
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*", // Allow requests from any origin
				},
			});
		} else if (body.queryType === "getFencer" && body.id) {
			result = await DB.prepare(
				"SELECT * FROM fencer_sessions WHERE fencer_id = ?",
			)
				.bind(body.id)
				.all();
		} else if (body.queryType === "getCoach" && body.id) {
			result = await DB.prepare(
				"SELECT * FROM coach_fencers WHERE coach_id = ?",
			)
				.bind(body.name)
				.all();
		} else {
			// Default case if no queryType or valid data is provided
			return new Response(
				JSON.stringify({ error: "Invalid queryType or missing data" }),
				{
					headers: { "Content-Type": "application/json" },
					status: 400,
				},
			);
		}

		// Return the query result as JSON with CORS headers
		return new Response(JSON.stringify(result.results), {
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*", // Allow requests from any origin
			},
		});
	} catch (error) {
		// Handle JSON parsing or database query errors
		return new Response(JSON.stringify({ error: error.message }), {
			headers: { "Content-Type": "application/json" },
			status: 500,
		});
	}
}
