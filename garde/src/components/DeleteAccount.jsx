import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

export default function DeleteAccountButton({ type, otherId }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const router = useRouter();

	const handleDeleteAccount = async () => {
		let confirmed;
		if (type === "coach-fencer") {
			confirmed = window.confirm(
				"Are you sure you want to remove fencer-coach connection? This actions is irreversible.",
			);
		} else {
			confirmed = window.confirm(
				"Are you sure you want to delete your account? This action is irreversible.",
			);
		}

		if (!confirmed) {
			return; // Exit if the user cancels the confirmation
		}

		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			let workerUrl = process.env.NEXT_PUBLIC_GARDE_WORKER;
			if (type === "coach-fencer") {
				workerUrl += "/deleteCoachFencer";
			} else {
				workerUrl += "/deleteUser";
			}
			const token = document.cookie
				.split("; ")
				.find((row) => row.startsWith("token="))
				?.split("=")[1];

			const decoded = jwtDecode(token);

			let queryData;
			if (type === "coach-fencer") {
				if (decoded.type === "coach") {
					workerUrl += `?fencerId=${otherId}&coachId=${decoded.id}`;
				} else {
					workerUrl += `?fencerId=${decoded.id}&coachId=${otherId}`;
				}
			} else {
				workerUrl += `?id=${decoded.id}&type=${type}`;
			}

			// Replace with your actual DELETE API endpoint
			const response = await axios.delete(workerUrl);

			if (response.status === 200) {
				const res = await axios.get("/api/logout");

				if (res.status === 200) {
					// Redirect to the login page after logout
					router.push("/");
				} else {
					console.error("Failed to log out");
				}
				setSuccess("Your account has been successfully deleted.");
				// Optionally, you can also log out the user or redirect them to another page
			} else {
				setError("Failed to delete the account. Please try again.");
			}
		} catch (err) {
			setError("An error occurred while deleting your account.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center">
			<button
				type="button"
				className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
				onClick={handleDeleteAccount}
				disabled={loading}
			>
				{loading ? "Deleting..." : "Delete Account"}
			</button>

			{error && <p className="text-red-500 mt-4">{error}</p>}
			{success && <p className="text-green-500 mt-4">{success}</p>}
		</div>
	);
}
