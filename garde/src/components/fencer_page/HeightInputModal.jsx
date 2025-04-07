import React, { useState } from "react";
import Modal from "react-modal";

const HeightInputModal = ({ isOpen, onClose, onSave }) => {
	const [height, setHeight] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		if (height) {
			onSave(Number.parseFloat(height));
			onClose();
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onClose}
			contentLabel="Enter Height"
			ariaHideApp={false}
			style={{
				overlay: {
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					zIndex: 9999,
				},
				content: {
					width: "320px",
					height: "220px",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					borderRadius: "12px",
					padding: "20px",
					zIndex: 9999,
				},
			}}
		>
			<h2 style={{ marginBottom: "16px" }}>Enter Height (meters)</h2>
			<form onSubmit={handleSubmit}>
				<input
					type="number"
					step="0.01"
					value={height}
					onChange={(e) => setHeight(e.target.value)}
					placeholder="e.g. 1.75"
					required
					style={{
						width: "80%",
						padding: "8px",
						marginBottom: "16px",
						borderRadius: "4px",
						border: "1px solid #ccc",
					}}
				/>
				<div style={{ display: "flex", gap: "10px" }}>
					<button
						type="submit"
						style={{
							padding: "8px 16px",
							borderRadius: "4px",
							border: "none",
							cursor: "pointer",
							backgroundColor: "#4caf50",
							color: "#fff",
						}}
					>
						Save
					</button>
					<button
						type="button"
						onClick={onClose}
						style={{
							padding: "8px 16px",
							borderRadius: "4px",
							border: "1px solid #ccc",
							cursor: "pointer",
							backgroundColor: "#fff",
						}}
					>
						Cancel
					</button>
				</div>
			</form>
		</Modal>
	);
};

export default HeightInputModal;
