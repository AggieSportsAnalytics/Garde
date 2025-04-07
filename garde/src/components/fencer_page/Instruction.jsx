import React, { useContext } from "react";
import InstructionContext from "./InstructionContext";

const Instruction = ({ isRunning, instructionIndex }) => {
	const { instructions } = useContext(InstructionContext);

	const getCurrentInstruction = () => {
		if (
			isRunning &&
			instructions.length > 0 &&
			instructionIndex >= 0 &&
			instructionIndex < instructions.length
		) {
			return `${instructions[instructionIndex].name} (${instructions[instructionIndex].time}s)`;
		}
		return "Awaiting instruction";
	};

	return (
		<div
			className="border border-gray-300 rounded p-2 bg-white text-center"
			style={{
				margin: "1vh auto",
				fontSize: "1.5rem",
				backgroundColor: "#2D2D2D",
				color: "#FFF",
			}}
		>
			{getCurrentInstruction()}
		</div>
	);
};

export default Instruction;
