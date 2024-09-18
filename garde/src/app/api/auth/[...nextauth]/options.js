import GoogleProvider from "next-auth/providers/google";
// import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

export const options = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
		// AppleProvider({
		//
		// })
		CredentialsProvider({
			name: "new account",
			credentials: {
				name: {
					label: "Name:",
					type: "text",
					placeholder: "your name",
				},
				email: {
					label: "Email:",
					type: "text",
					placeholder: "your email",
				},
				password: {
					label: "Password:",
					type: "password",
					placeholder: "your password",
				},
			},
			async authorize(credentials, req) {
				const workerUrl = "https://garde.gardefencing.workers.dev"; // Cloudflare Worker URL

				try {
					const hashedPassword = await hashPassword(credentials.password);
					const id = uuidv4();

					let queryType;

					const callbackUrl = req.headers.referer;
					console.log(
						`===================${callbackUrl}==========================`,
					);
					if (
						callbackUrl ===
						"http://localhost:3000/api/auth/signin?callbackUrl=%2Fcoach_page"
					) {
						queryType = "auth-coach";
					} else if (
						callbackUrl ===
						"http://localhost:3000/api/auth/signin?callbackUrl=%2Ffencer_page"
					) {
						queryType = "auth-fencer";
					}

					const queryData = {
						queryType: queryType,
						name: credentials.name,
						email: credentials.email,
						password: hashedPassword,
						id: id,
					};

					const response = await axios.post(workerUrl, queryData, {
						headers: { "Content-Type": "application/json" },
					});

					if (response.status !== 200) {
						throw new Error("Failed to authenticate");
					}

					const data = response.data;

					// Check if valid data is returned
					if (data?.id && data.name) {
						// Return a user object with the required fields for NextAuth.js
						return {
							id: data.id,
							name: data.name,
						};
					}
					// Return null to indicate the login failed
					return null;
				} catch (error) {
					console.error("Error authenticating: ", error);
					return null; // Fail the login if there's an error
				}
			},
		}),
		// CredentialsProvider({
		// 	name: "existing account",
		// 	credentials: {
		// 		email: {
		// 			label: "Email:",
		// 			type: "text",
		// 			placeholder: "your email",
		// 		},
		// 		password: {
		// 			label: "Password:",
		// 			type: "password",
		// 			placeholder: "your password",
		// 		},
		// 	},
		// 	async authorize(credentials, req) {
		// 		const workerUrl = "https://garde.gardefencing.workers.dev"; // Cloudflare Worker URL
		//
		// 		try {
		// 			let queryType;
		//
		// 			const callbackUrl = req.headers.referer;
		// 			if (
		// 				callbackUrl ===
		// 				"http://localhost:3000/api/auth/signin?callbackUrl=%2Fcoach_page"
		// 			) {
		// 				queryType = "verify-coach";
		// 			} else if (
		// 				callbackUrl ===
		// 				"http://localhost:3000/api/auth/signin?callbackUrl=%2Ffencer_page"
		// 			) {
		// 				queryType = "verify-fencer";
		// 			}
		//
		// 			const queryData = {
		// 				queryType: queryType,
		// 				email: credentials.email,
		// 			};
		//
		// 			const response = await axios.post(workerUrl, queryData, {
		// 				headers: { "Content-Type": "application/json" },
		// 			});
		//
		// 			if (response.status !== 200) {
		// 				throw new Error("Failed to authenticate");
		// 			}
		//
		// 			const data = response.data;
		//
		// 			const matched = checkPassword(credentials.password, data.password);
		//
		// 			// Check if valid data is returned
		// 			if (data?.id && data.name && matched) {
		// 				// Return a user object with the required fields for NextAuth.js
		// 				return {
		// 					id: data.id,
		// 					name: data.name,
		// 				};
		// 			}
		// 			// Return null to indicate the login failed
		// 			return null;
		// 		} catch (error) {
		// 			console.error("Error authenticating: ", error);
		// 			return null; // Fail the login if there's an error
		// 		}
		// 	},
		// }),
	],
	debug: true,
};

async function hashPassword(plainPassword) {
	const saltRounds = 10;
	// Number of hashing rounds (the higher, the more secure, but slower)

	// Generate a salt
	const salt = await bcrypt.genSalt(saltRounds);

	// Hash the password with the salt
	const hashedPassword = await bcrypt.hash(plainPassword, salt);

	return hashedPassword;
}

async function checkPassword(enteredPassword, storedHashedPassword) {
	const isMatch = await bcrypt.compare(enteredPassword, storedHashedPassword);
	return isMatch;
}
