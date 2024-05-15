import React, { useRef, useEffect } from 'react';
import Webcam from "react-webcam";
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@mediapipe/pose';

const WebcamPose = ({ onVideoChange, isRecording, videoSource, runtime = 'mediapipe', modelType = 'full', setPose }) => {
  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let intervalId = useRef(null);
  const minConfidence = 0.5; 

  useEffect(() => {
    if (videoRef.current && videoSource) {
      videoRef.current.src = videoSource;
      videoRef.current.play().catch(e => console.error("Error playing the video:", e));
    }
  }, [videoSource, videoRef.current]);

  const runPoseDetection = async () => {
    const model = poseDetection.SupportedModels.BlazePose;
    const detectorConfig = {
      runtime: 'mediapipe',
      modelType: 'full',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
    };

    const detector = await poseDetection.createDetector(model, detectorConfig);

    const detect = async () => {
      const video = videoSource ? videoRef.current : webcamRef.current.video;
      if (video && video.readyState === 4) {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        video.width = videoWidth;
        video.height = videoHeight;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const poses = await detector.estimatePoses(video);
        setPose(poses[0]);
        if (canvasRef.current && poses.length > 0) { 
          drawCanvas(poses[0], videoWidth, videoHeight, canvasRef.current, minConfidence);
        }
      }
    };

    intervalId.current = setInterval(detect, 100);
  };

  useEffect(() => {
    if (videoSource || isRecording) {
      runPoseDetection();
    }
  
    return () => {
      clearInterval(intervalId.current);
    };
  }, [isRecording, videoSource, runtime, modelType]);

  return (
    <div className="flex flex-col items-center space-y-4" style={{ position: "relative", width: 640, height: 480 }}>
      {isRecording || videoSource ? ( // Adjusted condition to ensure video element is rendered when there is a video source
        <>
          {videoSource ? (
            <video ref={videoRef} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }} autoPlay loop muted />
          ) : (
            <Webcam ref={webcamRef} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }} />
          )}
          <canvas ref={canvasRef} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }} />
        </>
      ) : null}
    </div>
  );
};

export default WebcamPose;

export function drawCanvas(pose, videoWidth, videoHeight, canvas, minConfidence) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, videoWidth, videoHeight); 

  const nodeSize = 10;
  const selectedKeypoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26];
  pose.keypoints.forEach((keypoint, index) => {
    if (selectedKeypoints.includes(index) && keypoint.score >= minConfidence) {
      const { x, y } = keypoint;
      drawKeypoints(x, y, nodeSize, ctx);
     // console.log(calculateAngle(pose.keypoints[11], pose.keypoints[13], pose.keypoints[15]));
     // console.log('Feet angle:', displayFeetDistance(pose.keypoints, ctx, videoWidth));
    }
  });

  drawSkeleton(pose.keypoints, minConfidence, ctx);  
}

function drawKeypoints(x, y, size, ctx) {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, 2 * Math.PI); 
  ctx.fillStyle = 'black';
  ctx.fill();
}

function drawSkeleton(keypoints, minConfidence, ctx) {
  const connections = {
    'orange': [[11, 13], [13, 15], [23, 25], [25, 27]], // Left side
    'aqua': [[12, 14], [14, 16], [24, 26], [26, 28]], // Right side
    'white': [[11,12], [11, 23], [24, 23], [12, 24]] // Body
  };

  Object.entries(connections).forEach(([color, pairs]) => {
    pairs.forEach(pair => {
      const kp1 = keypoints[pair[0]];
      const kp2 = keypoints[pair[1]];
      if (kp1 && kp2 && kp1.score >= minConfidence && kp2.score >= minConfidence) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    });
  });
}

function calculateDistance(point1, point2, point3) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateAngle(keypoint1, keypoint2, keypoint3) {
  //Start coordinates
  const x1 = keypoint1.x;
  const y1 = keypoint1.y;

  //Middle coordinates
  const x2 = keypoint2.x;
  const y2 = keypoint2.y;

  //End coordinates
  const x3 = keypoint3.x;
  const y3 = keypoint3.y;

  var angle = radiansToDegrees(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y1 - y2, x1 - x2));

  if (angle > 180) {
    angle = 360-angle;
  }

  return angle;
}

function radiansToDegrees(radianAngles) {
  return Math.abs(radianAngles * (180/Math.PI));
}

export function displayFeetDistance(keypoints) {
  const kp1 = keypoints[16];  // left foot
  const kp2 = keypoints[15];  // right foot

  // Calculate (horizontal) distance
  const feetDistance = Math.abs(kp1.x - kp2.x);

  const currentSpeed = 0; // Define currentSpeed here
  let predictedPose = "";
  let absSpeed = Math.abs(currentSpeed)
  // Hardcoded cutoffs, we might want to tune these
  if (feetDistance > 325) {
    predictedPose = "lunge";
  } else if (feetDistance > 200) {
    predictedPose = (currentSpeed > 0) ? "advance" : "retreat";
  } else {
    // Distance less than 200px, could be en guarde or part of an advance/retreat
    if (absSpeed > 20) {
      // Probably advance/retreat
      predictedPose = (currentSpeed > 0) ? "advance" : "retreat";
    } else {
      // Probably en guarde
      predictedPose = "en guarde"
    }
  }

  return { feetDistance, predictedPose };
}
/* function displayFeetDistance(keypoints, ctx, videoWidth) {
  const kp1 = keypoints[16];  // left foot
  const kp2 = keypoints[15];  // right foot

  // Calculate (horizontal) distance
  const feetDistance = Math.abs(kp1.x - kp2.x);

  // Display distance on line between the feet
  ctx.moveTo(kp1.x, kp1.y);
  ctx.fillStyle = 'Green';
  ctx.strokeStyle = 'Green';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.lineTo(kp2.x, kp2.y);
  ctx.stroke();

  const fontsize = 20;
  const fontface = 'roboto';
  const lineHeight = fontsize * 1.1;
  ctx.font = "bold " + fontsize + 'px ' + fontface;
  const distanceText = "" + feetDistance.toFixed(2);

  const x = (kp1.x + kp2.x)/2
  const y = (kp1.y + kp2.y)/2

  let textWidth = ctx.measureText(distanceText).width;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'Green';
  ctx.fillRect(x, y, textWidth, lineHeight);
  ctx.fillStyle = 'Black';
  ctx.fillText(distanceText, x, y);
  const currentSpeed = 0;
  let predictedPose = "";
  let absSpeed = Math.abs(currentSpeed)
  // Hardcoded cutoffs, we might want to tune these
  if (feetDistance > 325) {
    predictedPose = "lunge";
  } else if (feetDistance > 200) {
    predictedPose = (currentSpeed > 0) ? "advance" : "retreat";
  } else {
    // Distance less than 200px, could be en guarde or part of an advance/retreat
    if (absSpeed > 20) {
      // Probably advance/retreat
      predictedPose = (currentSpeed > 0) ? "advance" : "retreat";
    } else {
      // Probably en guarde
      predictedPose = "en guarde"
    }
  }

  ctx.strokeStyle = 'Green';
  ctx.fillStyle = "Green";
  ctx.fillText("Predicted pose: " + predictedPose, 2*videoWidth / 3, 20);
} */