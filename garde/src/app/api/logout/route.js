import { NextResponse } from "next/server";

export async function GET() {
	// Clear the token by setting an expired cookie
	const response = NextResponse.json(
		{ message: "Logged out successfully" },
		{ status: 200 },
	);
	response.cookies.set("token", "", {
		httpOnly: true,
		expires: new Date(0), // Set an expiration date in the past
		path: "/",
		sameSite: "Strict",
	});

	return response;
}
