import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // To sign/verify tokens
import axios from "axios"; // To make API requests to Google
const { v4: uuidv4 } = require("uuid");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req, res) {
	const data = await req.json();
	const userData = data.userData;
	const type = data.type;

	const decoded = jwt.decode(userData);

	try {
		const id = uuidv4();
		const status = await uploadToD1(id, decoded.email, decoded.name, type);
		if (!status) {
			throw new Error("Missing id");
		}
		console.log(status);

		if (status.status && status.status !== 200) {
			return NextResponse.json({
				error: status.response.data.error,
				status: 500,
			});
		}

		// Handle the token (e.g., create a session, issue a JWT, etc.)
		// You can sign your own JWT and set it as a cookie
		const token = jwt.sign(
			{
				id: status.id,
				email: decoded.email,
				name: decoded.name,
				type: type,
			},
			JWT_SECRET,
			{ expiresIn: "1h" },
		);

		const response = NextResponse.json({
			id: status.id,
			name: decoded.name,
		});

		response.cookies.set("token", token, {
			httpOnly: false,
			maxAge: 60 * 60,
			sameSite: "Strict",
			secure: process.env.NODE_ENV === "production",
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Error exchanging code for token:", error);
		return NextResponse.json(
			{ error: "Failed to authenticate with Google" },
			{ status: 500 },
		);
	}
}

async function uploadToD1(id, email, name, type) {
	const workerUrl = "https://garde.gardefencing.workers.dev"; // Cloudflare Worker URL
	const password = "google";

	try {
		const queryData = {
			id: id,
			queryType: `google-${type}-auth`,
			email: email,
			name: name,
			type: type,
		};

		const response = await axios.post(workerUrl, queryData, {
			headers: { "Content-Type": "application/json" },
		});

		if (response.status !== 200) {
			throw new Error(response.data.error);
		}

		const data = response.data;

		if (data?.id) {
			return { id: data.id };
		}

		return null;
	} catch (error) {
		return error;
	}
}
