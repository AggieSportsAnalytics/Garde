import React, { useRef } from 'react';

const Stream_Vid = ({ onVideoChange }) => {
  const refFileInput = useRef(null);

  const fileChange = async (event) => {
    const file = event.target.files[0];
    if (file) { 
      const videoURL = URL.createObjectURL(file);
      onVideoChange(videoURL); // Notify the parent component of the new video
    }
  };

  const addVideo = () => {
    refFileInput.current.click();
  };

  return (
    <div className="flex flex-col items-start space-y-4" style={{ paddingTop: '2rem' }}>
      {/* Component structure */}
      <input 
        type="file" 
        accept="video/*" 
        ref={refFileInput} 
        style={{ display: 'none' }} 
        onChange={fileChange} 
      />

      <div className="flex gap-2">
        <button className="bg-white text-black font-bold py-2 px-4 rounded shadow-md hover:bg-gray-100" onClick = {addVideo}>
          Add Video
        </button>
        <button className="bg-white text-black font-bold py-2 px-4 rounded shadow-md hover:bg-gray-100">
          Record Video
        </button>
      </div>
    </div>
  );
};

export default Stream_Vid;