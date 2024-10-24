import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // To sign/verify tokens
import axios from "axios"; // To make API requests to Google
const { v4: uuidv4 } = require("uuid");

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req, res) {
	const data = await req.json();
	const userData = data.userData;
	const type = data.type;

	const decoded = jwt.decode(userData);

	try {
		const id = uuidv4();
		const uploadRes = await uploadToD1(id, decoded.email, decoded.name, type);

		if (uploadRes.status !== 200 && uploadRes.status !== 201) {
			return NextResponse.json(
				{ error: uploadRes.data.error },
				{ status: uploadRes.status },
			);
		}

		// Handle the token (e.g., create a session, issue a JWT, etc.)
		const token = jwt.sign(
			{
				id: uploadRes.data.data.id,
				email: decoded.email,
				name: decoded.name,
				type: type,
			},
			JWT_SECRET,
			{ expiresIn: "1h" },
		);

		const response = NextResponse.json(
			{ message: "Successfully logged in" },
			{ status: 201 },
		);

		// Set the cookie
		response.cookies.set("token", token, {
			httpOnly: false,
			maxAge: 60 * 60,
			sameSite: "Strict",
			secure: process.env.NODE_ENV === "production",
			path: "/",
		});

		return response;
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: error.message || "An error occurred" },
			{ status: 500 },
		);
	}
}

async function uploadToD1(id, email, name, type) {
	const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/authGoogle`;

	try {
		const queryData = {
			id: id,
			email: email,
			name: name,
			type: type,
		};

		const response = await axios.post(workerUrl, queryData, {
			headers: { "Content-Type": "application/json" },
		});

		return response; // Return the actual Axios response if successful
	} catch (error) {
		// If there's an error, return a structured response
		return {
			status: error.response?.status || 500,
			data: error.response?.data || { error: "Server error" },
		};
	}
}
