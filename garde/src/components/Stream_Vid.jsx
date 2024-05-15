import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const Stream_Vid = ({ onVideoChange, isRecording, toggleRecording }) => {
  const webcamRef = useRef(null);
  const refFileInput = useRef(null);
  const [videoAdded, setVideoAdded] = useState(false);  // Track if video has been added

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      onVideoChange(videoURL);
      setVideoAdded(true);  // Update state to show video has been added
    }
  };

  const addVideo = () => {
    if (!videoAdded) {
      refFileInput.current.click();
    } else {
      onVideoChange("");  // Clear the video source
      setVideoAdded(false);  // Reset state to show no video is added
    }
  };

  const captureScreenshot = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      onVideoChange(screenshot);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-4" style={{ paddingTop: '2rem' }}>
      <input
        type="file"
        accept="video/*"
        ref={refFileInput}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div className="flex gap-2">
        <button className="bg-white text-black font-bold py-2 px-4 rounded shadow-md hover:bg-gray-100" onClick={addVideo}>
          {videoAdded ? 'Remove Video' : 'Add Video'}
        </button>
        <button className="bg-white text-black font-bold py-2 px-4 rounded shadow-md hover:bg-gray-100" onClick={toggleRecording}>
          {isRecording ? 'Stop Recording' : 'Record Video'}
        </button>
      </div>
    </div>
  );
};

export default Stream_Vid;
