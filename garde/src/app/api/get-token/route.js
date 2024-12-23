import { NextResponse } from "next/server";

export async function GET(req) {
	try {
		const token = req.cookies.get("token")?.value;

		if (!token) {
			throw new Error("No token");
		}

		return NextResponse.json(
			{ message: "Token exists", token: token },
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
