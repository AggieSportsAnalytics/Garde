"use client";

import React, { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import axios from "axios";

function AddFencerInstruction() {
	const [val, setVal] = useState("");
	const [status, setStatus] = useState("");

	const onSubmit = async (name) => {
		try {
			const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/putInstruction/${name}`; // Replace with your actual Worker URL
			setVal("");

			await axios
				.put(workerUrl, { withCredentials: true })
				.catch((e) => console.error(e));

			setStatus("Successfully added instruction!");
		} catch (error) {
			setStatus("Failed to add instruction");
		} finally {
			setTimeout(() => setStatus(""), 2000);
		}
	};

	return (
		<div>
			<div className="flex justify-center">
				<input
					placeholder="Input Instruction Here"
					value={val}
					onChange={(e) => setVal(e.target.value)}
					type="text"
					className="w-[300px] my-2 p-2 border rounded"
					id="textInput"
				/>
			</div>
			<div className="flex justify-center mb-10">
				<button
					type="button"
					onClick={() => onSubmit(val)}
					className="flex items-center bg-gray-100 px-4 py-2 rounded shadow-md hover:bg-gray-200"
				>
					<AiOutlinePlus className="mr-2" />
					Add Instruction
				</button>
			</div>
			<p
				className={`${status.includes("successfully") ? "text-green-500" : "text-red-500"}`}
			>
				{status}
			</p>
		</div>
	);
}

export default AddFencerInstruction;
