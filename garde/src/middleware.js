import { NextResponse } from "next/server";
import { SignJWT, jwtVerify, decodeJwt } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
	const token = req.cookies.get("token")?.value;
	const apiKey = req.headers?.get("Authorization")?.split("Bearer ")[1];

	const requestedPage = req.nextUrl.pathname;

	if (
		req.headers?.get("ApiKey")?.split("Bearer ")[1] !==
			process.env.NEXT_PUBLIC_API_KEY &&
		requestedPage.includes("/api/verify_email")
	) {
		throw new Error("No api key/incorrect api key");
	}
	if (
		apiKey !== process.env.NEXT_PUBLIC_API_KEY &&
		requestedPage.includes("/api/")
	) {
		console.log(requestedPage);
		throw new Error("No api key/incorrect api key");
	}

	let redirect = "/";
	if (
		requestedPage.includes("/fencer_page") ||
		requestedPage.includes("/coach_page")
	) {
		redirect = "/signin";
	} else if (
		requestedPage.includes("/tournaments/organize") ||
		requestedPage.includes("/tournaments/my-tournaments")
	) {
		redirect = "/tournaments";
	} else if (/^\/tournaments\/[0-9a-fA-F-]+\/update$/.test(requestedPage)) {
		const tId = requestedPage.split("/")[2];
		redirect = `/tournaments/${tId}`;
	} else if (requestedPage.includes("/api/renew_session")) {
		return NextResponse.next();
	} else if (
		requestedPage.includes("/tournaments") ||
		requestedPage.includes("/api/") ||
		requestedPage.includes("/verify-email") ||
		requestedPage.includes("/signin")
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
		if (requestedPage.includes("/api/")) {
			return NextResponse.json(
				{ error: error || "Internal Server error" },
				{ status: 500 },
			);
		}

		const url = new URL(redirect || "/", req.url);
		url.searchParams.set("restricted", "true");
		return NextResponse.redirect(url);
	}
}

async function unProtectedMiddleware(req) {
	try {
		const token = req.cookies.get("token")?.value;

		let webToken;
		const response = NextResponse.next();

		if (!token || decodeJwt(token)?.exp < Math.floor(Date.now() / 1000)) {
			webToken = await new SignJWT({ purpose: "authentication" })
				.setProtectedHeader({ alg: "HS256" })
				.setExpirationTime("25h")
				.sign(JWT_SECRET);

			response.cookies.set("token", webToken, {
				httpOnly: true,
				maxAge: 25 * 60 * 60,
				sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
				secure: process.env.NODE_ENV === "production",
				path: "/",
			});
		} else {
			const { payload } = await jwtVerify(token, JWT_SECRET);
		}

		return response;
	} catch (error) {
		// console.error(error);
		// return NextResponse.next();

		console.error(error);
		if (req.nextUrl.pathname.includes("/api/")) {
			return NextResponse.json(
				{ error: error || "Internal Server error" },
				{ status: 500 },
			);
		}

		const url = new URL("/", req.url);
		url.searchParams.set("restricted", "true");
		return NextResponse.redirect(url);
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

		"/signin",
	],
};
