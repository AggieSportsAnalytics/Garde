"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function OrganizeTournament() {
	const router = useRouter();
	const [token, setToken] = useState({});
	const tournamentId = uuidv4();

	useEffect(() => {
		try {
			const token = document.cookie
				.split("; ")
				.find((row) => row.startsWith("token="))
				?.split("=")[1];

			if (!token) {
				console.error("No cookies found");
				router.push("/tournaments?restricted=true");
			}

			const decoded = jwtDecode(token);
			const currentTime = Date.now() / 1000;

			if (decoded.exp <= currentTime) {
				router.push("/tournaments?restricted=true");
			}
			setToken(decoded);

			setFormData({
				...formData,
				organizer_name: decoded.name,
				organizer_email: decoded.email,
				user_id: decoded.id,
			});
		} catch (error) {
			console.error(error);
			router.push("/tournaments?restricted=true");
		}
	}, [router]);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		category: "",
		prize_pool: "",
		organizer_name: "",
		organizer_email: "",
		organizer_phone: "",
		location: "",
		privacy: "public",
		start_time: "",
		end_time: "",
		registration_fee: "",
		max_participants: "",
		eligibility: "",
		is_team_based: false,
		rules: "",
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const tournamentUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/putTournament/${tournamentId}`;

			const response = await axios.put(tournamentUrl, formData, {
				headers: { "Content-Type": "application/json" },
			});
			console.log(response);

			const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/putOwned/${token.id}`;
			const queryData = {
				user_type: token.type,
				relation: "organizer",
				tournament_id: tournamentId,
			};

			await axios.put(workerUrl, queryData, {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.log(error);
		}

		router.push("/tournaments");
	};

	return (
		<>
			<Link href="/tournaments" className="cursor-pointer">
				<button
					type="button"
					className="bg-white text-black ml-5 mt-5 py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 transition-transform duration-200 hover:scale-110 active:scale-100"
					title="Go Back"
				>
					&#8592;
				</button>
			</Link>
			<div className="p-6 max-w-3xl mx-auto bg-black text-white min-h-screen">
				<h1 className="text-2xl font-bold mb-4">Organize a Tournament</h1>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-400">
							Tournament Name <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Privacy <span className="text-red-500">*</span>
						</label>
						<select
							name="privacy"
							value={formData.privacy}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						>
							<option value="public">Public</option>
							<option value="private">Private</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Organizer Phone (optional)
						</label>
						<input
							type="text"
							name="organizer_phone"
							value={formData.organizer_phone}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Description (optional)
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Location <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							name="location"
							value={formData.location}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Start Time <span className="text-red-500">*</span>
						</label>
						<input
							type="datetime-local"
							name="start_time"
							value={formData.start_time}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							End Time <span className="text-red-500">*</span>
						</label>
						<input
							type="datetime-local"
							name="end_time"
							value={formData.end_time}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Max Participants (optional)
						</label>
						<input
							type="number"
							name="max_participants"
							value={formData.max_participants}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Registration Fee (optional)
						</label>
						<input
							type="number"
							name="registration_fee"
							value={formData.registration_fee}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Category (optional)
						</label>
						<input
							type="text"
							name="category"
							value={formData.category}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Prize Pool (optional)
						</label>
						<input
							type="number"
							name="prize_pool"
							value={formData.prize_pool}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Eligibility (optional)
						</label>
						<textarea
							name="eligibility"
							value={formData.eligibility}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Team-Based Tournament (optional)
						</label>
						<input
							type="checkbox"
							name="is_team_based"
							checked={formData.is_team_based}
							onChange={handleChange}
							className="mr-2"
						/>
						<span>Yes</span>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Rules (optional)
						</label>
						<textarea
							name="rules"
							value={formData.rules}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<button
						type="submit"
						className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
					>
						Create Tournament
					</button>
				</form>
			</div>
		</>
	);
}
