import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
	try {
		const token = req.cookies.get("token")?.value;

		const decoded = verifyJwt(token);

		if (!token || !decoded) {
			return NextResponse.json({ message: "No token" }, { status: 400 });
		}

		const response = NextResponse.json(
			{ message: "Renewed token successfully" },
			{ status: 200 },
		);

		const jwtToken = jwt.sign(
			{
				id: decoded.id,
				email: decoded.email,
				name: decoded.name,
				type: decoded.type,
			},
			JWT_SECRET,
			{ expiresIn: "25h" },
		);

		response.cookies.set("token", jwtToken, {
			httpOnly: true,
			maxAge: 25 * 60 * 60,
			sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
			secure: process.env.NODE_ENV === "production",
			path: "/",
		});

		return response;
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: `Error renewing token: ${error}` },
			{ status: 500 },
		);
	}
}

function verifyJwt(token) {
	try {
		const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

		if (!decoded?.id || !decoded.type || !decoded.name || !decoded.email) {
			return null;
		}

		return decoded;
	} catch (error) {
		// console.error(error);
		return null;
	}
}
