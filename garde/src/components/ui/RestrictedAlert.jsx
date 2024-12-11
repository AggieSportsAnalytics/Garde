import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function RestrictedAlert({ redirect }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [showAlert, setShowAlert] = useState(false);

	useEffect(() => {
		const restricted = searchParams.get("restricted");
		if (restricted === "true") {
			setShowAlert(true);
		}
	}, [searchParams]);

	const closeModal = () => {
		router.push(redirect);
		setShowAlert(false);
	};

	return (
		<>
			{showAlert && (
				<div className="text-white fixed inset-0 bg-opacity-50 flex justify-center items-center px-4">
					<div className="p-6 bg-gray-900 rounded-lg shadow-lg max-w-sm w-full">
						<h2 className="text-lg font-semibold mb-3">Restricted Access</h2>
						<p className="mb-5">
							You must sign in to access the requested page.
						</p>
						<button
							type="button"
							onClick={closeModal}
							className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full"
						>
							Dismiss
						</button>
					</div>
				</div>
			)}
		</>
	);
}
