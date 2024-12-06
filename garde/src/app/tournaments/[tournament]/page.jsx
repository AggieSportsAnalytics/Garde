"use client";

import { useRouter } from "next/navigation";

export default function TournamentPage({ params }) {
	const tournament = { params };
	const router = useRouter();

	return (
		<div className="p-6 max-w-3xl mx-auto bg-gray-900 text-white min-h-screen">
			<h1 className="text-3xl font-bold mb-6">
				{tournament.name || "Tournament Name"}
			</h1>

			<div className="space-y-4">
				{/* Tournament Description */}
				<p className="text-gray-400">
					<span className="font-semibold text-white">Description:</span>{" "}
					{tournament.description || "No description available."}
				</p>

				{/* Category */}
				<p className="text-gray-400">
					<span className="font-semibold text-white">Category:</span>{" "}
					{tournament.category || "N/A"}
				</p>

				{/* Prize Pool */}
				<p className="text-gray-400">
					<span className="font-semibold text-white">Prize Pool:</span>{" "}
					{tournament.prize_pool ? `$${tournament.prize_pool}` : "N/A"}
				</p>

				{/* Organizer Details */}
				<div>
					<h2 className="font-semibold text-lg text-white mb-2">
						Organizer Details:
					</h2>
					<p className="text-gray-400">
						<span className="font-semibold text-white">Name:</span>{" "}
						{tournament.organizer_name}
					</p>
					<p className="text-gray-400">
						<span className="font-semibold text-white">Email:</span>{" "}
						{tournament.organizer_email}
					</p>
					<p className="text-gray-400">
						<span className="font-semibold text-white">Phone:</span>{" "}
						{tournament.organizer_phone || "N/A"}
					</p>
				</div>

				{/* Location */}
				<p className="text-gray-400">
					<span className="font-semibold text-white">Location:</span>{" "}
					{tournament.location}
				</p>

				{/* Privacy */}
				<p className="text-gray-400">
					<span className="font-semibold text-white">Privacy:</span>{" "}
					{tournament.privacy === "public" ? "Public" : "Private"}
				</p>

				{/* Start and End Time */}
				<p className="text-gray-400">
					<span className="font-semibold text-white">Start Time:</span>{" "}
					{tournament.start_time}
				</p>
				<p className="text-gray-400">
					<span className="font-semibold text-white">End Time:</span>{" "}
					{tournament.end_time}
				</p>

				{/* Registration Fee */}
				<p className="text-gray-400">
					<span className="font-semibold text-white">Registration Fee:</span>{" "}
					{tournament.registration_fee
						? `$${tournament.registration_fee}`
						: "Free"}
				</p>

				{/* Maximum Participants */}
				<p className="text-gray-400">
					<span className="font-semibold text-white">Max Participants:</span>{" "}
					{tournament.max_participants || "N/A"}
				</p>

				{/* Eligibility */}
				<p className="text-gray-400">
					<span className="font-semibold text-white">Eligibility:</span>{" "}
					{tournament.eligibility || "No specific eligibility requirements."}
				</p>

				{/* Team-Based */}
				<p className="text-gray-400">
					<span className="font-semibold text-white">Team-Based:</span>{" "}
					{tournament.is_team_based ? "Yes" : "No"}
				</p>

				{/* Rules */}
				<p className="text-gray-400">
					<span className="font-semibold text-white">Rules:</span>{" "}
					{tournament.rules || "No rules provided."}
				</p>
			</div>

			{/* Back Button */}
			<button
				className="mt-8 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded"
				onClick={() => router.push("/tournaments")}
			>
				Back to Tournaments
			</button>
		</div>
	);
}
