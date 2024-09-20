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

		if (request.method === "GET") {
			return handleGetRequest();
		}

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

function handleGetRequest() {
	return new Response(JSON.stringify({ message: "success" }));
}

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

	const deleteCoachFencers = async (fencerId, coachId) => {
		// SQL query to delete the row where fencer_id and coach_id match
		const query = `
            DELETE FROM coach_fencers
            WHERE fencer_id = ? AND coach_id = ?;
        `;

		// Execute the query with the bound fencer_id and coach_id
		const result = await DB.prepare(query).bind(fencerId, coachId).run();
		return result;
	};

	const deleteFencers = async (fencerId) => {
		const query = `
            DELETE FROM fencers
            WHERE fencer_id = ?;
        `;

		// Execute the query with the bound fencer_id and coach_id
		const result = await DB.prepare(query).bind(fencerId).run();
		return result;
	};

	const deleteCoaches = async (coachId) => {
		const query = `
            DELETE FROM coaches
            WHERE coach_id = ?;
        `;

		// Execute the query with the bound fencer_id and coach_id
		const result = await DB.prepare(query).bind(coachId).run();
		return result;
	};

	try {
		const body = await request.json();

		if (body.queryType === "fencer_coach" && body.fencerId && body.coachId) {
			return deleteCoachFencers(body.fencerId, body.coachId);
		}

		if (body.queryType === "fencer") {
			return deleteFencers(body.fencerId);
		}

		if (body.queryType === "coach") {
			return deleteCoaches(body.coachId);
		}
	} catch (error) {
		console.log(`Error: ${error.message}`);
		return { error: error.message };
	}
}

async function handlePutRequest(request, env) {
	const { DB } = env;

	const putInstruction = async (fencerInstruction) => {
		const query = `
                INSERT OR IGNORE INTO fencer_instructions (name)
                VALUES (?);
            `;
		const result = await DB.prepare(query).bind(fencerInstruction).run();
		return result;
	};

	const putAngleData = async (fencerId, angleData) => {
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
	};

	try {
		const body = await request.json();

		if (body.queryType === "instruction" && body.fencerInstruction) {
			return putInstruction(body.fencerInstruction);
		}
		if (body.queryType === "angleData" && body.fencerId && body.angleData) {
			return putAngleData(body.fencerId, body.angleData);
		}
	} catch (error) {
		console.log(`Error: ${error}`);
	}
}

