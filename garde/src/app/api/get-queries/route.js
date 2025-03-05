import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const { fingerprint, query, loggedIn } = await req.json();

		if (!fingerprint) {
			return NextResponse.json(
				{
					error: "Fingerprint required",
				},
				{ status: 404 },
			);
		}

		let videos =
			Number.parseInt(await redis.get(`${fingerprint}_videos_${loggedIn}`)) ||
			0;
		let chats =
			Number.parseInt(await redis.get(`${fingerprint}_chats_${loggedIn}`)) || 0;

		if (query === "chats") {
			chats++;
			await redis.set(`${fingerprint}_chats_${loggedIn}`, chats, "EX", 86400);
		} else if (query === "videos") {
			videos++;
			await redis.set(`${fingerprint}_videos_${loggedIn}`, videos, "EX", 86400);
		}

		return NextResponse.json(
			{
				message: "Query successful",
				videos: videos,
				chats: chats,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{
				error: error,
			},
			{ status: 500 },
		);
	}
}
