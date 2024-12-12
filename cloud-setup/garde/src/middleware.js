import jwt from "jsonwebtoken";

export function verifyAuth(req) {
	try {
		const authorization = req.headers.get("authorization")?.split(" ")[1];

		if (!authorization) {
			return { message: "Token missing", status: 401 };
		}

		const decoded = jwt.verify(cookies, JWT_SECRET);

		if (!decoded) {
			return { message: "Decoding failed" };
		}

		return { message: "Authorization successful", status: 200 };
	} catch (error) {
		return { message: "Authorization failed", status: 500 };
	}
}