async function handlePostRequest(request, env) {
	const { DB } = env;

	const authGoogle = async (id, email, name, type) => {
		const googlePassword = "google";

		// Check if the user already exists in the database
		const fetched = await DB.prepare(`SELECT * FROM ${type} WHERE email = ?`)
			.bind(email)
			.all();

		if (fetched.results.length > 0) {
			const user = fetched.results[0];

			// If the user exists and the password is "google", return id and name
			if (user.password === googlePassword) {
				return {
					status: true,
					id: user.unique_id,
				};
			}

			// If the user exists and the password is not "google", return a failure message
			return {
				status: false,
				message: "Non-google signin found, please use email/password signin",
			};
		}

		// User does not exist, create a new user
		const result = await env.DB.prepare(`
      INSERT INTO ${type} (unique_id, name, email, password)
      VALUES (?, ?, ?, ?);
  `)
			.bind(id, name, email, googlePassword)
			.run();

		// If the user was created successfully, return their id and name
		return result.success
			? { status: true, id: id }
			: { status: false, message: "Failed to create user" };
	};

	const auth = async (type, name, email, password, id) => {
		// Check if the user already exists in the database
		const fetched = await DB.prepare(`SELECT * FROM ${type} WHERE email = ?`)
			.bind(email)
			.all();

		if (fetched.results.length > 0) {
			// User already exists, return an error
			return { status: false, message: "User already exists" };
		}

		// User does not exist, create a new user
		const result = await env.DB.prepare(`
        INSERT OR IGNORE INTO ${type} (unique_id, name, email, password)
        VALUES (?, ?, ?, ?);
    `)
			.bind(id, name, email, password)
			.run();

		// Return the result of the insertion, or an error if something went wrong
		return result.success
			? { status: true, message: "success" }
			: { status: false, message: "Failed to create user" };
	};

	const getFencer = async (id) => {
		const result = await DB.prepare(
			"SELECT * FROM fencer_sessions WHERE fencer_id = ?",
		)
			.bind(id)
			.all();

		return result;
	};

	const getCoach = async (id) => {
		const result = await DB.prepare(
			"SELECT * FROM coach_fencers WHERE coach_id = ?",
		)
			.bind(id)
			.all();

		return result;
	};

	const verify = async (type, email) => {
		// Query the user by email
		const fetched = await DB.prepare(`SELECT * FROM ${type} WHERE email = ?`)
			.bind(email)
			.all();

		if (fetched.results.length === 0) {
			// User does not exist, return an error
			return { message: "User does not exist" };
		}

		const user = fetched.results[0];

		return user;
	};

	try {
		const body = await request.json();

		let result;

		if (
			(body.queryType === "auth-fencer" || body.queryType === "auth-coach") &&
			body.name &&
			body.email &&
			body.password &&
			body.id
		) {
			let status;
			if (body.queryType === "auth-fencer") {
				status = await auth(
					"fencers",
					body.name,
					body.email,
					body.password,
					body.id,
				);
			}
			if (body.queryType === "auth-coach") {
				status = await auth(
					"coaches",
					body.name,
					body.email,
					body.password,
					body.id,
				);
			}

			if (status && !status.status) {
				return new Response(JSON.stringify({ error: status.message }), {
					status: 500,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*", // Allow requests from any origin
					},
				});
			} else if (!status) {
				return new Response(
					JSON.stringify({ error: "Failed to create user" }),
					{
						status: 500,
						headers: {
							"Content-Type": "application/json",
							"Access-Control-Allow-Origin": "*", // Allow requests from any origin
						},
					},
				);
			}

			return new Response(JSON.stringify({ id: body.id }), {
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*", // Allow requests from any origin
				},
			});
		}

		if (
			(body.queryType === "google-fencer-auth" ||
				body.queryType === "google-coach-auth") &&
			body.id &&
			body.email &&
			body.type &&
			body.name
		) {
			let status;
			if (body.queryType === "google-fencer-auth") {
				status = await authGoogle(body.id, body.email, body.name, "fencers");
			}
			if (body.queryType === "google-coach-auth") {
				status = await authGoogle(body.id, body.email, body.name, "coaches");
			}
			if (status && !status.status) {
				return new Response(JSON.stringify({ error: status.message }), {
					status: 500,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*", // Allow requests from any origin
					},
				});
			} else if (!status) {
				return new Response(
					JSON.stringify({ error: "Failed to create user" }),
					{
						status: 500,
						headers: {
							"Content-Type": "application/json",
							"Access-Control-Allow-Origin": "*", // Allow requests from any origin
						},
					},
				);
			}
			return new Response(JSON.stringify({ id: body.id }), {
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*", // Allow requests from any origin
				},
			});
		}

		if (
			(body.queryType === "verify-fencer" ||
				body.queryType === "verify-coach") &&
			body.email
		) {
			let user;
			if (body.queryType === "verify-fencer") {
				user = await verify("fencers", body.email);
			} else if (body.queryType === "verify-coach") {
				user = await verify("coaches", body.email);
			}

			if (user && user.message) {
				return new Response(JSON.stringify({ error: user.message }), {
					status: 404,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*", // Allow requests from any origin
					},
				});
			} else if (!user) {
				return new Response(JSON.stringify({ error: "Failed to login" }), {
					status: 500,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*", // Allow requests from any origin
					},
				});
			}

			return new Response(
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
		}

		if (body.queryType === "getFencer" && body.id) {
			result = await getFencer(body.id);
		} else if (body.queryType === "getCoach" && body.id) {
			result = await getCoach(body.id);
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
