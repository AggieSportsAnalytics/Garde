import React, { useState } from "react";

const HeightInput = ({ handleHeightSave }) => {
	const [height, setHeight] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault(); // Prevent default form submission behavior
		handleHeightSave(height); // Call the parent function with the height
		setHeight(""); // Clear the input field after submission
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="w-full flex flex-col items-center space-y-4"
		>
			<h2>Enter Height (m)</h2>
			<input
				type="number"
				step="0.01"
				value={height}
				onChange={(e) => setHeight(e.target.value)}
				placeholder="e.g., 1.75"
				required
				style={{
					width: "80%",
					padding: "8px",
					marginBottom: "10px",
				}}
			/>
			<button
				type="submit"
				className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 focus:outline-none"
			>
				Save Height
			</button>
		</form>
	);
};

export default HeightInput;
