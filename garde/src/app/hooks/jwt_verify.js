import axios from "axios";

const checkAuth = async (router, redirect, type, noRedirect = false) => {
	try {
		// maybe if confident enough just replace with jwtDecode
		const response = await axios.get("/api/verify_jwt", {
			withCredentials: true,
		});

		const { decoded } = response.data;
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

		return decoded;
	} catch (error) {
		console.error("Authentication error:", error);
		if (!noRedirect) {
			router.push(`/${redirect}?restricted=true`);
		}
		return null;
	}
};

export default checkAuth;
