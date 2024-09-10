import React, { useRef, useEffect, useState } from 'react';
import Webcam from "react-webcam";
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
const { Configuration, OpenAIApi, OpenAI } = require("openai");
import "@mediapipe/pose";
import Plotly from 'plotly.js-dist-min';
import Modal from 'react-modal';
import FencerInstructionMenu from './FencerInstructionMenu';
import { CardBody, CardContainer, CardItem } from "./ui/3d-card.tsx";
import { Hammer } from 'lucide-react';

const WebcamPose = ({ onVideoChange, isRecording, videoSource, runtime = 'mediapipe', modelType = 'full', setPose, containerWidth, containerHeight, darkMode }) => {
  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let intervalId = useRef(null);
  const minConfidence = 0.5;

  const [latestPose, setLatestPose] = useState(null);
  const [showInstructionMenu, setInstructionMenu] = useState(false);

  useEffect(() => {
    Modal.setAppElement('body');
  }, []);

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
        if (poses.length > 0) {
          setPose(poses[0]);
          setLatestPose(poses[0]);
          drawCanvas(poses[0], videoWidth, videoHeight, canvasRef.current, minConfidence);
          draw3DModel(poses[0]);
        }
      }
    };

    intervalId.current = setInterval(detect, 25);
  };

  const draw3DModel = (pose) => {
    const x = pose.keypoints3D.map(k => k.x);
    const y = pose.keypoints3D.map(k => -k.y);  // Invert y-axis
    const z = pose.keypoints3D.map(k => k.z);

    // Apply moving average filter to smoothen the coordinates
    const smoothingFactor = 0.99; 
    const smoothX = smoothCoordinates(x, smoothingFactor);
    const smoothY = smoothCoordinates(y, smoothingFactor);
    const smoothZ = smoothCoordinates(z, smoothingFactor);

    const connections = {
      'orange': [[11, 13], [13, 15], [23, 25], [25, 27]],
      'aqua': [[12, 14], [14, 16], [24, 26], [26, 28]],
      'white': [[11, 12], [11, 23], [24, 23], [12, 24]]
    };

    const colors = {
      points: 'black',
      lines: ['blue', 'orange', 'blue', 'orange', 'black', 'black', 'orange', 'aqua', 'orange', 'aqua', 'black', 'black']
    };

    const tracePoints = {
      x: smoothX,
      y: smoothZ,
      z: smoothY,
      mode: 'markers',
      marker: { size: 3, color: colors.points, opacity: 0.8 },
      type: 'scatter3d',
      showlegend: false,
      hovermode: false, 
      displayModeBar: false
    };

    const traceLines = [];
    Object.entries(connections).forEach(([color, pairs]) => {
      pairs.forEach(pair => {
        traceLines.push({
          x: [smoothX[pair[0]], smoothX[pair[1]]],
          y: [smoothZ[pair[0]], smoothZ[pair[1]]],
          z: [smoothY[pair[0]], smoothY[pair[1]]],
          mode: 'lines',
          line: { color: color, width: 2, opacity: 0.6 },
          type: 'scatter3d',
          showlegend: false,
          hovermode: false, 
          displayModeBar: false
        });
      });
    });

    const layout = {
      margin: { l: 0, r: 0, b: 0, t: 0 },
      plot_bgcolor: 'rgba(255,255,255, 0.7)',  // Transparent plot background
      paper_bgcolor: 'rgba(255,255,255, 0.7)',  // Transparent paper background
      scene: {
        xaxis: { title: 'X' },
        yaxis: { title: 'Z' },
        zaxis: { title: '-Y' },
        aspectmode: 'cube',
        camera: {
          eye: { x: -1.25, y: 2, z: 0.8 },  // Adjust the z-coordinate to lower the viewpoint
          up: { x: 0, y: 0, z: 1 },
          center: { x: 0, y: 0, z: 0 }
        },
        dragmode: 'turntable',
        hovermode: !1,  // Disable hover interactions
        displayModeBar: false
      }
    };

    // Calculate the rotation angle based on the fencer's movement direction
    const leftHipIndex = 23;
    const rightHipIndex = 24;
    const hipDiffX = x[rightHipIndex] - x[leftHipIndex];
    const hipDiffZ = z[rightHipIndex] - z[leftHipIndex];
    const rotationAngle = Math.atan2(hipDiffZ, hipDiffX);

    // Apply the rotation to the 3D model
    layout.scene.camera.eye = {
      x: -1.5 * Math.cos(rotationAngle),  
      y: -1.5 * Math.sin(rotationAngle),  
      z: 1.5  // Maintain the z-coordinate for the desired viewpoint
    };

    Plotly.react('3d-plot', [tracePoints, ...traceLines], layout, { displayModeBar: false });
  };

  // Function to apply moving average filter to coordinates
  const smoothCoordinates = (coordinates, smoothingFactor) => {
    const smoothedCoordinates = [];
    let prevCoordinate = coordinates[0];

    for (let i = 0; i < coordinates.length; i++) {
      const currentCoordinate = coordinates[i];
      const smoothedCoordinate = smoothingFactor * currentCoordinate + (1 - smoothingFactor) * prevCoordinate;
      smoothedCoordinates.push(smoothedCoordinate);
      prevCoordinate = smoothedCoordinate;
    }

    return smoothedCoordinates;
  };

  useEffect(() => {
    if (videoSource || isRecording) {
      runPoseDetection();
    }

    return () => {
      clearInterval(intervalId.current);
    };
  }, [isRecording, videoSource, runtime, modelType]);

  const ShowInstructionMenu = () => {
    setInstructionMenu(prev => !prev);
  }

  return (
    <>
      <div className={`flex flex-col items-center space-y-4 ${darkMode ? 'bg-black' : 'bg-white'}`} style={{ position: "relative", width: containerWidth, height: containerHeight }}>
        {isRecording || videoSource ? (
          <>
            <div className={`video-container ${darkMode ? 'bg-black' : 'bg-white'}`} style={{ position: "relative", width: "100%", height: "100%" }}>
              {videoSource ? (
                <video className="rounded-md" ref={videoRef} style={{ width: "100%", height: "100%" }} autoPlay loop muted />
              ) : (
                <Webcam className="rounded-md" ref={webcamRef} style={{ width: "100%", height: "100%" }} />
              )}
              <canvas className="rounded-md" ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
            </div>
          </>
        ) : null}
      </div>
      <div id="3d-plot" style={{ 
        width: '200px', 
        height: '200px', 
        position: 'absolute', 
        bottom: '0px', 
        right: '0px', 
        zIndex: 10, 
        background: 'rgba(0,0,0,0)', 
        borderRadius: '15px',
        border: '2px solid white',
        overflow: 'hidden'  
      }}></div>
       
      <div style={{ position: 'absolute', top: '-10%', left: '90%', zIndex: 20 }}>
        <Hammer className="w-10 h-10 hover:bg-slate-700 rounded-md" onClick={ShowInstructionMenu}/> {
          showInstructionMenu && (<FencerInstructionMenu setInstructionMenu={setInstructionMenu}/>)
        }
      </div>
    </> 
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

let prevPoint = { x: 0, y: 0 };
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
        currentSpeed = xDist / (timeElapsed / 100);
        startTime = Date.now();
        prevPoint = keypoints[i];
      }
    }
  }

  return { currentSpeed, timeElapsed, xDist };
}

