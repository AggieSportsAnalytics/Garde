"use client";

import React, { useState } from "react";
import Link from "next/link";
import Modal from "react-modal";
import Logout from "../auth/Logout";
import DeleteAccountButton from "../auth/DeleteAccount";
import { FaCog } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import UuidReveal from "./UuidReveal";
import axiosInstance from "../axios";
// import AddFencerInstruction from "./AddFencerInstruction";

function TopBar({
	id,
	fencers,
	currentFencer,
	setCurrentFencer,
	handleRefresh,
}) {
	const [isModalVisible, setIsModalVisible] = useState(false);

	const showModal = () => {
		setIsModalVisible(!isModalVisible);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
	};

	const removeFencer = async () => {
		try {
			const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/deleteCoachFencer?coachId=${id}&fencerId=${currentFencer.fencer_id}`;
			await axiosInstance.delete(workerUrl);
			handleRefresh();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="text-white">
			<header className="flex items-center justify-between border-b py-4 px-4">
				<Link href="/" className="cursor-pointer">
					<button
						type="button"
						className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 transition-transform duration-200 hover:scale-110 active:scale-100"
						title="Go Back"
					>
						&#8592;
					</button>
				</Link>

				{fencers.length > 0 ? (
					<>
						<span className="flex-grow text-center text-2xl font-semibold relative">
							<label htmlFor="fencer-select" className="sr-only">
								Select Fencer
							</label>
							<select
								id="fencer-select"
								value={currentFencer.fencer_id}
								onChange={(e) => {
									const selectedFencer = fencers.find(
										(f) => f.fencer_id === e.target.value,
									);
									setCurrentFencer(selectedFencer);
								}}
								className="ml-4 px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-600 transition duration-200"
							>
								{fencers.map((fencer) => (
									<option
										className="bg-gray-800 text-white"
										key={fencer.fencer_id}
										value={fencer.fencer_id}
									>
										{fencer.fencer_name}
									</option>
								))}
							</select>
						</span>
						<div className="relative">
							<button
								onClick={removeFencer}
								className="whitespace-nowrap absolute top-1/2 transform -translate-y-1/2 right-5 bg-red-600 px-3 py-2 hover:bg-red-500 text-white font-semibold rounded shadow-md cursor-pointer"
								type="button"
							>
								Remove Fencer
							</button>
						</div>
					</>
				) : (
					<div className="font-bold text-2xl">No Fencers Added</div>
				)}

				<div className="mr-4">
					<FaCog
						className="text-white text-2xl cursor-pointer hover:text-gray-400 transition-colors duration-200"
						onClick={showModal}
						title="Settings"
					/>
				</div>
			</header>

			<Modal
				isOpen={isModalVisible}
				onRequestClose={handleCancel}
				contentLabel="Settings"
				ariaHideApp={false}
				style={{
					content: {
						borderRadius: "20px",
						width: "90%",
						height: "450px",
						maxWidth: "500px",
						maxHeight: "90vh",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						padding: "20px",
						position: "fixed",
						display: "flex",
						flexDirection: "column",
						overflowY: "auto",
					},
					overlay: {
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						zIndex: 1000,
					},
				}}
			>
				<div className="flex flex-col items-center space-y-4 flex-grow">
					<button
						type="button"
						className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
						onClick={handleCancel}
					>
						<FiX size={24} />
					</button>

					<h2 className="text-xl font-bold text-gray-800">Settings</h2>

					<div className="w-full flex flex-col items-center space-y-4 flex-grow">
						<UuidReveal uuid={id} />
						{/* <AddFencerInstruction /> */}
					</div>

					<div className="mt-auto w-full">
						<hr className="border-gray-300 w-full mb-4" />
						<div className="flex justify-around space-x-4">
							<Logout />
							<DeleteAccountButton type="coach" userId={id} />
						</div>
					</div>
				</div>
			</Modal>
		</div>
	);
}

export default TopBar;
