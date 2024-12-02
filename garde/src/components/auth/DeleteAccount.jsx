import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function DeleteAccountButton({ type, userId }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const router = useRouter();

	const handleDeleteAccount = async () => {
		const confirmed = window.confirm(
			"Are you sure you want to delete your account? This action is irreversible.",
		);

		if (!confirmed) {
			return; // Exit if the user cancels the confirmation
		}

		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/deleteUser?id=${userId}&type=${type}`;

			// Replace with your actual DELETE API endpoint
			const response = await axios.delete(workerUrl);

			if (response.status >= 200 && response.status < 300) {
				const res = await axios.get("/api/logout");

				if (res.status >= 200 && res.status < 300) {
					// Redirect to the login page after logout
					router.push("/");
				}
				setSuccess("Your account has been successfully deleted.");
				// Optionally, you can also log out the user or redirect them to another page
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

			{error && <p className="text-red-500 mt-4 flex items-center">{error}</p>}
			{success && (
				<p className="text-green-500 mt-4 flex items-center">{success}</p>
			)}
		</div>
	);
}
