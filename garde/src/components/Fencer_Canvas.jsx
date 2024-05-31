import React, { useRef, useEffect, useState } from 'react';
import Webcam from "react-webcam";
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
const { Configuration, OpenAIApi, OpenAI } = require("openai");
import "@mediapipe/pose";
import Plotly from 'plotly.js-dist-min';
import Modal from 'react-modal';

const WebcamPose = ({ onVideoChange, isRecording, videoSource, runtime = 'mediapipe', modelType = 'full', setPose }) => {
  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let intervalId = useRef(null);
  let openAICallIntervalId = useRef(null);
  const minConfidence = 0.5;

  const [latestPose, setLatestPose] = useState(null);

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
        setPose(poses[0]);
        setLatestPose(poses[0]);
        if (canvasRef.current && poses.length > 0) {
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

    const connections = {
      'orange': [[11, 13], [13, 15], [23, 25], [25, 27]],
      'aqua': [[12, 14], [14, 16], [24, 26], [26, 28]],
      'white': [[11, 12], [11, 23], [24, 23], [12, 24]]
    };

    const colors = {
      points: 'black',
      lines: ['blue', 'orange', 'blue', 'orange', 'white', 'white', 'orange', 'aqua', 'orange', 'aqua', 'white', 'white']
    };

    const tracePoints = {
      x: x,  // Use x for the horizontal axis
      y: z,  // Use z for the vertical axis
      z: y,  // Use y for the depth axis
      mode: 'markers',
      marker: { size: 3, color: colors.points, opacity: 0.8 }, // Less translucent points
      type: 'scatter3d',
      showlegend: false,
      hovermode: false, 
      displayModeBar: false
    };

    const traceLines = [];
    Object.entries(connections).forEach(([color, pairs]) => {
      pairs.forEach(pair => {
        traceLines.push({
          x: [x[pair[0]], x[pair[1]]],  // Use x for the horizontal axis
          y: [z[pair[0]], z[pair[1]]],  // Use z for the vertical axis
          z: [y[pair[0]], y[pair[1]]],  // Use inverted y for the depth axis
          mode: 'lines',
          line: { color: color, width: 2, opacity: 0.6 }, // More translucent lines
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
        xaxis: { title: 'X' },  // X-axis is horizontal
        yaxis: { title: 'Z' },  // Z-axis is vertical
        zaxis: { title: '-Y' },  // Y-axis is depth and inverted
        aspectmode: 'cube',
        camera: {
          eye: { x: 1.25, y: 1.25, z: 1.25},  // Adjusted to view the plot upright
        },
        dragmode: 'turntable',
        hovermode: !1,  // Disable hover interactions
        displayModeBar: false
      }
    };

    Plotly.react('3d-plot', [tracePoints, ...traceLines], layout, { displayModeBar: false });
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
    <>
      <div className="flex flex-col items-center space-y-4" style={{ position: "relative", width: '100%', maxWidth: '640px', height: 'auto' }}>
        {isRecording || videoSource ? (
          <>
            <div style={{ position: "relative", width: "100%" }}>
              {videoSource ? (
                <video className="rounded-md" ref={videoRef} style={{ width: "100%", height: "auto" }} autoPlay loop muted />
              ) : (
                <Webcam className="rounded-md" ref={webcamRef} style={{ width: "100%", height: "auto" }} />
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
  //const sleep = ms => new Promise(r => setTimeout(r, ms));
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
  
  if(pose == "en guarde") {
    comparison = idealAngles[0];
  }
  else if(pose == "advance") {
    comparison = idealAngles[1];
  }
  else if(pose == "retreat") {
    comparison = idealAngles[2];
  }
  else if(pose == "lunge") {
    comparison = idealAngles[3];
  } 


    let query = `Please compare the user's angles ${JSON.stringify(userAngles)} with the ideal angles ${JSON.stringify(comparison)} for the ${userAngles.pose} position and provide a detailed analysis.`;
    const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
    dangerouslyAllowBrowser: true
  });
  // console.log('Test');
  // return ("success");


  const chatCompletion = await openai.chat.completions.create({
    messages: [
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
        content: query
      }
    ],
    model: 'gpt-4',
  });
  console.log(chatCompletion.choices[0].message.content);
  return chatCompletion.choices[0].message.content;

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