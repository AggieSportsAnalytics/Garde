import GoogleProvider from "next-auth/providers/google";
// import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";

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
			name: "Credentials",
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
			async authorize(credentials) {
				const workerUrl = "https://garde.gardefencing.workers.dev"; // Cloudflare Worker URL

				try {
					const response = await fetch("/api/v1/hash", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(credentials.password),
					});

					if (!response.ok) {
						throw new Error("Failed to authenticate");
					}

					const hashedPassword = await response.json();

					const queryData = {
						queryType: "auth",
						name: credentials.name,
						email: credentials.email,
						password: hashedPassword,
					};

					const response = await fetch(workerUrl, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(queryData),
					});

					if (!response.ok) {
						throw new Error("Failed to authenticate");
					}

					const data = await response.json();

					// Check if valid data is returned
					if (data && data.id && data.name) {
						// Return a user object with the required fields for NextAuth.js
						return {
							id: data.id,
							name: data.name,
						};
					} else {
						// Return null to indicate the login failed
						return null;
					}
				} catch (error) {
					console.error("Error authenticating: ", error);
					return null; // Fail the login if there's an error
				}
			},
		}),
	],
	debug: true,
};
