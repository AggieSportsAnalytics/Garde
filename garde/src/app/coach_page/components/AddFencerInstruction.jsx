"use client";

import { Button, Input } from "antd";
import axios from "axios";
import React, { useState } from "react";

function AddFencerInstruction() {
	const [val, setVal] = useState("");

	const onSubmit = (name) => {
		const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/putInstruction/${name}`; // Replace with your actual Worker URL
		setVal("");

		axios.put(workerUrl).catch((e) => console.log(e));

		window.alert("Successfully added instruction!");
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
		</div>
	);
}

export default AddFencerInstruction;
