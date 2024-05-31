import React, { useRef, useEffect } from 'react';
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
import Webcam from "react-webcam";
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
const {Configuration, OpenAIApi, OpenAI} = require("openai")
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
    <div className="flex flex-col items-center space-y-4" style={{ position: "relative", width: '100%', maxWidth: '640px', height: 'auto', top: '-40%' }}> 
      {isRecording || videoSource ? ( 
        <>
          {videoSource ? (
            <video className="rounded-md" ref={videoRef} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "auto" }} autoPlay loop muted />
          ) : (
            <Webcam className="rounded-md" ref={webcamRef} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "auto" }} />
          )}
          <canvas className="rounded-md" ref={canvasRef} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "auto" }} />
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
  const selectedKeypoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 29, 30];
  pose.keypoints.forEach((keypoint, index) => {
    if (selectedKeypoints.includes(index) && keypoint.score >= minConfidence) {
      let { x, y } = keypoint;

      // Ensure the keypoints stay within the canvas boundaries
      x = Math.max(0, Math.min(videoWidth, x));
      y = Math.max(0, Math.min(videoHeight, y));

      drawKeypoints(x, y, nodeSize, ctx);
    }
  });

  drawSkeleton(pose.keypoints, minConfidence, ctx, videoWidth, videoHeight);  
}

function drawKeypoints(x, y, size, ctx) {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, 2 * Math.PI); 
  ctx.fillStyle = 'black';
  ctx.fill();
}

let prevPoint = {x: 0, y: 0};
let startTime = Date.now();
let timeElapsed = 0;
let currentSpeed = 0;
let xDist = 0;

export function calculateSpeed(keypoints) {
  let relevantPts = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

  for (let i of relevantPts) {
    if (i === 23) { 
      timeElapsed = Date.now() - startTime;
      if (timeElapsed > 500) {
        xDist = keypoints[i].x - prevPoint.x;
        currentSpeed = xDist / (timeElapsed/100);
        startTime = Date.now();
        prevPoint = keypoints[i];
      }
    }
  }

  return {currentSpeed, timeElapsed, xDist}
}

function drawSkeleton(keypoints, minConfidence, ctx, videoWidth, videoHeight) {
  const connections = {
    'orange': [[11, 13], [13, 15], [23, 25], [25, 27]], 
    'aqua': [[12, 14], [14, 16], [24, 26], [26, 28]], 
    'white': [[11,12], [11, 23], [24, 23], [12, 24]] 
  };

  Object.entries(connections).forEach(([color, pairs]) => {
    pairs.forEach(pair => {
      const kp1 = keypoints[pair[0]];
      const kp2 = keypoints[pair[1]];
      if (kp1 && kp2 && kp1.score >= minConfidence && kp2.score >= minConfidence) {
        ctx.beginPath();
        ctx.moveTo(
          Math.max(0, Math.min(videoWidth, kp1.x)), 
          Math.max(0, Math.min(videoHeight, kp1.y))
        );
        ctx.lineTo(
          Math.max(0, Math.min(videoWidth, kp2.x)), 
          Math.max(0, Math.min(videoHeight, kp2.y))
        );
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
  const x1 = keypoint1.x;
  const y1 = keypoint1.y;
  const x2 = keypoint2.x;
  const y2 = keypoint2.y;
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
  const kp1 = keypoints[16];  
  const kp2 = keypoints[15];  

  const feetDistance = Math.abs(kp1.x - kp2.x);

  let predictedPose = "";
  let absSpeed = Math.abs(currentSpeed)
  if (feetDistance > 275) {
    predictedPose = "lunge";
  } else if (feetDistance > 200) {
    if (currentSpeed < -20) {
      predictedPose = "retreat";
    } else {
      predictedPose = "advance";
    }
  } else {
    if (absSpeed > 20) {
      if (currentSpeed < -20) {
        predictedPose = "retreat";
      } else {
        predictedPose = "advance";
      }
    } else {
      predictedPose = "en guarde"
    }
  }

  return { feetDistance, predictedPose };
}



export async function OpenAIAPIFeedback(props) {
  
  const userAngles = props;

  const idealAngles = [
    {
      "name": "En-Guarde",
      "elbow_left": "96",
      "hip_left": "117",
      "knee_left": "121",
      "elbow_right": "2",
      "hip_right": "170",
      "knee_right": "160"
    },
    {
      "name": "Advance",
      "elbow_left": "87",
      "hip_left": "126",
      "knee_left": "132",
      "elbow_right": "36",
      "hip_right": "170",
      "knee_right": "160"
    },
    {
      "name": "Retreat",
      "elbow_left": "90",
      "hip_left": "127",
      "knee_left": "144",
      "elbow_right": "8",
      "hip_right": "172",
      "knee_right": "170"
    },
    {
      "name": "Lunge",
      "elbow_left": "178",
      "hip_left": "84",
      "knee_left": "110",
      "elbow_right": "170",
      "hip_right": "151",
      "knee_right": "165"
    }
  ]
    
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
    dangerouslyAllowBrowser: true
  });
  
  //const prompt = "";
  let dataComp = `User's angles: ${JSON.stringify(userAngles)}, ideal angles: ${JSON.stringify(comparison)}.`;
  let query = `Please compare the user's angles ${JSON.stringify(userAngles)} with the ideal angles for the ${user_angles.name} position and provide a detailed analysis.`;

  const chatCompletion = await openai.chat.completions.create({
    messages: [
                //Prompt engineering the AI feedback coach to give more precise feedback
                { 
                  role: 'system',
                  content: `You are a helpful AI assistant embedded in an automated fencing coach
                  program. You possess expert knowledge about fencing as a sport and are very 
                  articulate when giving feedback on how a fencer can improve their form. 
                  You keep your feedback short, concise and snappy and don't stray too far away from the point.
                  You are professional, inspiring and helpful.`
                },
                { 
                  role: 'user', 
                  content: `Suggest how a fencer should improve their posture given ${idealAngles[1]}
                  that they want to become better fencers`
                }
              
              ],
    model: 'gpt-4',
  });

  //console.log(chatCompletion.choices[0].message.content);
  return chatCompletion.choices[0].message.content;
  //return chatCompletion.choices[0].content;
}

// const url = process.env.MONGODB_URL
// const client = new MongoClient(url, {
//   serverApi: ServerApiVersion.v1,
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// export async function getFromMongo(req, res) {
//     try {
//         const data = req.body;

//         await client.connect();

//         const db = client.db("Garde");
//         const collection = db.collection(data.type);

//         let document = await collection.find({}).toArray();

//         // if(data.type === "fencer" && !document) {
//         //     document = createFencer(data, collection);
//         // }
//         // else if(data.type === "coach" && !document) {
//         //     document = createCoach(data, collection);
//         // }

//         res.status(200).json({ "document": document });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }





