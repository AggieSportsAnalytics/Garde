"use client";

import React, { useState } from "react";
import Link from "next/link";
import Modal from "react-modal";
import Logout from "../auth/Logout";
import DeleteAccountButton from "../auth/DeleteAccount";
import { FaCog } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { AiOutlineCheck } from "react-icons/ai";
import UuidReveal from "./UuidReveal";
import AddFencerInstruction from "./AddFencerInstruction";

function TopBar({ id, fencers, currentFencer, setCurrentFencer }) {
	const [isVisible, setIsVisible] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);

	const handleClick = () => {
		setIsVisible(!isVisible);
	};

	const handleNameClick = (selectedFencer) => {
		setCurrentFencer(selectedFencer);
		setIsVisible(false);
	};

	const showModal = () => {
		setIsModalVisible(!isModalVisible);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
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

				<span className="flex-grow text-center text-2xl font-semibold relative">
					{currentFencer.fencer_name}
					{fencers.length > 1 && (
						<button
							type="button"
							onClick={handleClick}
							className="cursor-pointer ml-2 text-gray-300 hover:text-white transition-colors duration-200"
							title="Select Fencer"
						>
							&#9660;
						</button>
					)}
					{isVisible && (
						<div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white text-black border border-gray-300 rounded-lg shadow-md max-h-60 overflow-y-auto z-50 animate-fade-in">
							{fencers.map((fencer) => (
								<button
									type="button"
									key={fencer.fencer_id}
									className="flex justify-between items-center w-full px-4 py-2 hover:bg-gray-100 border-b"
									onClick={() => handleNameClick(fencer)}
								>
									{fencer.fencer_name}
									{currentFencer.fencer_id === fencer.fencer_id && (
										<AiOutlineCheck className="text-green-500" />
									)}
								</button>
							))}
						</div>
					)}
				</span>

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
						overflowY: "auto",
					},
					overlay: {
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						zIndex: 1000,
					},
				}}
			>
				<div className="flex flex-col items-center space-y-4">
					<button
						type="button"
						className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
						onClick={handleCancel}
					>
						<FiX size={24} />
					</button>
					<h2 className="text-xl font-bold text-gray-800 mb-4">Settings</h2>

					{/* Modal Content */}
					<div className="w-full flex flex-col items-center space-y-4">
						<UuidReveal uuid={id} />
						<AddFencerInstruction />
					</div>

					{/* Bottom Actions */}
					<hr className="border-gray-300 w-full mt-6" />
					<div className="w-full flex justify-around space-x-4 mt-4">
						<Logout />
						<DeleteAccountButton type="coach" userId={id} />
					</div>
				</div>
			</Modal>
		</div>
	);
}

export default TopBar;
