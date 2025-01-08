import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
	try {
		const token = req.cookies.get("token")?.value;
		const captchaVerified = req.cookies.get("captchaVerified")?.value;

		return NextResponse.json(
			{
				message: "Success",
				token: token,
				captchaVerified: captchaVerified,
			},
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
