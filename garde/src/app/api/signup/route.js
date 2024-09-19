const bcrypt = require("bcryptjs");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Set the JWT secret (ensure you have this in your .env.local file)
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export async function POST(req, res) {
	const workerUrl = "https://garde.gardefencing.workers.dev"; // Cloudflare Worker URL

	try {
		// Parse request body
		const { email, password, name, queryType } = await req.json();

		// Hash the user's password
		const hashedPassword = await hashPassword(password);

		// Generate a unique ID for the new user
		const id = uuidv4();

		// Create query data to send to the Cloudflare worker
		const queryData = {
			queryType: queryType,
			name: name,
			email: email,
			password: hashedPassword,
			id: id,
		};

		// Send user data to the worker (simulating database registration)
		const response = await axios.post(workerUrl, queryData, {
			headers: { "Content-Type": "application/json" },
		});

		if (response.status !== 200) {
			throw new Error("Failed to register user");
		}

		const data = response.data;

		// Check if valid data is returned from the worker
		if (data?.id && data.name) {
			// Generate a JWT for the user
			const token = jwt.sign(
				{
					id: data.id,
					name: data.name,
					email: data.email,
				},
				JWT_SECRET,
				{ expiresIn: "1h" }, // Token will expire in 1 hour
			);

			// Set JWT token as an HTTP-only cookie
			const response = NextResponse.json({
				id: data.id,
				name: data.name,
			});

			// Add the token to the cookies
			response.cookies.set("token", token, {
				httpOnly: false,
				secure: process.env.NODE_ENV === "production", // Ensure this is true in production
				maxAge: 60 * 60, // 1 hour
				path: "/",
				sameSite: "Strict",
			});

			// Return the response with the user data and token
			return response;
		}

		// If something goes wrong, return a failure response
		return NextResponse.json({ error: "Signup failed" }, { status: 400 });
	} catch (error) {
		console.error("Error registering user: ", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// Function to hash the user's password
async function hashPassword(plainPassword) {
	const saltRounds = 10; // Number of hashing rounds
	const salt = await bcrypt.genSalt(saltRounds); // Generate salt
	const hashedPassword = await bcrypt.hash(plainPassword, salt); // Hash the password with salt
	return hashedPassword;
}
