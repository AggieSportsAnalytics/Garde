import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Ensure the secret is fetched from the environment
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
	// Get the cookies from the request
	const cookies = req.cookies.get("token")?.value;

	// Check if the token exists
	if (!cookies) {
		return NextResponse.json({ message: "Token missing" }, { status: 401 });
	}

	try {
		// Verify the token with JWT_SECRET
		const decoded = jwt.verify(cookies, JWT_SECRET);

		// If valid, return the decoded token
		return NextResponse.json(
			{ message: "Token is valid", decoded },
			{ status: 200 },
		);
	} catch (error) {
		// If verification fails, return an error
		return NextResponse.json(
			{ message: "Invalid token", error: error.message },
			{ status: 401 },
		);
	}
}
