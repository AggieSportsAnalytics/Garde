import { SquareX, X } from 'lucide-react';
import { Select, Input, Button, Table, Card } from "antd";
import React, { useEffect, useState, useContext } from 'react';
import InstructionContext from './InstructionContext';
import { FaWalking, FaCheck, FaBalanceScale, FaTimes } from 'react-icons/fa';

const predefinedRoutines = {
  "Footwork Routine": [
    { name: "Rapid Advance", time: 5 },
    { name: "Controlled Retreat", time: 5 },
    { name: "Fast Advance", time: 5 },
    { name: "Controlled Retreat", time: 5 }
  ]
};

async function GetFencerInstructions() {
  const response = await fetch("/api/fencer_instructions");
  const data = await response.json();
  return data.map(item => item.name);
}

const FencerInstructionMenu = ({ setInstructionMenu, onSave }) => {
  const [fencerInstructions, setFencerInstructions] = useState([]);
  const [timeValue, setTimeValue] = useState("");
  const [data, setData] = useState([]);
  const [fencerInstructionInputValue, setFencerInstructionInputValue] = useState("");

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const fencerInstructions = await GetFencerInstructions();
        setFencerInstructions([...fencerInstructions, ...Object.keys(predefinedRoutines)]);
        console.log(fencerInstructions);
      } catch (error) {
        console.error("Failed to fetch instructions", error);
      }
    };
    fetchInstructions();
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Time (s)',
      dataIndex: 'time',
      key: 'time',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleTimeChange(record.key, e.target.value)}
          style={{ width: '60px' }}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleDelete(record.key)}>
          <FaTimes />
        </Button>
      ),
    },
  ];

  const addDataValues = () => {
    const keyId = data.length + 1;
    if (predefinedRoutines[fencerInstructionInputValue]) {
      // If a predefined routine is selected, add all its instructions
      const routineData = predefinedRoutines[fencerInstructionInputValue].map((item, index) => ({
        key: data.length + index + 1,
        ...item
      }));
      setData([...data, ...routineData]);
    } else {
      // Add custom instruction
      const newDataItem = {
        key: keyId,
        name: fencerInstructionInputValue,
        time: timeValue,
      };
      setData([...data, newDataItem]);
    }
  };

  const handleTimeChange = (key, newTime) => {
    const newData = data.map(item => 
      item.key === key ? { ...item, time: newTime } : item
    );
    setData(newData);
  };

  const handleDelete = (key) => {
    const newData = data.filter(item => item.key !== key);
    setData(newData);
  };

  const changeTimeValue = event => setTimeValue(event.target.value);
  const changeFencerInstructionValue = value => setFencerInstructionInputValue(value);
  const { setInstructions } = useContext(InstructionContext);

  const handleFootworkRoutineClick = () => {
    setData(predefinedRoutines["Footwork Routine"].map((item, index) => ({
      key: index + 1,
      ...item
    })));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-0">
      <div className="bg-white rounded-lg shadow-lg p-8 w-[800px] max-w-[90%] mx-auto relative">
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={() => setInstructionMenu(false)}
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'black' }}>Fencer Instructions</h2>
        <Card 
          title={<span><FaWalking className="inline-block mr-2" />Footwork Routine</span>} 
          bordered={true} 
          style={{ marginBottom: '20px', cursor: 'pointer' }}
          onClick={handleFootworkRoutineClick}
          hoverable
        >
          <p><strong>Purpose:</strong> To build agility, speed, and control in footwork.</p>
          <ul className="list-disc pl-5">
            <li>Set a marker on the floor.</li>
            <li>Start in the on-guard position and perform two rapid advances, then one controlled retreat.</li>
            <li>Continue with three fast advances, then four controlled retreats.</li>
            <li>Alternate advance and retreat quickly between the lines, focusing on smooth transitions.</li>
          </ul>
          <p><FaBalanceScale className="inline-block mr-2" />Maintain a low center of gravity and proper stance, avoiding upper body leaning. Make each movement distinct and purposeful.</p>
        </Card>

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
}

export default FencerInstructionMenu;