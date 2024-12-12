import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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
	}

	// Check if token is present
	if (!token) {
		const url = new URL(redirect, req.url);
		url.searchParams.set("restricted", "true");
		return NextResponse.redirect(url);
	}

	try {
		const res = await fetch(`${BASE_URL}/api/verify_jwt`, {
			credentials: "include",
			headers: {
				Authorization: `Bearer ${req.cookies.get("token")?.value}`,
			},
		});

		const { decoded } = await res.json();

		if (
			!res.ok ||
			!decoded?.email ||
			!decoded.name ||
			!decoded.id ||
			!decoded.type ||
			(requestedPage.includes("/fencer_page") && decoded.type !== "fencer") ||
			(requestedPage.includes("/coach_page") && decoded.type !== "coach")
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

// Only run middleware on protected routes
export const config = {
	matcher: [
		"/coach_page",
		"/fencer_page",
		"/tournaments/organize",
		"/tournaments/my-tournaments",
		"/tournaments/:path/update",
	],
};
