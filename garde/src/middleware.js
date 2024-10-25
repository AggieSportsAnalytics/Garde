import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function middleware(req) {
	const token = req.cookies.get("token")?.value;
	const requestedPage = req.nextUrl.pathname;
	const redirect =
		requestedPage === "/coach_page" ? "/coach_signin" : "/fencer_signin";

	// Check if token is present
	if (!token) {
		const url = new URL(redirect, req.url);
		url.searchParams.set("restricted", "true");
		return NextResponse.redirect(url);
	}

	try {
		const res = await fetch(`${BASE_URL}/api/verify_jwt`, {
			method: "POST", // Use the POST method to match your API route
			headers: {
				cookie: req.headers.get("cookie"), // Forward cookies to the API
			},
		});

		// If the token is invalid or the API returns an error
		if (res.status !== 200) {
			const url = new URL(redirect, req.url);
			url.searchParams.set("restricted", "true");
			return NextResponse.redirect(url);
		}

		// If valid, continue
		return NextResponse.next();
	} catch (error) {
		console.error("Error in middleware fetch:", error);
		// Handle error, e.g., redirect to an error page
		const url = new URL("/error", req.url);
		return NextResponse.redirect(url);
	}
}

// Only run middleware on protected routes
export const config = {
	matcher: ["/coach_page", "/fencer_page"],
};
