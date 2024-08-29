import React from 'react';
import { calculateAngle, displayFeetDistance, calculateSpeed } from './Fencer_Canvas';
import { OpenAIAPIFeedback } from './Fencer_Canvas';
import "@mediapipe/pose";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";

const Fencer_Stats = ({ pose, height, lastCalled, setLastCalled, setAiFeedback }) => {
  let leftElbAngle = "";
  let rightElbAngle = "";
  let leftKneeAngle = "";
  let rightKneeAngle = "";
  let rightHipAngle = "";
  let leftHipAngle = "";
  let feetDistance = "";
  let predictedPose = "";
  let speed = "";

  const convertPixelsToMeters = (pixels, fencerHeightMeters, fencerHeightPixels) => {
    if (!fencerHeightMeters || !fencerHeightPixels) return null;
    const pixelToMeterRatio = fencerHeightMeters / fencerHeightPixels;
    return pixels * pixelToMeterRatio;
  };

  if (pose?.keypoints?.length >= 16) {
    leftElbAngle = Math.round(calculateAngle(pose.keypoints[11], pose.keypoints[13], pose.keypoints[15]));
    rightElbAngle = Math.round(calculateAngle(pose.keypoints[12], pose.keypoints[14], pose.keypoints[16]));
    leftHipAngle = Math.round(calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27]));
    rightHipAngle = Math.round(calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28]));
    leftKneeAngle = Math.round(calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27]));
    rightKneeAngle = Math.round(calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28]));

    const head = pose.keypoints[0];
    const foot = pose.keypoints[29];
    const fencerHeightPixels = Math.abs(head.y - foot.y);

    const feetDistancePixels = displayFeetDistance(pose.keypoints).feetDistance;
    feetDistance = convertPixelsToMeters(feetDistancePixels, height, fencerHeightPixels)?.toFixed(2);

    predictedPose = displayFeetDistance(pose.keypoints).predictedPose;
    speed = Math.round(calculateSpeed(pose.keypoints).currentSpeed);
  }

  if (pose && Date.now() - lastCalled >= 30000) {
    setLastCalled(Date.now());
    OpenAIAPIFeedback({
      pose: predictedPose,
      feet_distance: feetDistance,
      left_elbow: leftElbAngle,
      right_elbow: rightElbAngle,
      right_hip: rightHipAngle,
      left_hip: leftHipAngle,
      left_knee: leftKneeAngle,
      right_knee: rightKneeAngle,
      speed: speed
    }).then(result => {
      setAiFeedback(result);
    });
  }

  return (
    <CardContainer className="inter-var" style={{ backgroundColor: 'transparent'}}>
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[35rem] h-auto rounded-xl p-8 space-y-4 border"> {/* Reduced space-y */}
        <CardItem translateZ="50" className="text-xl font-bold text-neutral-600 dark:text-white mb-4">
          Fencer Statistics
        </CardItem>
        <div className="grid grid-rows-4 grid-cols-2 gap-4"> {/* Adjusted grid rows */}
          <CardItem translateZ="60" className="rounded p-4 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg w-[230px] text-white">
            <h4>Predicted Pose (Rough)</h4>
            <h4>{predictedPose}</h4>
          </CardItem>
          <CardItem translateZ="60" className="rounded p-4 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg w-[230px] text-white">
            <h4>Feet Distance (m):</h4>
            <h4>{feetDistance || 'N/A'}</h4>
          </CardItem>
          <CardItem translateZ="60" className="rounded p-4 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg w-[230px] text-white">
            <h4>Left Elbow Angle:</h4>
            <h4>{leftElbAngle}</h4>
          </CardItem>
          <CardItem translateZ="60" className="rounded p-4 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg w-[230px] text-white">
            <h4>Right Elbow Angle:</h4>
            <h4>{rightElbAngle}</h4>
          </CardItem>
          <CardItem translateZ="60" className="rounded p-4 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg w-[230px] text-white">
            <h4>Right Hip Angle:</h4>
            <h4>{rightHipAngle}</h4>
          </CardItem>
          <CardItem translateZ="60" className="rounded p-4 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg w-[230px] text-white">
            <h4>Left Hip Angle:</h4>
            <h4>{leftHipAngle}</h4>
          </CardItem>
          <CardItem translateZ="60" className="rounded p-4 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg w-[230px] text-white">
            <h4>Left Knee Angle:</h4>
            <h4>{leftKneeAngle}</h4>
          </CardItem>
          <CardItem translateZ="60" className="rounded p-4 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg w-[230px] text-white">
            <h4>Right Knee Angle:</h4>
            <h4>{rightKneeAngle}</h4>
          </CardItem>
          <CardItem translateZ="60" className="rounded p-4 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg w-[230px] text-white">
            <h4>Speed:</h4>
            <h4>{speed}</h4>
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
};

export default Fencer_Stats;
