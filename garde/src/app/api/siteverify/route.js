import { NextResponse } from "next/server";

export async function PUT(req) {
	try {
		const data = await req.json();

		if (!data?.token) {
			return NextResponse.json({ error: "No token" }, { status: 400 });
		}

		const captchaRes = await fetch(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{
				body: JSON.stringify({
					secret: process.env.TURNSTILE_SECRET_KEY,
					response: data.token,
					// remoteip: ip,
				}),
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		const res = await captchaRes.json();

		if (!res?.success) {
			return NextResponse.json(
				{ message: "Failed captcha verification" },
				{ status: 403 },
			);
		}

		const response = NextResponse.json(
			{ message: "Verified captcha successfully" },
			{ status: 200 },
		);

		response.cookies.set("captchaVerified", true, {
			httpOnly: true,
			maxAge: 25 * 60 * 60,
			sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
			secure: process.env.NODE_ENV === "production",
			path: "/",
		});

		return response;
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: error }, { status: 500 });
	}
}