function drawSkeleton(keypoints, minConfidence, ctx, videoWidth, videoHeight) {
  const connections = {
    'orange': [[11, 13], [13, 15], [23, 25], [25, 27]],
    'aqua': [[12, 14], [14, 16], [24, 26], [26, 28]],
    'white': [[11, 12], [11, 23], [24, 23], [12, 24]]
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
    angle = 360 - angle;
  }

  return angle;
}

function radiansToDegrees(radianAngles) {
  return Math.abs(radianAngles * (180 / Math.PI));
}

export function displayFeetDistance(keypoints) {
  const kp1 = keypoints[28]; // left_ankle
  const kp2 = keypoints[27]; // right_ankle

  const feetDistance = Math.abs(kp1.x - kp2.x);

  let predictedPose = "";
  let absSpeed = Math.abs(currentSpeed);

  // Enhanced pose prediction logic
  const leftKneeAngle = calculateAngle(keypoints[23], keypoints[25], keypoints[27]); // left_hip, left_knee, left_ankle
  const rightKneeAngle = calculateAngle(keypoints[24], keypoints[26], keypoints[28]); // right_hip, right_knee, right_ankle

  if (feetDistance > 200 && absSpeed < 20 && leftKneeAngle > 90 && rightKneeAngle > 150) {
    predictedPose = "advance";
  } else if (feetDistance > 200 && absSpeed < 20 && leftKneeAngle > 90 && rightKneeAngle > 150 && currentSpeed < 0) {
    predictedPose = "retreat";
  } else if (absSpeed > 20) {
    if (currentSpeed < -20 && leftKneeAngle > 120 && rightKneeAngle > 120) {
      predictedPose = "doubleQuickRetreat";
    } else if (currentSpeed > 20 && leftKneeAngle > 80 && rightKneeAngle > 160) {
      predictedPose = "doubleQuickAdvance";
    }
  } else if (feetDistance > 150 && leftKneeAngle > 110 && rightKneeAngle > 110) {
    if (currentSpeed > 20) {
      predictedPose = "pullingDoubleAdvance";
    } else {
      predictedPose = "pullingDoubleRetreat";
    }
  } else if (leftKneeAngle > 85 && rightKneeAngle > 140 && feetDistance < 200) {
    predictedPose = "en guarde";
  }

  return { feetDistance, predictedPose };
}


