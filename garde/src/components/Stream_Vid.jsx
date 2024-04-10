import React from 'react';

const Stream_Vid = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex justify-center items-center border border-gray-300 rounded p-2 mb-5 bg-white w-full">StreamVid Component</div>
      <div className="flex gap-2">
        <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
          Add Video
        </button>
        <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
          Record Video
        </button>
      </div>
    </div>
  );
};

export default Stream_Vid;
