import { jwtVerify } from "jose";

export default async function verifyAuth(req, JWT_SECRET) {
	try {
		const token =
			req.headers
				?.get("Cookie")
				?.split("; ")
				?.find((row) => row.startsWith("token="))
				?.split("=")[1] ||
			req.headers?.get("Authorization")?.split("Bearer ")[1];

		if (!token) {
			return { message: "Token missing", status: 401 };
		}

		const { payload } = await jwtVerify(token, JWT_SECRET);

		if (!payload) {
			return { message: "Decoding failed", status: 500 };
		}

		return { message: "Authorization successful", status: 200 };
	} catch (error) {
		console.error("JWT Verification Error:", error);
		return { message: "Authorization failed", status: 500 };
	}
}
