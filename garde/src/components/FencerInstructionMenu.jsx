import { SquareX } from "lucide-react";
import { Select, Space, Input, Button, Table } from "antd";
import React, { useEffect, useState, useRef, useContext } from "react";
import { showInstructionMenu, setInstructionMenu } from "./Fencer_Canvas";
import InstructionContext from "./InstructionContext";

// const CloseInstructionMenu = () => {
//     setInstructionMenu(false);
// }
const items = [
	{
		key: "1",
		label: "Dog",
	},
];

async function GetFencerInstructions() {
	const response = await fetch("/api/fencer_instructions");
	const data = await response.json();

	return data.map((item) => item.name); //Map function acts like a foreach loop
}

const FencerInstructionMenu = ({ setInstructionMenu, onSave }) => {
	const [fencerInstructions, setFencerInstructions] = useState([]); //MUST use useState to handle changes in variables.
	//Caused a lot of trouble here since fencerInstruction
	//variable wasn't changing state and had to use set function

	useEffect(() => {
		//Use the useEffect hook when dealing with functions that fetch data or manipulate DOM elements
		const fetchInstructions = async () => {
			try {
				const fencerInstructions = await GetFencerInstructions();
				setFencerInstructions(fencerInstructions);
				console.log(fencerInstructions);
			} catch (error) {
				console.error("Failed to fetch instructions", error);
			}
		};

		fetchInstructions();
	}, []);

	// console.log(fencerInstructions);

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
		},
	];

	// const dataSource = [
	//   {
	//     key: '1',
	//     name: {fencerInstructionInputValue},
	//     time: {timeValue}
	//   }
	// ]

	const [timeValue, setTimeValue] = useState("");

	const [data, setData] = useState([]);

	const [fencerInstructionInputValue, setFencerInstructionInputValue] =
		useState("");

	const addDataValues = () => {
		const keyId = data.length + 1;

		const newDataItem = {
			key: keyId,
			name: fencerInstructionInputValue,
			time: timeValue,
		};

		console.log(document.getElementById("fencerDropdown").value);

		setData([...data, newDataItem]); // Update data with the new item
	};

	const changeTimeValue = (event) => {
		setTimeValue(event.target.value);
	};

	const changeFencerInstructionValue = (value) => {
		setFencerInstructionInputValue(value);
	};

	const { setInstructions } = useContext(InstructionContext);

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-lg p-8 w-[800px] max-w-[90%] mx-auto">
				<h2 className="text-2xl font-semibold mb-6" style={{ color: "black" }}>
					Fencer Instructions
				</h2>
				<div className="flex items-center mb-6">
					<Select
						id="fencerDropdown"
						placeholder="Choose Instruction"
						className="flex-1 mr-4"
						onChange={changeFencerInstructionValue}
						options={fencerInstructions.map((instruction) => ({
							label: instruction,
							value: instruction,
						}))}
					/>
					<Input
						name="time"
						placeholder="Time (s)"
						className="w-20 mr-4"
						value={timeValue}
						onChange={changeTimeValue}
					/>
					<Button type="primary" onClick={addDataValues}>
						Add
					</Button>
				</div>
				<Table
					dataSource={data}
					columns={columns}
					pagination={false}
					className="mb-6"
				/>
				<div className="flex justify-end">
					<Button
						type="primary"
						onClick={() => {
							const newData = [...data];
							setData(newData);
							console.log(newData);
							setInstructions(newData);
							setInstructionMenu(false);
						}}
					>
						Save & Exit
					</Button>
				</div>
			</div>
		</div>
	);
};

export default FencerInstructionMenu;
