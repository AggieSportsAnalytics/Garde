import Modal from "react-modal";
import { useRouter } from "next/navigation";

export default function LoginModal({ isModalOpen, setIsModalOpen, redirect }) {
	const router = useRouter();

	const handleRoleSelection = (role) => {
		setIsModalOpen(false); // Close the modal
		if (role === "fencer") {
			router.push(`/fencer_signin?redirect=${redirect}`);
		} else if (role === "coach") {
			router.push(`/coach_signin?redirect=${redirect}`);
		}
	};

	return (
		<Modal
			isOpen={isModalOpen}
			onRequestClose={() => setIsModalOpen(false)}
			className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto mt-20"
			overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
		>
			<h2 className="text-xl font-semibold mb-4 text-center">
				Login: Are you a Fencer or a Coach?
			</h2>
			<div className="flex justify-center gap-4">
				<button
					type="button"
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					onClick={() => handleRoleSelection("fencer")}
				>
					Fencer
				</button>
				<button
					type="button"
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
					onClick={() => handleRoleSelection("coach")}
				>
					Coach
				</button>
			</div>
		</Modal>
	);
}
