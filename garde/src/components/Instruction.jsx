import React from 'react';

const Instruction = ({ instructionIndex, instructions }) => {
  let instruction;

  if (instructionIndex === -1) {
    instruction = 'Awaiting instruction';
  } else if (instructionIndex >= instructions.length) {
    instruction = 'End of instructions';
  } else {
    instruction = instructions[instructionIndex];
  }
  return (
    <div className="border border-gray-300 rounded p-2 bg-white w-1/4 " style={{ maxHeight: '10vh', margin: '1vh auto', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem',backgroundColor: '#2D2D2D', color: '#FFF' }}>
      {instruction}
    </div>
  );
};
export default Instruction;