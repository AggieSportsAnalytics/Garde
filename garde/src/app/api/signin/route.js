const bcrypt = require("bcryptjs");
const axios = require("axios");
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Set JWT secret in .env.local
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req, res) {
	const workerUrl = "https://garde.gardefencing.workers.dev"; // Cloudflare Worker URL

	try {
		const { email, password, queryType, type } = await req.json();

		const queryData = {
			queryType: queryType,
			email: email,
		};

		// Check the worker API to validate credentials
		const response = await axios.post(workerUrl, queryData, {
			headers: { "Content-Type": "application/json" },
		});

		if (response.status !== 200) {
			throw new Error(response.data.error);
		}

		const data = response.data;

		// Check password
		const matched = await checkPassword(password, data.password);

		// Check if valid data is returned
		if (data?.id && data.name && matched) {
			// Generate JWT token
			const token = jwt.sign(
				{
					id: data.id,
					email: data.email,
					name: data.name,
					type: type,
				},
				JWT_SECRET,
				{ expiresIn: "1h" },
			);

			// Set JWT as HttpOnly cookie
			const response = NextResponse.json({
				id: data.id,
				name: data.name,
			});
			response.cookies.set("token", token, {
				httpOnly: false,
				maxAge: 60 * 60, // 1 hour
				secure: process.env.NODE_ENV === "production",
				path: "/",
				sameSite: "Strict",
			});
			return response;
		}

		return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	} catch (error) {
		return NextResponse.json(
			{ error: error.response.data.error },
			{ status: 500 },
		);
	}
}

async function checkPassword(enteredPassword, storedHashedPassword) {
	const isMatch = await bcrypt.compare(enteredPassword, storedHashedPassword);
	return isMatch;
}
