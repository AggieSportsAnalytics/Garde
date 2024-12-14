import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
	const token = req.cookies.get("token")?.value;

	const requestedPage = req.nextUrl.pathname;

	let redirect = "/";
	if (requestedPage.includes("/coach_page")) {
		redirect = "/coach_signin";
	} else if (requestedPage.includes("/fencer_page")) {
		redirect = "/fencer_signin";
	} else if (
		requestedPage.includes("/tournaments/organize") ||
		requestedPage.includes("/tournaments/my-tournaments")
	) {
		redirect = "/tournaments";
	} else if (/^\/tournaments\/[0-9a-fA-F-]+\/update$/.test(requestedPage)) {
		const tId = requestedPage.split("/")[2];
		redirect = `/tournaments/${tId}`;
	} else if (
		requestedPage.includes("/tournaments") ||
		requestedPage.includes("/api/") ||
		requestedPage.includes("/verify-email")
	) {
		return await unProtectedMiddleware(req);
	}

	// Check if token is present
	if (!token) {
		const url = new URL(redirect, req.url);
		url.searchParams.set("restricted", "true");
		return NextResponse.redirect(url);
	}

	try {
		const { payload } = await jwtVerify(token, JWT_SECRET);

		if (
			!payload?.email ||
			!payload.name ||
			!payload.id ||
			!payload.type ||
			(requestedPage.includes("/fencer_page") && payload.type !== "fencer") ||
			(requestedPage.includes("/coach_page") && payload.type !== "coach")
		) {
			const url = new URL(redirect, req.url);
			url.searchParams.set("restricted", "true");
			return NextResponse.redirect(url);
		}

		return NextResponse.next();
	} catch (error) {
		console.error(error);
		const url = new URL(redirect, req.url);
		url.searchParams.set("restricted", "true");
		return NextResponse.redirect(url);
	}
}

async function unProtectedMiddleware(req) {
	try {
		const token = req.cookies.get("token")?.value;

		let webToken;
		const response = NextResponse.next();

		if (!token) {
			webToken = await new SignJWT({ purpose: "authentication" })
				.setProtectedHeader({ alg: "HS256" })
				.setExpirationTime("25h")
				.sign(JWT_SECRET);

			response.cookies.set("token", webToken, {
				httpOnly: false,
				maxAge: 25 * 60 * 60,
				sameSite: "Strict",
				secure: process.env.NODE_ENV === "production",
				path: "/",
			});
		} else {
			const { payload } = await jwtVerify(token, JWT_SECRET);
		}

		return response;
	} catch (error) {
		console.error(error);
		return NextResponse.next();
	}
}

// Only run middleware on protected routes
export const config = {
	matcher: [
		"/coach_page",
		"/fencer_page",
		"/tournaments/organize",
		"/tournaments/my-tournaments",
		"/tournaments/:path/update",

		"/tournaments",
		"/tournaments/:path*",

		"/api/:path*",

		"/verify-email",
	],
};
