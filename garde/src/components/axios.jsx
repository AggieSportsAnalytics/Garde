import axios from "axios";

const axiosInstance = axios.create({
	withCredentials: true,
});

let cachedToken = null;

axiosInstance.interceptors.request.use(
	async (config) => {
		if (!cachedToken) {
			try {
				const response = await fetch("/api/get-token", {
					headers: {
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
					},
				});
				if (!response?.ok) {
					throw new Error("Error");
				}
				const res = await response.json();

				cachedToken = res?.token;

				if (!cachedToken) {
					throw new Error("No token");
				}
			} catch (error) {
				console.error("Error fetching token:", error);
				return Promise.reject(error);
			}
		}

		config.headers.ApiKey = `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`;
		config.headers.Authorization = `Bearer ${cachedToken} ${process.env.NEXT_PUBLIC_API_KEY}`;

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

export default axiosInstance;
