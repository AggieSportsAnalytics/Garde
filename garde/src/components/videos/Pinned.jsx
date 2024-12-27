import { FiBookmark } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";

export default function Pinned({ pinned, setPinned, id, stored }) {
	const togglePin = (id) => {
		if (pinned.find((item) => item === id)) {
			const newPinned = pinned.filter((item) => item !== id);
			setPinned(newPinned);
			localStorage.setItem(stored, JSON.stringify(newPinned));

			return;
		}

		const newPinned = [...pinned, id];
		setPinned(newPinned);
		localStorage.setItem(stored, JSON.stringify(newPinned));
	};

	return (
		<button
			type="button"
			className="inline-flex items-center hover:underline text-sm text-center gap-1"
		>
			{pinned.find((item) => item === id) ? (
				<div
					onClick={() => togglePin(id)}
					className="inline-flex items-center hover:underline text-sm text-center gap-1"
				>
					<FaBookmark size={12} className="text-yellow-400" /> Unsave
				</div>
			) : (
				<div
					className="text-blue-500 inline-flex items-center hover:underline text-sm text-center gap-1"
					onClick={() => togglePin(id)}
				>
					<FiBookmark size={16} /> Save
				</div>
			)}
		</button>
	);
}
