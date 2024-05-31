import React from 'react';
import Fencer_Canvas from './Fencer_Canvas';
import { calculateAngle, displayFeetDistance, calculateSpeed } from './Fencer_Canvas';
import "@mediapipe/pose";

const Fencer_Stats = (props) => {
     const uploadToMongo = async (pose) => {
          // console.log(pose);
        
          const response = await fetch('/api/uploadMongo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pose),
          })
        
          const result = await response.json();
          // console.log(result);
          
          return result.document
     };

     // console.log('pose:', props.pose);
     const pose = props.pose || {};
     let leftElbAngle = "";
     let rightElbAngle = "";
     let leftKneeAngle = "";
     let rightKneeAngle = "";
     let rightHipAngle = "";
     let leftHipAngle = "";
     let feetDistance = "";
     let predictedPose = "";
     let speed = "";

     if (pose.keypoints && pose.keypoints.length >= 16) {
       leftElbAngle = Math.round(calculateAngle(pose.keypoints[11], pose.keypoints[13], pose.keypoints[15]));
       //console.log('angle:', angle); 
       rightElbAngle = Math.round(calculateAngle(pose.keypoints[12], pose.keypoints[14], pose.keypoints[16]));
       leftHipAngle = Math.round(calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27]));
       rightHipAngle = Math.round(calculateAngle(pose.keypoints[12], pose.keypoints[24], pose.keypoints[26]));
       leftKneeAngle = Math.round(calculateAngle(pose.keypoints[11], pose.keypoints[23], pose.keypoints[25]));
       rightKneeAngle = Math.round(calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28]));
       feetDistance = Math.round(displayFeetDistance(pose.keypoints).feetDistance);
       predictedPose = displayFeetDistance(pose.keypoints).predictedPose;
       //11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28
       speed = Math.round(calculateSpeed(pose.keypoints).currentSpeed);
     }

     function calculateAccuracy(actualAngles, idealAngles) {
          const joints = ["elbow_left", "hip_left", "knee_left", "elbow_right", "hip_right", "knee_right"];
          
          let totalAccuracy = 0;
          
          joints.forEach(joint => {
            const actualAngle = actualAngles[joint];
            const idealAngle = idealAngles[joint];
            
            if (idealAngle !== undefined && actualAngle !== undefined) {
              const accuracy = 100 - (Math.abs(actualAngle - idealAngle) / idealAngle * 100);
              totalAccuracy += accuracy;
            }
          });
          
          return totalAccuracy / joints.length;
     }        

     const userAngles = {
          name: predictedPose,
          elbow_left: leftElbAngle,
          hip_left: leftHipAngle,
          knee_left: leftKneeAngle,
          elbow_right: rightElbAngle,
          hip_right: rightHipAngle,
          knee_right: rightKneeAngle
     }

     const idealAngles = [
          {
            "name": "en guarde",
            "elbow_left": 96,
            "hip_left": 117,
            "knee_left": 121,
            "elbow_right": 2,
            "hip_right": 170,
            "knee_right": 160
          },
          {
            "name": "advance",
            "elbow_left": 87,
            "hip_left": 126,
            "knee_left": 132,
            "elbow_right": 36,
            "hip_right": 170,
            "knee_right": 160
          },
          {
            "name": "retreat",
            "elbow_left": 90,
            "hip_left": 127,
            "knee_left": 144,
            "elbow_right": 8,
            "hip_right": 172,
            "knee_right": 170
          },
          {
            "name": "lunge",
            "elbow_left": 178,
            "hip_left": 84,
            "knee_left": 110,
            "elbow_right": 170,
            "hip_right": 151,
            "knee_right": 165
          }
     ];      

     if (props.pose && Date.now() - props.lastCalled >= 30000) {
          let chosen;
          if(predictedPose === "en guarde") { chosen = idealAngles[0]; }
          else if(predictedPose === "advance") { chosen = idealAngles[1]; }
          else if(predictedPose === "retreat") { chosen = idealAngles[2]; }
          else if(predictedPose === "lunge") { chosen = idealAngles[3]; }
          const accuracy = calculateAccuracy(chosen, userAngles);

          uploadToMongo({"accuracy": accuracy, "pose": predictedPose, "feet_distance": feetDistance, "left_elbow": leftElbAngle, "right_elbow": rightElbAngle, "right_hip": rightHipAngle, "left_hip": leftHipAngle, "left_knee": leftElbAngle, "right_knee": rightKneeAngle, "speed": speed});
          props.setLastCalled(Date.now());
     }
     
     return (
     <> 
     <div className="font-bold text-xl flex justify-center">
          Fencer Statistics
     </div>
     <div className="grid grid-rows-6 grid-cols-2 mt-10">
     
     <div className="rounded p-3 mb-2 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg w-[230px]" style={{ fontSize: '14px', color: 'white' }}>
          <h4> Predicted Pose (Rough) </h4>
          <h4> {predictedPose} </h4>
     </div>

     <div className="rounded p-3 mb-2 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg w-[230px]" style={{ fontSize: '14px', color: 'white' }}>
          <h4> Feet Distance: </h4>
          <h4> {feetDistance} </h4>
     </div>

     <div className="rounded p-6 mb-4 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg w-[230px]" style={{ fontSize: '16px', color: 'white' }}>
          <h4> Left elbow angle:  </h4>
          <h4> {leftElbAngle} </h4>
     </div>

     <div className="rounded p-6 mb-4 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg w-[230px]" style={{ fontSize: '16px', color: 'white' }}>
          <h4> Right elbow angle:  </h4>
          <h4> {rightElbAngle} </h4>
     </div>

     <div className="rounded p-6 mb-4 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg w-[230px]" style={{ fontSize: '16px', color: 'white' }}>
          <h4>  Right hip angle:  </h4>
          <h4> {rightHipAngle} </h4>
     </div>

     <div className="rounded p-6 mb-4 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg w-[230px]" style={{ fontSize: '16px', color: 'white' }}>
          <h4>  Left hip angle:  </h4>
          <h4> {leftHipAngle} </h4>
     </div>

     <div className="rounded p-6 mb-4 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg w-[230px]" style={{ fontSize: '16px', color: 'white' }}>
          <h4>  Left knee angle:  </h4>
          <h4> {leftKneeAngle} </h4>
     </div>

     <div className="rounded p-6 mb-4 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg w-[230px]" style={{ fontSize: '16px', color: 'white' }}>
          <h4>  Right knee angle:  </h4>
          <h4> {rightKneeAngle} </h4>
     </div>

     <div className="rounded p-6 mb-4 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg w-[230px]" style={{ fontSize: '16px', color: 'white' }}>
          <h4>  Speed:  </h4>
          <h4> {speed} </h4>
     </div>

     </div>
     </>
     
     );
};

