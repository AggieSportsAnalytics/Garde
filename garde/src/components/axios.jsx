import axios from "axios";

const axiosInstance = axios.create({
	withCredentials: true,
});

let cachedToken = null;

axiosInstance.interceptors.request.use(
	async (config) => {
		if (!cachedToken) {
			try {
				const response = await fetch("/api/get-token");
				if (!response?.ok) {
					throw new Error("Error");
				}
				const res = await response.json();

				cachedToken = await res?.token;
			} catch (error) {
				console.error("Error fetching token:", error);
				return Promise.reject(error);
			}
		}

		config.headers.Authorization = `Bearer ${cachedToken}`;
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

export default axiosInstance;
