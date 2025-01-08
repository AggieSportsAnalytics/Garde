import { NextResponse } from "next/server";

export async function GET() {
	// Clear the token by setting an expired cookie
	const response = NextResponse.json(
		{ message: "Logged out successfully" },
		{ status: 200 },
	);
	response.cookies.delete("token");
	// response.cookies.delete("captchaVerified");

	response.cookies.set("token", "", {
		httpOnly: true,
		expires: new Date(0),
		path: "/",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
		secure: process.env.NODE_ENV === "production",
	});

	// response.cookies.set("captchaVerified", "", {
	// 	httpOnly: true,
	// 	expires: new Date(0),
	// 	sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
	// 	secure: process.env.NODE_ENV === "production",
	// 	path: "/",
	// });

	return response;
}
