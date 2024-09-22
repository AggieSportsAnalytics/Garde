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

		// if (request.method === "DELETE") {
		// 	// coach page: SEND (fencer id, coach id) ## coach_fencers table
		// 	return await handleDeleteRequest(request, env);
		// }

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
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT", // Allow GET, POST, and OPTIONS methods
			"Access-Control-Allow-Headers": "Content-Type", // Allow headers like Content-Type
		},
	});
}

function addCorsHeaders(response) {
	return new Response(response.body, {
		...response,
		headers: {
			...response.headers,
			"Access-Control-Allow-Origin": "*", // Or specify a specific origin
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
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

	const putCoachFencer = async (fencerId, coachId, fencerName) => {
		const query =
			"INSERT OR IGNORE INTO coach_fencers (coach_id, fencer_id, fencer_name) VALUES (?, ?, ?);";
		const result = await DB.prepare(query)
			.bind(coachId, fencerId, fencerName)
			.run();
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
			await putInstruction(body.fencerInstruction);
		} else if (
			body.queryType === "angleData" &&
			body.fencerId &&
			body.angleData
		) {
			await putAngleData(body.fencerId, body.angleData);
		} else if (
			body.queryType === "fencer-coach" &&
			body.fencerId &&
			body.coachId &&
			body.fencerName
		) {
			console.log(body);
			await putCoachFencer(body.fencerId, body.coachId, body.fencerName);
		}
		const res = new Response(JSON.stringify({ message: "Success" }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
		return addCorsHeaders(res);
	} catch (error) {
		console.log(`Error: ${error}`);
		return new Response(
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
	}
}

async function handlePostRequest(request, env) {
	const { DB } = env;

	const verifyEmail = async (email, table) => {
		const query = `
      SELECT * FROM ${table} WHERE email = ?  
    `;
		const user = await DB.prepare(query).bind(email).all();

		// Check if the user exists
		if (user.results.length === 0) {
			return new Response(JSON.stringify({ error: "User not found" }), {
				status: 404,
			});
		}

		const updateQuery = `
      UPDATE ${table} SET is_verified = 1 WHERE email = ?
    `;
		const result = await DB.prepare(updateQuery).bind(email).run();

		const newUser = await DB.prepare(query).bind(email).all();
		console.log(newUser);

		if (newUser.results[0].is_verified === 1) {
			return addCorsHeaders(
				new Response(
					JSON.stringify({ message: "Successfully verified email" }),
				),
			);
		} else {
			return new Response(JSON.stringify({ error: "Failed to verify email" }));
		}
	};

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
		const result = await DB.prepare(`
      INSERT INTO ${type} (unique_id, name, email, password, is_verified)
      VALUES (?, ?, ?, ?, ?);
  `)
			.bind(id, name, email, googlePassword, 1)
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
        INSERT OR IGNORE INTO ${type} (unique_id, name, email, password, is_verified)
        VALUES (?, ?, ?, ?, ?);
    `)
			.bind(id, name, email, password, 0)
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

		if (user.is_verified === 0) {
			return { message: "User has not verified their email" };
		}

		return user;
	};

	const deleteCoachFencers = async (fencerId, coachId) => {
		const query = `
      DELETE FROM coach_fencers
      WHERE fencer_id = ? AND coach_id = ?;
    `;
		const result = await DB.prepare(query).bind(fencerId, coachId).run();
		return result;
	};

	const deleteUser = async (fencerId, type) => {
		const query = `
      DELETE FROM ${type}
      WHERE unique_id = ?;
    `;
		const result = await DB.prepare(query).bind(fencerId).run();
		return result;
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
			}
			if (!status) {
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

			return new Response(JSON.stringify({ success: true }), {
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
			}
			if (!status) {
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
			return new Response(JSON.stringify({ id: status.id }), {
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*", // Allow requests from any origin
				},
			});
		}

		if (body.queryType === "verify-email" && body.type && body.email) {
			if (body.type === "fencer") {
				return await verifyEmail(body.email, "fencers");
			} else if (body.type === "coach") {
				return await verifyEmail(body.email, "coaches");
			}
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

			if (user?.message) {
				return new Response(JSON.stringify({ error: user.message }), {
					status: 404,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*", // Allow requests from any origin
					},
				});
			}
			if (!user) {
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

		if (
			body.queryType === "delete-fencer" ||
			(body.queryType === "delete-coach" && body.id && body.type)
		) {
			if (body.type === "fencer") {
				result = await deleteUser(body.id, "fencers");
			} else if (body.type === "coach") {
				result = await deleteUser(body.id, "coaches");
			}

			return new Response(
				JSON.stringify({ message: `${body.type} deleted`, result }),
				{
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
					},
				},
			);
		}

		if (
			body.queryType === "delete-coach-fencer" &&
			body.fencerId &&
			body.coachId
		) {
			result = await deleteCoachFencers(body.fencerId, body.coachId);
			return new Response(
				JSON.stringify({ message: "Coach-Fencer relation deleted", result }),
				{
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
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

		// Handle DELETE-like operations using POST

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
