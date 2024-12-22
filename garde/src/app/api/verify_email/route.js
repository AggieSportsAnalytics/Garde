import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
	try {
		const cookies = req.cookies?.get("token")?.value;
		const token = req.headers?.get("Authorization")?.split("Bearer ")[1];

		if (!cookies || !token) {
			return NextResponse.json({ message: "Token missing" }, { status: 401 });
		}

		jwt.verify(cookies, JWT_SECRET);
		const decoded = jwt.verify(token, JWT_SECRET);

		if (!decoded) {
			throw new Error("Decoding failed");
		}

		return NextResponse.json(
			{ message: "Token is valid", decoded: decoded },
			{ status: 200 },
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Invalid token", error: error.message },
			{ status: 401 },
		);
	}
}

function verifyJwt(token) {
	try {
		const decoded = jwt.verify(token, JWT_SECRET);

		if (!decoded?.type || !decoded.email) {
			return null;
		}

		return decoded;
	} catch (error) {
		console.error(error);
		return null;
	}
}
