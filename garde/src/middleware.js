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
		requestedPage.includes("/tournaments/my-tournaments") ||
		/^\/tournaments\/[0-9a-fA-F-]+\/update$/.test(requestedPage)
	) {
		redirect = "/tournaments";
	}

	// Check if token is present
	if (!token) {
		const url = new URL(redirect, req.url);
		url.searchParams.set("restricted", "true");
		return NextResponse.redirect(url);
	}

	try {
		const res = await fetch(`${BASE_URL}/api/verify_jwt`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (res.status !== 200) {
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
