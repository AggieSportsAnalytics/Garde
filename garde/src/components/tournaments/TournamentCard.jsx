import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { selectTournament } from "@/src/stores/features/tournamentSlice";

function TournamentCard({ tournament }) {
	const router = useRouter();
	const dispatch = useDispatch();

	const onClick = () => {
		dispatch(selectTournament(tournament));
		router.push(`/tournaments/${tournament.tournament_id}`);
	};

	return (
		<button
			type="button"
			className="p-4 border border-gray-700 rounded-lg shadow-lg bg-gray-900 text-white hover:bg-gray-800 transition-transform duration-200 transform hover:scale-105 cursor-pointer"
			onClick={onClick}
		>
			<h3 className="text-xl font-bold mb-2">{tournament.event_name}</h3>
			<div className="text-gray-400 space-y-1">
				<p>
					<span className="font-semibold text-white">Organizer:</span>{" "}
					{tournament.organizer_name}
				</p>
				<p>
					<span className="font-semibold text-white">Location:</span>{" "}
					{tournament.location}
				</p>
				<p>
					<span className="font-semibold text-white">Privacy:</span>{" "}
					{tournament.privacy}
				</p>
				<p>
					<span className="font-semibold text-white">Start Time:</span>{" "}
					{new Date(tournament.start_time).toLocaleString()}
				</p>
			</div>
		</button>
	);
}

export default TournamentCard;
