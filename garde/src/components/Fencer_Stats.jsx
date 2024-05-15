import React from 'react';
import Fencer_Canvas from './Fencer_Canvas';
import { calculateAngle, displayFeetDistance } from './Fencer_Canvas';
import '@mediapipe/pose';

const Fencer_Stats = (props) => {
     console.log('pose:', props.pose);
     const pose = props.pose || {};
     let leftElbAngle = "";
     let rightElbAngle = "";
     let leftKneeAngle = "";
     let rightKneeAngle = "";

     let feetDistance = "";
     let predictedPose = "";


     if (pose.keypoints && pose.keypoints.length >= 16) {
       leftElbAngle = Math.round(calculateAngle(pose.keypoints[11], pose.keypoints[13], pose.keypoints[15]));
       //console.log('angle:', angle); 
       rightElbAngle = Math.round(calculateAngle(pose.keypoints[12], pose.keypoints[14], pose.keypoints[16]));
       leftKneeAngle = Math.round(calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27]));
       rightKneeAngle = Math.round(calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28]));
       feetDistance = Math.round(displayFeetDistance(pose.keypoints).feetDistance);
       predictedPose = displayFeetDistance(pose.keypoints).predictedPose;
     }
     
     return (
     <> 
     <div className="rounded p-3 mb-2 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg flex justify-between" style={{ fontSize: '14px', color: 'white' }}>
          <div>
               <h4> Feet Distance </h4>
               <h4> {feetDistance} </h4>
          </div>
          <div>
               <h4> Predicted Pose </h4>
               <h4> {predictedPose} </h4>
          </div>
     </div>
     <div className="rounded p-6 mb-4 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg" style={{ fontSize: '16px', color: 'white' }}>
          <h4> Left elbow  </h4>
          <h4> {leftElbAngle} </h4>
     </div>
     <div className="rounded p-6 mb-4 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg" style={{ fontSize: '16px', color: 'white' }}>
          <h4> Right elbow  </h4>
          <h4> {rightElbAngle} </h4>
     </div>
     <div className="rounded p-6 mb-4 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg" style={{ fontSize: '16px', color: 'white' }}>
          <h4>  Right knee  </h4>
          <h4> {leftKneeAngle} </h4>
     </div>
     <div className="rounded p-6 mb-4 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg" style={{ fontSize: '16px', color: 'white' }}>
          <h4>  Right knee  </h4>
          <h4> {rightKneeAngle} </h4>
     </div>
     </>
     );
};
export default Fencer_Stats;