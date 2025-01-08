import { jwtVerify } from "jose";

export default async function verifyAuth(req, JWT_SECRET, API_KEY) {
	try {
		const token =
			req.headers
				?.get("Cookie")
				?.split("; ")
				?.find((row) => row.startsWith("token="))
				?.split("=")[1] ||
			req.headers?.get("Authorization")?.split("Bearer ")[1];

		const apiKey = req.headers?.get("ApiKey")?.split("Bearer ")[1];

		if (!token || !apiKey) {
			return { message: "Token missing", status: 401 };
		}

		const { payload } = await jwtVerify(token, JWT_SECRET);

		if (!payload) {
			return { message: "Decoding failed", status: 403 };
		}

		if (apiKey !== API_KEY) {
			return { message: "Api key does not match", status: 403 };
		}

		return { message: "Authorization successful", status: 200 };
	} catch (error) {
		console.error("JWT Verification Error:", error);
		return { message: "Authorization failed", status: 500 };
	}
}
