import React, { useEffect, useState, useContext } from "react";
import InstructionContext from "./InstructionContext";
import {
	FaWalking,
	FaCheck,
	FaBalanceScale,
	FaTimes,
	FaHandPaper,
} from "react-icons/fa";
import { FiX } from "react-icons/fi";
import axiosInstance from "../axios";

const predefinedRoutines = {
	"Footwork Routine": [
		{ name: "Rapid Advance", time: 5 },
		{ name: "Controlled Retreat", time: 5 },
		{ name: "Fast Advance", time: 5 },
		{ name: "Controlled Retreat", time: 5 },
	],
	"Parry-Riposte Drill": [
		{ name: "Parry Quarte", time: 3 },
		{ name: "Riposte", time: 2 },
		{ name: "Parry Sixte", time: 3 },
		{ name: "Riposte", time: 2 },
	],
};

async function GetFencerInstructions() {
	try {
		const response = await axiosInstance.get(
			`${process.env.NEXT_PUBLIC_GARDE_WORKER}/getFencerInstructions`,
		);
		return response.data.instructions.map((item) => item.name);
	} catch (error) {
		console.error("Failed to fetch fencer instructions:", error);
		return [];
	}
}

const FencerInstructionMenu = ({ setInstructionMenu, onSave }) => {
	const [fencerInstructions, setFencerInstructions] = useState([]);
	const [timeValue, setTimeValue] = useState("");
	const [data, setData] = useState([]);
	const [fencerInstructionInputValue, setFencerInstructionInputValue] =
		useState("");

	useEffect(() => {
		const fetchInstructions = async () => {
			try {
				const fencerInstructions = await GetFencerInstructions();
				setFencerInstructions([
					...fencerInstructions,
					...Object.keys(predefinedRoutines),
				]);
			} catch (error) {
				console.error("Failed to fetch instructions", error);
			}
		};
		fetchInstructions();
	}, []);

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Time (s)",
			dataIndex: "time",
			key: "time",
			render: (text, record) => (
				<input
					value={text}
					onChange={(e) => handleTimeChange(record.key, e.target.value)}
					style={{ width: "60px" }}
				/>
			),
		},
		{
			title: "Action",
			key: "action",
			render: (_, record) => (
				<button type="button" onClick={() => handleDelete(record.key)}>
					<FaTimes />
				</button>
			),
		},
	];

	const addDataValues = () => {
		const keyId = data.length + 1;
		if (predefinedRoutines[fencerInstructionInputValue]) {
			// If a predefined routine is selected, add all its instructions
			const routineData = predefinedRoutines[fencerInstructionInputValue].map(
				(item, index) => ({
					key: data.length + index + 1,
					...item,
				}),
			);
			setData([...data, ...routineData]);
		} else {
			// Add custom instruction
			const newDataItem = {
				key: keyId,
				name: fencerInstructionInputValue,
				time: timeValue,
			};
			if (!fencerInstructionInputValue || !timeValue) {
				return;
			}
			setData([...data, newDataItem]);
			setTimeValue("");
		}
	};

	const handleTimeChange = (key, newTime) => {
		const newData = data.map((item) =>
			item.key === key ? { ...item, time: newTime } : item,
		);
		setData(newData);
	};

	const handleDelete = (key) => {
		const newData = data.filter((item) => item.key !== key);
		setData(newData);
	};

	const changeFencerInstructionValue = (value) =>
		setFencerInstructionInputValue(value);
	const { setInstructions } = useContext(InstructionContext);

	const handleFootworkRoutineClick = () => {
		setData(
			predefinedRoutines["Footwork Routine"].map((item, index) => ({
				key: index + 1,
				...item,
			})),
		);
	};

	const handleRoutineClick = (routine) => {
		setData(
			predefinedRoutines[routine].map((item, index) => ({
				key: index + 1,
				...item,
			})),
		);
	};

	return (
		<div
			className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-0"
			style={{ paddingTop: "80px" }}
		>
			<div className="max-h-[850px] overflow-y-auto bg-white rounded-lg shadow-lg p-8 w-[800px] max-w-[90%] mx-auto relative">
				<button
					className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
					onClick={() => setInstructionMenu(false)}
				>
					<FiX size={24} />
				</button>
				<h2 className="text-2xl font-semibold mb-6" style={{ color: "black" }}>
					Fencer Instructions
				</h2>
				<div className="flex flex-wrap -mx-2">
					<div className="w-full sm:w-1/2 p-2">
						<div
							className="bg-gray-100 p-4 rounded-lg cursor-pointer shadow-md hover:bg-gray-200"
							onClick={() => handleRoutineClick("Footwork Routine")}
						>
							<div className="flex items-center mb-2">
								<FaWalking className="inline-block mr-2" />
								<span>Footwork Routine</span>
							</div>
							<p>
								<strong>Purpose:</strong> To build agility, speed, and control
								in footwork.
							</p>
							<ul className="list-disc pl-5">
								<li>Set a marker on the floor.</li>
								<li>
									Start in the on-guard position and perform two rapid advances,
									then one controlled retreat.
								</li>
								<li>
									Continue with three fast advances, then four controlled
									retreats.
								</li>
								<li>
									Alternate advance and retreat quickly between the lines,
									focusing on smooth transitions.
								</li>
							</ul>
							<p>
								<FaBalanceScale className="inline-block mr-2" /> Maintain a low
								center of gravity and proper stance, avoiding upper body
								leaning. Make each movement distinct and purposeful.
							</p>
						</div>
					</div>
					<div className="w-full sm:w-1/2 p-2">
						<div
							className="bg-gray-100 p-4 rounded-lg cursor-pointer shadow-md hover:bg-gray-200"
							onClick={() => handleRoutineClick("Parry-Riposte Drill")}
						>
							<div className="flex items-center mb-2">
								<FaHandPaper className="inline-block mr-2" />
								<span>Parry-Riposte Drill</span>
							</div>
							<p>
								<strong>Purpose:</strong> To practice quick parries and
								ripostes.
							</p>
							<ul className="list-disc pl-5">
								<li>Start in the on-guard position.</li>
								<li>Coach attacks with a straight thrust to the chest.</li>
								<li>
									Quickly parry in quarte and immediately riposte with a
									straight thrust.
								</li>
								<li>Reset to on-guard position.</li>
								<li>Coach attacks again, now to the outside line.</li>
								<li>Parry in sixte and riposte with a straight thrust.</li>
							</ul>
							<p>
								<FaCheck className="inline-block mr-2" /> Focus on speed and
								precision in both the parry and the riposte. Maintain proper
								distance and blade control throughout.
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center mb-6">
					<select
						id="fencerDropdown"
						className="flex-1 mr-4 p-2 border rounded"
						onChange={(e) => changeFencerInstructionValue(e.target.value)}
						defaultValue=""
					>
						<option value="" disabled>
							Choose Instruction
						</option>
						{fencerInstructions.map((instruction) => (
							<option key={instruction} value={instruction}>
								{instruction}
							</option>
						))}
					</select>
					<input
						name="time"
						placeholder="Time (s)"
						className="w-20 mr-4 p-2 border rounded"
						value={timeValue}
						onChange={(e) => setTimeValue(e.target.value)}
						type="number"
					/>
					<button
						className="flex items-center bg-gray-100 px-4 py-2 rounded shadow-md hover:bg-gray-200"
						onClick={addDataValues}
					>
						Add
					</button>
				</div>

				<table className="mb-6 w-full border-collapse">
					<thead>
						<tr>
							{columns.map((col) => (
								<th key={col.key} className="border p-2 bg-gray-200">
									{col.title}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.map((row, index) => (
							<tr key={index}>
								{columns.map((col) => (
									<td key={col.key} className="border p-2">
										{col.render
											? col.render(row[col.dataIndex], row)
											: row[col.dataIndex]}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>

				<div className="flex justify-end">
					<button
						className="flex items-center bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600"
						onClick={() => {
							const newData = [...data];
							setData(newData);
							setInstructions(newData);
							setInstructionMenu(false);
						}}
					>
						Save & Exit
					</button>
				</div>
			</div>
		</div>
	);
};

export default FencerInstructionMenu;
