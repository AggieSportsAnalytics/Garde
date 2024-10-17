import { useRouter } from "next/navigation";
import axios from "axios";

export default function Logout() {
	const router = useRouter();

	const handleLogout = async () => {
		try {
			const response = await axios.get("/api/logout");

			if (response.status >= 200 && response.status < 300) {
				// Redirect to the login page after logout
				router.push("/");
			} else {
				console.error("Failed to log out");
			}
		} catch (error) {
			console.error(error.message);
		}
	};

	return (
		<button
			onClick={handleLogout}
			className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
		>
			Logout
		</button>
	);
}
