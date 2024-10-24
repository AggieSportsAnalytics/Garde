"use client";

import { Button, Input } from "antd";
import axios from "axios";
import React, { useState } from "react";

function AddFencerInstruction() {
	const [val, setVal] = useState("");
	const [status, setStatus] = useState("");

	const onSubmit = async (name) => {
		try {
			const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/putInstruction/${name}`; // Replace with your actual Worker URL
			setVal("");

			await axios.put(workerUrl).catch((e) => console.error(e));

			setStatus("Successfully added instruction!");
		} catch (error) {
			setStatus("Failed to added instruction");
		} finally {
			await new Promise((r) => setTimeout(r, 2000));
			setStatus("");
		}
	};

	return (
		<div>
			<div className="flex justify-center">
				<Input
					placeholder="Input Instruction Here"
					value={val}
					onChange={(e) => setVal(e.target.value)}
					type="text"
					className="w-[300px] my-2"
					id="textInput"
				/>
			</div>
			<div className="flex justify-center mb-10">
				<Button type="dashed" onClick={() => onSubmit(val)}>
					Add Instruction
				</Button>
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
