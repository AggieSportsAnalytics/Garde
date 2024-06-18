import { SquareX } from 'lucide-react'
import { Select, Space, Input, Button, Table} from "antd";
import React from 'react'
import {showInstructionMenu, setInstructionMenu} from './Fencer_Canvas';

const CloseInstructionMenu = () => {
    setInstructionMenu(false);
}
const items = [
    {
        key: '1',
        label: ("Dog"),
    },
];
const FencerInstructionMenu = () => {
  return (
    <div>
      <div className="absolute bottom-[-1/16] left-[1/4] mt-[-85px] ml-[-300px] bg-gray-500 w-[750px] h-[500px] rounded-md z-10">
        <div className="flex justify-end">
            <SquareX onClick={CloseInstructionMenu}/>
        </div>
        <Space>
            <Select placeholder="Choose Instruction" className="mt-[-10px] ml-10 w-80"/>
        </Space>
        <div className="mt-[-30px] ml-96">
            <Input placeholder="Time" className="w-20"/>
        </div>
        <div className="mt-[-30px] ml-[500px]">
            <Button type="primary">Add</Button>
        </div>
        <div className="mt-10">
            <Table />
        </div>
      </div>
    </div>
  )
}

export default FencerInstructionMenu    
