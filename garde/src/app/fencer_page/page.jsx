import React from 'react';
import Stream_Vid from '../../components/Stream_Vid.jsx';
import Timer from '../../components/Timer.jsx';
import AI_Feedback from '../../components/AI_Feedback.jsx';
import Fencer_Canvas from '../../components/Fencer_Canvas.jsx';
import Fencer_Stats from '../../components/Fencer_Stats.jsx';
import Instruction from '../../components/Instruction.jsx';

export default function Fencer_Page() {
  return (
    <div className="flex flex-col h-screen font-sans bg-gray-100">
      {/* Navbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        {/* Back Button */}
        <button className="bg-gray-200 text-gray-800 py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300">
          &#8592; Back 
        </button>
        <span className="text-lg font-semibold flex-grow text-center">Fencer Name</span>
        <div style={{width: '68px'}}></div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 flex-grow">
        {/* Left Section - Videos */}
        <div className="flex flex-col p-5 bg-white">
          <div className="mb-5">
            <Stream_Vid />
          </div>
        </div>

        {/* Middle Section - Timer and Instructions */}
        <div className="flex flex-col items-center p-5 bg-white">
          <Timer />
          <Instruction />
          <Fencer_Canvas />
        </div>

        {/* Right Section - Feedback and Stats */}
        <div className="flex flex-col p-5 bg-white">
          <h3 className="text-center text-lg mb-5">Feedback</h3>
          <AI_Feedback />

          <Fencer_Stats />
        </div>
      </div>
    </div>
  );
}

