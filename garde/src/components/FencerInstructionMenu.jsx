import { SquareX } from 'lucide-react'
import { Select, Space, Input, Button, Table} from "antd";
import React, {useEffect, useState, useRef} from 'react'
import {showInstructionMenu, setInstructionMenu} from './Fencer_Canvas';

// const CloseInstructionMenu = () => {
//     setInstructionMenu(false);
// }
const items = [
    {
        key: '1',
        label: ("Dog"),
    },
];

async function GetFencerInstructions() {
  const response = await fetch("/api/fencer_instructions");
  const data = await response.json();

  return data.map(item => item.name); //Map function acts like a foreach loop
}

const FencerInstructionMenu = () => {
  const [fencerInstructions, setFencerInstructions] = useState([]); //MUST use useState to handle changes in variables. 
                                                                    //Caused a lot of trouble here since fencerInstruction 
                                                                    //variable wasn't changing state and had to use set function
  
  useEffect(() => { //Use the useEffect hook when dealing with functions that fetch data or manipulate DOM elements
    const fetchInstructions = async () => {
      try {
        const fencerInstructions = await GetFencerInstructions();
        setFencerInstructions(fencerInstructions)
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Time (s)',
      dataIndex: 'time',
      key: 'time'
    }
  ]

  // const dataSource = [
  //   {
  //     key: '1',
  //     name: {fencerInstructionInputValue},
  //     time: {timeValue}
  //   }
  // ]

  const [timeValue, setTimeValue] = useState(""); 

  const [data, setData] = useState([]);

  const [fencerInstructionInputValue, setFencerInstructionInputValue] = useState("");

  const addDataValues = () => {

    const keyId = data.length + 1;

    const newDataItem = {
      key: keyId,
      name: fencerInstructionInputValue,
      time: timeValue
    };

    console.log(document.getElementById("fencerDropdown").value);

    setData([...data, newDataItem]); // Update data with the new item

  }

  const changeTimeValue = event => {
    setTimeValue(event.target.value);
  }

  const changeFencerInstructionValue = value => {
    setFencerInstructionInputValue(value);
  }

  return (
    <div>
      <div className="absolute bottom-[-1/16] left-[1/4] mt-[-85px] ml-[-300px] bg-gray-500 w-[750px] h-[500px] rounded-md z-10">
        <div className="flex justify-end">
            <SquareX onClick={() => GetFencerInstructions()}/>
        </div>
        <Space>
            <Select id="fencerDropdown" placeholder="Choose Instruction" className="mt-[-10px] ml-10 w-80" onChange={changeFencerInstructionValue}
                options={fencerInstructions.map((instruction) => ({ //For each loop
                  label: instruction, 
                  value: instruction
                }))} 
            />
        </Space>
        <div className="mt-[-32px] ml-96">
            <Input name="time" placeholder="Time" className="w-20" value={timeValue} onChange={changeTimeValue}/>
        </div>
        <div className="mt-[-32px] ml-[500px]">
            <Button type="primary" onClick={() => addDataValues()}>Add</Button>
        </div>
        <div className="mt-10">
            <Table dataSource={data} columns={columns}/>
        </div>
      </div>
    </div>
  )
}

export default FencerInstructionMenu    
