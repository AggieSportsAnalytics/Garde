"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function Logout() {
	const [waiting, setWaiting] = useState(false);

	const router = useRouter();

	const handleLogout = async () => {
		try {
			setWaiting(true);

			await axios.get("/api/logout", { withCredentials: true });

			router.push("/");
		} catch (error) {
			setWaiting(false);
			console.error(error.message);
		}
	};

	return (
		<button
			type="button"
			onClick={handleLogout}
			className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
		>
			{waiting ? "Logging out..." : "Logout"}
		</button>
	);
}
