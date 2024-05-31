'use client'

import React, { useState, useEffect } from 'react';
import Stream_Vid from '../../components/Stream_Vid.jsx';
import Timer from '../../components/Timer.jsx';
import AI_Feedback from '../../components/AI_Feedback.jsx';
import Fencer_Canvas from '../../components/Fencer_Canvas.jsx';
import Fencer_Stats from '../../components/Fencer_Stats.jsx';
import Instruction from '../../components/Instruction.jsx';
import { useUser } from '@clerk/nextjs';

export default function Fencer_Page() {
  const [videoSource, setVideoSource] = useState('');
  const [fencer, setFencer] = useState({});
  const { user } = useUser();

  useEffect(() => {
    const fetchFencer = async () => {
      const f = await getFencer(user.id, user.fullName, "fencer", setFencer);
      setFencer(f);
    };
  
    if (user && user.id && user.fullName) {
      fetchFencer();
    }
  }, [user]);

  const handleVideoChange = (newVideoSource) => {
    setVideoSource(newVideoSource);
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-900 text-white">
      {/* Navbar */}
      <div className="flex items-center justify-between p-4 bg-black border-b border-gray-700">
        {/* Left Side - Back Button */}
        <button className="bg-gray-700 text-white py-2 px-4 rounded text-lg font-semibold hover:bg-gray-600">
          &#8592;
        </button>
        {/* Center - Fencer Name */}
        {user && user.fullName && (<span className="text-lg font-semibold flex-1 text-center">{user.fullName}</span>)}
        {/* Right Side - Stream Vid Buttons */}
        <div className="absolute right-4 top-10">
          <Stream_Vid onVideoChange={handleVideoChange} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-grow overflow-hidden">
        {/* Column 1 - Feedback and Stats */}
        <div className="w-1/3 bg-gray-800 p-4 flex flex-col space-y-4 border-r border-gray-700" /* Added a right border and space between children */>
          <div className="box-border h-full p-4 border-2 border-gray-700 rounded-lg shadow-lg" /* Added box styling */>
            <AI_Feedback />
          </div>
          <div className="box-border h-full p-4 border-2 border-gray-700 rounded-lg shadow-lg" /* Added box styling */>
            <Fencer_Stats />
          </div>
        </div>

        {/* Column 2 - Timer, Instruction, Canvas */}
        <div className="w-2/3 bg-gray-800 flex flex-col">
          <div className="mt-9">
            <Timer />
          </div>
          <div className="my-5">
            <Instruction />
          </div>
          <div className="flex-grow">
            <Fencer_Canvas videoSource={videoSource} />
          </div>
        </div>
      </div>
      {/* <div>
        _id: {fencer._id}
        <br></br>
        Name: {fencer.name}
      </div> */}
    </div>
  );
}

const getFencer = async (userId, name, type) => {
  const response = await fetch('/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({"_id": userId, "name": name, "type": type}),
  })

  const result = await response.json();
  
  // setFencer(result.document);
  return result.document
};