export const GetAngles = (props) => {
     // console.log(props.pose);
     const pose = props.pose || {};
     let leftElbAngle = "";
     let rightElbAngle = "";
     let leftKneeAngle = "";
     let rightKneeAngle = "";
     let rightHipAngle = "";
     let leftHipAngle = "";
     let feetDistance = "";
     let predictedPose = "";
     let speed = "";

     if (pose.keypoints && pose.keypoints.length >= 16) {
       leftElbAngle = Math.round(calculateAngle(pose.keypoints[11], pose.keypoints[13], pose.keypoints[15]));
       //console.log('angle:', angle); 
       rightElbAngle = Math.round(calculateAngle(pose.keypoints[12], pose.keypoints[14], pose.keypoints[16]));
       leftHipAngle = Math.round(calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27]));
       rightHipAngle = Math.round(calculateAngle(pose.keypoints[12], pose.keypoints[24], pose.keypoints[26]));
       leftKneeAngle = Math.round(calculateAngle(pose.keypoints[11], pose.keypoints[23], pose.keypoints[25]));
       rightKneeAngle = Math.round(calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28]));
       feetDistance = Math.round(displayFeetDistance(pose.keypoints).feetDistance);
       predictedPose = displayFeetDistance(pose.keypoints).predictedPose;
       //11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28
       speed = Math.round(calculateSpeed(pose.keypoints).currentSpeed);
     }

     return {"pose": predictedPose, "feet_distance": feetDistance, "left_elbow": leftElbAngle, "right_elbow": rightElbAngle, "right_hip": rightHipAngle, "left_hip": leftHipAngle, "left_knee": leftElbAngle, "right_knee": rightKneeAngle, "speed": speed};
};

export default Fencer_Stats;