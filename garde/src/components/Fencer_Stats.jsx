import React from 'react';
import Fencer_Canvas from './Fencer_Canvas';
import { calculateAngle, displayFeetDistance, calculateSpeed } from './Fencer_Canvas';
import { OpenAIAPIFeedback } from './Fencer_Canvas';
import "@mediapipe/pose";
const Fencer_Stats = (props, setLastCalled, setAiFeedback) => {

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
     let result;
     

     if (props.pose && Date.now() - props.lastCalled >= 30000) {
          props.setLastCalled(Date.now());
          OpenAIAPIFeedback({ "pose": predictedPose, "feet_distance": feetDistance, "left_elbow": leftElbAngle, "right_elbow": rightElbAngle, "right_hip": rightHipAngle, "left_hip": leftHipAngle, "left_knee": leftKneeAngle, "right_knee": rightKneeAngle, "speed": speed})
          .then(result => {
               props.setAiFeedback(result);
          });
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

export const GetUserData = (props) => {
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

     return {"pose": predictedPose, "feet-distance": feetDistance, "left-elbow": leftElbAngle, "right-elbow": rightElbAngle, "right-hip": rightHipAngle, "left-hip": leftHipAngle, "left-knee": leftKneeAngle, "right-knee": rightKneeAngle, "speed": speed};
};
export default Fencer_Stats;