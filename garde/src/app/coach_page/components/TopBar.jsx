"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Modal } from "antd";
import Logout from "../../../components/Logout";
import DeleteAccountButton from "../../../components/DeleteAccount";
import { SettingOutlined } from "@ant-design/icons";
import UuidReveal from "./UuidReveal";

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
		setIsModalVisible(true);
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
					<SettingOutlined
						className="text-white text-2xl cursor-pointer"
						onClick={showModal}
					/>
				</div>
			</header>

			{/* Ant Design Modal */}
			<Modal
				title="Settings"
				open={isModalVisible}
				onCancel={handleCancel}
				footer={null}
			>
				<div className="flex flex-col items-center">
					{/* Logout Button */}
					<Logout />

					{/* Reveal ID Button */}
					<UuidReveal uuid={id} />

					<DeleteAccountButton type="coach" otherId="" />
				</div>
			</Modal>
		</div>
	);
}

export default TopBar;
