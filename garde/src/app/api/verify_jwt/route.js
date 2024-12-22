import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
	try {
		const token = req.cookies.get("token")?.value;

		if (!token) {
			throw new Error("No token");
		}

		const decoded = verifyJwt(token);

		if (!decoded) {
			throw new Error("Decoding failed");
		}

		return NextResponse.json(
			{ message: "Token is valid", decoded: decoded },
			{ status: 200 },
		);
	} catch (error) {
		// console.error(error);
		return NextResponse.json(
			{ message: "Invalid token", error: error.message },
			{ status: 401 },
		);
	}
}

function verifyJwt(token) {
	try {
		const decoded = jwt.verify(token, JWT_SECRET);

		if (!decoded?.id || !decoded.type || !decoded.name || !decoded.email) {
			return null;
		}

		return decoded;
	} catch (error) {
		// console.error(error);
		return null;
	}
}
