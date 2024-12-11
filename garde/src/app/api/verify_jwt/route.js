import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
	try {
		const cookies = req.headers.get("authorization")?.split(" ")[1];

		if (!cookies) {
			return NextResponse.json({ message: "Token missing" }, { status: 401 });
		}

		const decoded = jwt.verify(cookies, JWT_SECRET);

		if (!decoded?.id || !decoded.type) {
			throw Error("Decoding failed");
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
