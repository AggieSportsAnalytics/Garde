const bcrypt = require("bcryptjs");
const axios = require("axios");
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Set JWT secret in .env.local
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
	try {
		const { email, password, type } = await req.json();

		const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/verify?type=${type}&email=${email}`;

		// Check the worker API to validate credentials
		const response = await axios.get(workerUrl);
		console.log(response);

		const data = response?.data?.data; // Safeguard check

		if (data.password === "google") {
			return NextResponse.json(
				{ error: "Google sign in detected, please login with google" },
				{ status: 401 },
			);
		}

		// Check password
		const matched = await checkPassword(password, data.password);

		// Check if valid data is returned
		if (data?.id && data.name && matched) {
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

			const response = NextResponse.json(
				{
					message: "Successfully signed in",
				},
				{ status: 200 },
			);
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
		// Handle Axios errors and other errors properly
		return NextResponse.json(
			{ error: error?.response?.data?.error || "Internal server error" },
			{ status: error?.response?.status || 500 },
		);
	}
}

// Function to check the password
async function checkPassword(enteredPassword, storedHashedPassword) {
	return bcrypt.compare(enteredPassword, storedHashedPassword);
}
