"use client";

import React, { useState } from "react";
import Link from "next/link";
import Modal from "react-modal";
import Logout from "../auth/Logout";
import DeleteAccountButton from "../auth/DeleteAccount";
import { FaCog } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import UuidReveal from "./UuidReveal";
import AddFencerInstruction from "./AddFencerInstruction";

function TopBar({ id, fencers, currentFencer, setCurrentFencer }) {
	// id = id of coach
	// fencers = [{fencer_id, coach_id, fencer_name}]
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
			<header className="flex items-center justify-between border-b py-4">
				{/* Link for navigation - Go back */}
				<Link href="/" className="cursor-pointer ml-4">
					<button
						type="button"
						className="bg-white text-black py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 duration-200 hover:scale-125 active:scale-100"
						title="Go Back"
					>
						&#8592;
					</button>
				</Link>

				{/* User name and dropdown */}
				<span className="flex-grow text-center text-3xl relative">
					{currentFencer.fencer_name}
					{fencers.length > 1 && (
						<span onClick={handleClick} className="cursor-pointer">
							{" "}
							&#9660;
						</span>
					)}
					{isVisible && (
						<div className="overflow-y-auto h-56 text-black absolute left-1/2 transform -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg">
							{fencers.map((fencer, index) => (
								<div
									key={index}
									className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b"
									onClick={() => handleNameClick(fencer)}
								>
									{fencer.fencer_name}
								</div>
							))}
						</div>
					)}
				</span>

				{/* Settings icon that opens the modal */}
				<div className="mr-4">
					<FaCog
						className="text-white text-2xl cursor-pointer"
						onClick={showModal}
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
						width: "450px",
						height: "450px",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						padding: "20px",
						position: "fixed",
						overflow: "auto",
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
					<UuidReveal uuid={id} />
					<AddFencerInstruction />
					<Logout />
					<DeleteAccountButton type="coach" otherId="" />
				</div>
			</Modal>
		</div>
	);
}

export default TopBar;
