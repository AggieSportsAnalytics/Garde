import axios from "axios";

function renewSession(decoded) {
	try {
		const expirationTime = decoded?.exp * 1000 - Date.now();

		return new Promise((resolve) => {
			if (!Number.isNaN(expirationTime) && expirationTime > 0) {
				const timer = setTimeout(async () => {
					await axios.get("/api/renew_session", {
						withCredentials: true,
					});
					resolve(true);
				}, expirationTime);

				return () => clearTimeout(timer);
			}
			resolve(false);
		});
	} catch (error) {
		console.error(error);
		return false;
	}
}

export default renewSession;
