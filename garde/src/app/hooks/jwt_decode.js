import { jwtDecode } from "jwt-decode";

const checkAuth = (router, redirect, type, noRedirect = false) => {
	let decoded;

	try {
		const token = document.cookie
			.split("; ")
			.find((row) => row.startsWith("token="))
			?.split("=")[1];

		if (token) {
			decoded = jwtDecode(token);
			const currentTime = Date.now() / 1000;

			if (
				(decoded.exp <= currentTime ||
					(decoded?.type !== type && type !== "") ||
					!decoded.id ||
					!decoded.email ||
					!decoded.name) &&
				!noRedirect
			) {
				router.push(`/${redirect}?restricted=true`);
				return null;
			}
		} else {
			console.error("No token found");
			if (!noRedirect) {
				router.push(`/${redirect}?restricted=true`);
			}
			return null;
		}
	} catch (error) {
		console.error("Authentication error:", error);
		if (!noRedirect) {
			router.push(`/${redirect}?restricted=true`);
		}
		return null;
	}

	return decoded;
};

export default checkAuth;
