import React, { useState, useEffect, useContext } from 'react';
import InstructionContext from './InstructionContext';

const Instruction = ({ isRunning, instructionIndex }) => {
  const [instruction, setInstruction] = useState('Awaiting instruction');
  const { instructions } = useContext(InstructionContext);
  
  useEffect(() => {
    if (isRunning && instructions.length > 0) {
      if (instructionIndex === -1) {
        setInstruction('Awaiting instruction');
      } else {
        setInstruction(`${instructions[instructionIndex].name}`);
        // Start a countdown for instructions[instructionIndex].time
        const timer = setTimeout(() => {
          setInstruction('Awaiting instruction');
        }, Number(instructions[instructionIndex].time) * 1000);
        return () => clearTimeout(timer);
      }
    } else {
      setInstruction('Awaiting instruction');
    }
  }, [isRunning, instructions, instructionIndex]);

  return (
    <div className="border border-gray-300 rounded p-2 bg-white w-1/4 " style={{ maxHeight: '10vh', margin: '1vh auto', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', backgroundColor: '#2D2D2D', color: '#FFF' }}>
      {instruction}
    </div>
  );
};

export default Instruction;