export async function OpenAIAPIFeedback(props) {
  const pose = props.pose || {};
  const userAngles = {
    "name": props.pose,
    "elbow_left": props.left_elbow,
    "hip_left": props.left_hip,
    "knee_left": props.left_knee,
    "elbow_right": props.right_elbow,
    "hip_right": props.right_hip,
    "knee_right": props.right_knee,
  }

  const idealAngles = [
    {
      "name": "en guarde",
      "elbow_left": "96",
      "hip_left": "117",
      "knee_left": "121",
      "elbow_right": "2",
      "hip_right": "170",
      "knee_right": "160"
    },
    {
      "name": "advance",
      "elbow_left": "87",
      "hip_left": "126",
      "knee_left": "132",
      "elbow_right": "36",
      "hip_right": "170",
      "knee_right": "160"
    },
    {
      "name": "retreat",
      "elbow_left": "90",
      "hip_left": "127",
      "knee_left": "144",
      "elbow_right": "8",
      "hip_right": "172",
      "knee_right": "170"
    },
    {
      "name": "lunge",
      "elbow_left": "178",
      "hip_left": "84",
      "knee_left": "110",
      "elbow_right": "170",
      "hip_right": "151",
      "knee_right": "165"
    }
  ];

  let comparison;
  
  if(pose === "en guarde") {
    comparison = idealAngles[0];
  }
  else if(pose === "advance") {
    comparison = idealAngles[1];
  }
  else if(pose === "retreat") {
    comparison = idealAngles[2];
  }
  else if(pose === "lunge") {
    comparison = idealAngles[3];
  }

  let query = `Please compare the user's angles ${JSON.stringify(userAngles)} with the ideal angles ${JSON.stringify(comparison)} for the ${userAngles.pose} position and provide a detailed analysis.`;
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
    dangerouslyAllowBrowser: true
  });

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { 
        role: 'system',
        content: `You are a helpful AI assistant embedded in an automated fencing coach
        program. You possess expert knowledge about the fencing sport and are very 
        articulate when giving feedback on how a fencer can improve their form. 
        You keep your feedback to 3 short, helpful bullet points, concise and snappy and don't stray too far away from the point.
        You are professional, inspiring and helpful.`
      },
      { 
        role: 'user', 
        content: query
      }
    ],
    model: 'gpt-4o-mini',
  });
  console.log(chatCompletion.choices[0].message.content);
  return chatCompletion.choices[0].message.content;

}

export const convertPixelsToMeters = (pixels, height, fencerHeightPixels) => {
  const pixelToMeterRatio = height / fencerHeightPixels;
  return pixels * pixelToMeterRatio;
};

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