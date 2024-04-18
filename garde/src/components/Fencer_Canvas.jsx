import React from 'react';

const Fencer_Canvas = ({ videoSource }) => {
  return (
    // Center the video player on the right side without the surrounding border
    <div className="flex justify-center items-center bg-transparent" style={{ height: '60vh', width: '100%' }}>  
      <video 
        src={videoSource} 
        controls 
        className="rounded-lg" 
        style={{ height: '50vh', width: 'auto', maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
      >
        {/* Default message or an image can be placed inside the video tag */}
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Fencer_Canvas;
