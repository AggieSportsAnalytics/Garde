"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import {
	FaMapMarkerAlt,
	FaUserAlt,
	FaEnvelope,
	FaPhone,
	FaTrophy,
	FaUserFriends,
	FaTrashAlt,
	FaEdit,
} from "react-icons/fa";
import Link from "next/link";
import { FaVideo, FaUserPlus } from "react-icons/fa";
import checkAuth from "../../hooks/jwt_verify";
import RestrictedAlert from "../../../components/ui/RestrictedAlert";
import axiosInstance from "@/src/components/axios";
import Loader from "@/src/components/ui/Loader";
import CopyButton from "@/src/components/ui/CopyButton";
import { FiShare2 } from "react-icons/fi";
import Pinned from "@/src/components/videos/Pinned";

export default function TournamentPage({ params }) {
	const [tournament, setTournament] = useState(null);
	const [users, setUsers] = useState([]);
	const [joining, setJoining] = useState(false);
	const [loading, setLoading] = useState(false);
	const { tournament_id } = React.use(params);
	const [token, setToken] = useState("");
	const [pinned, setPinned] = useState([]);
	const router = useRouter();

	useEffect(() => {
		const pin = localStorage.getItem("pinnedTournament");
		if (pin) {
			setPinned(JSON.parse(pin));
		}
	}, []);

	const selectedTournament = useSelector(
		(state) => state.tournament.selectedTournament,
	);

	const fetchParticipants = async () => {
		try {
			const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getParticipants/${tournament_id}`;
			const response = await axiosInstance.get(workerUrl);

			setUsers(
				response.data.tournament.filter(
					(user) => user.relation !== "organizer",
				),
			);
		} catch (error) {
			console.error("Error fetching tournament:", error);
		}
	};

	useEffect(() => {
		const fetchTournament = async () => {
			try {
				setLoading(true);
				// Fetch the tournament from the backend
				const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/getTournament/${tournament_id}`;
				const response = await axiosInstance.get(workerUrl);

				if (!response.data.tournament[0]) {
					router.push("/tournaments");
				}

				setTournament(response.data.tournament[0]);
			} catch (error) {
				console.error("Error fetching tournament:", error);
			} finally {
				setLoading(false);
			}
		};

		const checkToken = async () => {
			try {
				const decoded = await checkAuth(
					router,
					`tournaments/${tournament_id}`,
					"",
					true,
				);
				setToken(decoded);
			} catch (error) {
				router.push(`tournaments/${tournament_id}?restricted=true`);
				console.error(error);
				return null;
			}
		};

		if (
			selectedTournament &&
			selectedTournament.tournament_id === tournament_id
		) {
			setTournament(selectedTournament);
		} else {
			fetchTournament();
		}
		checkToken();
		fetchParticipants();
	}, [selectedTournament, tournament_id]);

	const handleJoin = async () => {
		try {
			if (token?.email === tournament.organizer_email) {
				window.alert("Organizers are automatically joined");
				return;
			}
			if (
				users.length >= tournament.max_participants &&
				tournament.max_participants !== ""
			) {
				window.alert("Max participants reached");
				return;
			}
			if (new Date() >= new Date(tournament?.signup_deadline)) {
				window.alert("Signup deadline passed");
				return;
			}
			if (users.some((user) => user.user_email === token?.email)) {
				window.alert("User is already signed up");
				return;
			}

			if (token?.id) {
				setJoining(true);
				const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/putOwned/${token.id}`;
				const queryData = {
					user_type: token.type,
					user_name: token.name,
					user_email: token.email,
					relation: "participant",
					tournament_id: tournament_id,
				};

				await axiosInstance.put(workerUrl, queryData, {
					headers: { "Content-Type": "application/json" },
				});
				setJoining(false);
				fetchParticipants();
			} else {
				window.alert("You must login to join tournaments");
				router.push(`/signin?redirect=/tournaments/${tournament_id}`);
			}
		} catch (error) {
			setJoining(false);
			window.alert(error.response.data.message);
			console.error(error);
		}
	};

	const handleDeleteTournament = async () => {
		const confirmed = window.confirm(
			"Are you sure you want to delete this tournament? This action is irreversible.",
		);

		if (!confirmed) {
			return;
		}

		try {
			const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/deleteTournament/${tournament_id}`;
			await axiosInstance.delete(workerUrl);
			router.push("/tournaments");
		} catch (error) {
			console.error(error);
		}
	};

	const handleDeleteParticipant = async (user_id) => {
		try {
			const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/deleteParticipant/${tournament_id}/${user_id}`;
			await axiosInstance.delete(workerUrl);
			fetchParticipants();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			<Loader loading={loading} />
			<RestrictedAlert redirect={`/tournaments/${tournament_id}`} />
			<div className="p-6 w-full bg-gray-900 text-white min-h-screen shadow-lg">
				<div className="border-b border-gray-700 pb-6 mb-6">
					<div className="flex items-center justify-between">
						<Link href="/tournaments" className="cursor-pointer">
							<button
								type="button"
								className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 transition-transform duration-200 hover:scale-110 active:scale-100"
								title="Go Back"
							>
								&#8592;
							</button>
						</Link>

						<h1 className="text-4xl font-extrabold text-center flex-1">
							{tournament?.event_name || "Tournament Name"}
						</h1>

						{token?.id === tournament?.user_id && (
							<div className="flex gap-4">
								<button
									type="button"
									onClick={() =>
										router.push(`/tournaments/${tournament_id}/update`)
									}
									className="text-blue-500 hover:text-blue-600 transition-transform duration-200 hover:scale-110"
									title="Update Tournament"
								>
									<FaEdit className="text-2xl" />
								</button>

								<button
									type="button"
									onClick={handleDeleteTournament}
									className="text-red-500 hover:text-red-600 transition-transform duration-200 hover:scale-110"
									title="Delete Tournament"
								>
									<FaTrashAlt className="text-2xl" />
								</button>
							</div>
						)}
					</div>
				</div>

				<div className="flex justify-between items-center mb-8 px-6 space-x-5">
					{(users?.length < tournament?.max_participants ||
						tournament?.max_participants === "") &&
					new Date() < new Date(tournament?.signup_deadline) &&
					!users.some((user) => user.user_email === token?.email) &&
					token?.email !== tournament.organizer_email ? (
						<button
							type="button"
							className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded shadow-md transition-transform duration-200 hover:scale-105"
							onClick={handleJoin}
							disabled={joining}
						>
							<FaUserPlus className="text-lg" />{" "}
							{joining ? "Joining..." : "Join Tournament"}
						</button>
					) : (
						<>
							{!users.some((user) => user.user_email === token?.email) ? (
								<button
									type="button"
									className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white font-semibold rounded shadow-md cursor-not-allowed"
									disabled
								>
									<FaUserPlus className="text-lg" /> Join Tournament
								</button>
							) : (
								<>
									<button
										type="button"
										className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded shadow-md cursor-pointer"
										onClick={() => handleDeleteParticipant(token?.id)}
									>
										<FaTrashAlt className="text-lg" /> Leave Tournament
									</button>
								</>
							)}
						</>
					)}

					<div className="relative flex flex-col items-center space-y-4">
						<Link href={`/tournaments/${tournament_id}/videos`} passHref>
							<button
								type="button"
								className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded shadow-md transition-transform duration-200 hover:scale-105"
							>
								<FaVideo className="text-lg" /> View Videos
							</button>
						</Link>

						<div className="absolute top-full mt-4 w-full text-center space-x-2 flex flex-nowrap">
							<CopyButton
								text={`${process.env.NEXT_PUBLIC_BASE_URL}/tournaments/${tournament_id}`}
								style="inline-flex items-center text-blue-500 hover:underline text-sm gap-1"
								before="Share"
								size={16}
								after="Copied!"
								BeforeIcon={FiShare2}
							/>
							<Pinned
								pinned={pinned}
								setPinned={setPinned}
								id={tournament_id}
								stored="pinnedTournament"
							/>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-6 pt-3">
					{/* Left Column */}
					<div className="space-y-6">
						<div className="flex items-center gap-3">
							<FaMapMarkerAlt className="text-blue-500" />
							<p>
								<span className="font-semibold">Location:</span>{" "}
								{tournament?.location || "N/A"}
							</p>
						</div>

						<div className="flex items-center gap-3">
							<FaUserAlt className="text-blue-500" />
							<p>
								<span className="font-semibold">Privacy:</span>{" "}
								{tournament?.privacy === "public" ? "Public" : "Private"}
							</p>
						</div>

						<div className="space-y-1">
							<p>
								<span className="font-semibold">Start Time:</span>{" "}
								{new Date(tournament?.start_time).toLocaleString() || "N/A"}
							</p>
							<p>
								<span className="font-semibold">End Time:</span>{" "}
								{new Date(tournament?.end_time).toLocaleString() || "N/A"}
							</p>
							<p>
								<span className="font-semibold">Signup Deadline:</span>{" "}
								{new Date(tournament?.signup_deadline).toLocaleString() ||
									"N/A"}
							</p>
						</div>

						<div className="flex items-center gap-3">
							<FaTrophy className="text-blue-500" />
							<p>
								<span className="font-semibold">Registration Fee:</span>{" "}
								{tournament?.registration_fee
									? `$${tournament?.registration_fee}`
									: "Free"}
							</p>
						</div>

						<div className="flex items-center gap-3">
							<FaTrophy className="text-blue-500" />
							<p>
								<span className="font-semibold">Max Participants:</span>{" "}
								{tournament?.max_participants || "Unlimited"}
							</p>
						</div>

						<div className="flex flex-col gap-6">
							{/* Header */}
							<div className="flex items-center gap-3">
								<FaUserFriends className="text-blue-500 text-xl" />
								<h2 className="text-lg font-semibold">Participants</h2>
							</div>

							{/* Table */}
							<div className="overflow-x-auto">
								<table className="min-w-full bg-gray-800 text-white rounded-lg shadow-md">
									<thead className="bg-gray-700 text-left">
										<tr>
											<th className="px-4 py-2">Fencer/Coach</th>
											<th className="px-4 py-2">Name</th>
											<th className="px-4 py-2">Email</th>
											<th className="px-4 py-2">Time Joined</th>
											{token?.id === tournament?.user_id && (
												<th className="px-4 py-2">Actions</th>
											)}
										</tr>
									</thead>
									<tbody>
										{users.map((user, index) => (
											<tr
												key={`${user.user_id}`}
												className={`${
													index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
												} hover:bg-gray-700`}
											>
												<td className="px-4 py-2 capitalize">
													{user.user_type}
												</td>
												<td className="px-4 py-2">{user.user_name}</td>
												<td className="px-4 py-2">{user.user_email}</td>
												<td className="px-4 py-2">
													{new Date(user.timestamp).toLocaleString()}
												</td>
												{token?.id === tournament?.user_id && (
													<td className="px-4 py-2">
														<button
															type="button"
															onClick={() =>
																handleDeleteParticipant(user.user_id)
															}
															className="text-red-500 hover:text-red-600 transition-transform duration-200 hover:scale-110"
															title="Remove Participant"
														>
															<FaTrashAlt />
														</button>
													</td>
												)}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>

					{/* Right Column */}
					<div className="space-y-6">
						<div>
							<h2 className="font-semibold text-lg text-white mb-2">
								Organizer Details
							</h2>
							<div className="flex items-center gap-3">
								<FaUserAlt className="text-blue-500" />
								<p>
									<span className="font-semibold">Name:</span>{" "}
									{tournament?.organizer_name || "N/A"}
								</p>
							</div>
							<div className="flex items-center gap-3">
								<FaEnvelope className="text-blue-500" />
								<p>
									<span className="font-semibold">Email:</span>{" "}
									{tournament?.organizer_email || "N/A"}
								</p>
							</div>
							<div className="flex items-center gap-3">
								<FaPhone className="text-blue-500" />
								<p>
									<span className="font-semibold">Phone:</span>{" "}
									{tournament?.organizer_phone || "N/A"}
								</p>
							</div>
						</div>

						<div>
							<h2 className="font-semibold text-lg text-white mb-2">
								Description
							</h2>
							<p className="text-gray-400">
								{tournament?.description || "No description available."}
							</p>
						</div>

						<div>
							<h2 className="font-semibold text-lg text-white mb-2">Rules</h2>
							<p className="text-gray-400">
								{tournament?.rules || "No rules provided."}
							</p>
						</div>

						<div>
							<h2 className="font-semibold text-lg text-white mb-2">
								Eligibility
							</h2>
							<p className="text-gray-400">
								{tournament?.eligibility ||
									"No specific eligibility requirements."}
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
