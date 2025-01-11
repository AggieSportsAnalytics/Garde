const bcrypt = require("bcryptjs");
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const { plainPassword } = await req.json();

		const saltRounds = 10;
		const salt = await bcrypt.genSalt(saltRounds);
		const hashedPassword = await bcrypt.hash(plainPassword, salt);

		return NextResponse.json(
			{
				message: "Successfully hashed password",
				hashedPassword: hashedPassword,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{
				error: `Failed to hash password: ${error}`,
			},
			{ status: 500 },
		);
	}
}
