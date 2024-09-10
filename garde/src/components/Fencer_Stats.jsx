import React, { useEffect, useState } from 'react';
import { calculateAngle, displayFeetDistance, calculateSpeed, convertPixelsToMeters } from './Fencer_Canvas';
import { OpenAIAPIFeedback } from './Fencer_Canvas';
import "@mediapipe/pose";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";

const Fencer_Stats = ({ pose, lastCalled, setLastCalled, setAiFeedback, height, setFeetDistance, setShoulderWidth, darkMode }) => {
  const [feetDistanceState, setFeetDistanceState] = useState(null);
  const [leftElbAngle, setLeftElbAngle] = useState(null);
  const [rightElbAngle, setRightElbAngle] = useState(null);
  const [leftHipAngle, setLeftHipAngle] = useState(null);
  const [rightHipAngle, setRightHipAngle] = useState(null);
  const [leftKneeAngle, setLeftKneeAngle] = useState(null);
  const [rightKneeAngle, setRightKneeAngle] = useState(null);
  const [predictedPose, setPredictedPose] = useState(null);
  const [speed, setSpeed] = useState(null);

  let speedHistory = [];

  const smoothSpeed = (currentSpeed) => {
    const smoothingFactor = 0.7;
    if (speedHistory.length > 0) {
      const smoothedSpeed = smoothingFactor * currentSpeed + (1 - smoothingFactor) * speedHistory[speedHistory.length - 1];
      speedHistory.push(smoothedSpeed);
      if (speedHistory.length > 5) speedHistory.shift(); // Limit history length
      return smoothedSpeed;
    } else {
      speedHistory.push(currentSpeed);
      return currentSpeed;
    }
  };

  const predictPose = (pose, feetDistance, shoulderWidth) => {
    if (!pose || !pose.keypoints) return null;

    
  
    const rightKneeAngle = calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28]);
    const leftKneeAngle = calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27]);
    const swordArmAngle = calculateAngle(pose.keypoints[11], pose.keypoints[13], pose.keypoints[15]);
    const nonSwordArmAngle = calculateAngle(pose.keypoints[12], pose.keypoints[14], pose.keypoints[16]);
    const speed = smoothSpeed(calculateSpeed(pose.keypoints).currentSpeed);
  
    // Improved Lunge Detection
    const lungeKneeAngleThreshold = 120; // more stringent for deep bend
    const lungeArmAngleThreshold = 140; // adjusted for extension
    const lungeDistanceThreshold = shoulderWidth * 1.8; // slightly reduced threshold
  
    if (
      ((rightKneeAngle >= 80 && rightKneeAngle <= lungeKneeAngleThreshold && leftKneeAngle > 160) ||
      (leftKneeAngle >= 80 && leftKneeAngle <= lungeKneeAngleThreshold && rightKneeAngle > 160)) &&
      swordArmAngle > lungeArmAngleThreshold &&
      nonSwordArmAngle > lungeArmAngleThreshold &&
      feetDistance > lungeDistanceThreshold
    ) {
      return 'lunge';
    }
  
    // Improved En Garde Detection
    const enGardeKneeAngleThreshold = 150; // both knees moderately bent
    const enGardeFeetDistanceThreshold = shoulderWidth * 1.2;
  
    if (
      rightKneeAngle <= enGardeKneeAngleThreshold &&
      leftKneeAngle <= enGardeKneeAngleThreshold &&
      feetDistance <= enGardeFeetDistanceThreshold &&
      swordArmAngle < lungeArmAngleThreshold &&
      nonSwordArmAngle < lungeArmAngleThreshold
    ) {
      return 'onguard';
    }
  
    // Check for advance and retreat poses
    const advanceRetreatSpeedThreshold = 0.2; // Lower threshold for detecting movement
    const advanceRetreatDistanceThreshold = shoulderWidth * 1.3;
  
    if (speed > advanceRetreatSpeedThreshold && feetDistance > advanceRetreatDistanceThreshold) {
      return 'advance';
    } else if (speed < -advanceRetreatSpeedThreshold && feetDistance > advanceRetreatDistanceThreshold) {
      return 'retreat';
    }
  
    return 'onguard'; // Default to onguard if no other condition is met
  };
  

  useEffect(() => {
    if (pose && pose.keypoints) {
      const rightAnkle = pose.keypoints[32];
      const leftAnkle = pose.keypoints[31];
      const rightShoulder = pose.keypoints[12];
      const leftShoulder = pose.keypoints[11];
      const head = pose.keypoints[0];
      const foot = pose.keypoints[29];

      if (rightAnkle && leftAnkle && rightShoulder && leftShoulder && head && foot) {
        const fencerHeightPixels = Math.abs(head.y - foot.y);
        const pixelToMeterRatio = height / fencerHeightPixels;

        const feetDistance = Math.abs(rightAnkle.x - leftAnkle.x) * pixelToMeterRatio;
        const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x) * pixelToMeterRatio;

        setFeetDistance(feetDistance);
        setShoulderWidth(shoulderWidth);

        if (pose.keypoints.length >= 16) {
          setLeftElbAngle(Math.round(calculateAngle(pose.keypoints[11], pose.keypoints[13], pose.keypoints[15])));
          setRightElbAngle(Math.round(calculateAngle(pose.keypoints[12], pose.keypoints[14], pose.keypoints[16])));
          setLeftHipAngle(Math.round(calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27])));
          setRightHipAngle(Math.round(calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28])));
          setLeftKneeAngle(Math.round(calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27])));
          setRightKneeAngle(Math.round(calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28])));

          const feetDistancePixels = displayFeetDistance(pose.keypoints).feetDistance;
          const feetDistanceMeters = convertPixelsToMeters(feetDistancePixels, height, fencerHeightPixels).toFixed(2);
          setFeetDistanceState(feetDistanceMeters);

          const predictedPose = predictPose(pose, feetDistance, shoulderWidth);
          setPredictedPose(predictedPose);
          setSpeed(Math.round(calculateSpeed(pose.keypoints).currentSpeed));
        }
      }
    }
  }, [pose, height, setFeetDistance, setShoulderWidth]);

  useEffect(() => {
    if (feetDistanceState) {
      setFeetDistance(feetDistanceState);
    }
  }, [feetDistanceState, setFeetDistance]);

  if (pose && Date.now() - lastCalled >= 30000) {
    setLastCalled(Date.now());
    OpenAIAPIFeedback({
      pose: predictedPose,
      feet_distance: feetDistanceState,
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
    <CardContainer className="inter-var w-full h-full bg-none">
      <CardBody className={`relative group/card ${darkMode ? 'bg-none text-white' : 'bg-none text-black'} w-full h-full rounded-xl p-8 space-y-4 border ${darkMode ? 'border-gray-700' : 'border-gray-300'} flex flex-col justify-center items-center`} >
        <CardItem translateZ="50" className="text-xl font-bold mb-4">
          Fencer Statistics
        </CardItem>
        <div className="grid grid-rows-4 grid-cols-2 gap-4">
          {[
            { label: "Predicted Pose (Rough)", value: predictedPose },
            { label: "Feet Distance (m):", value: feetDistanceState || 'N/A' },
            { label: "Left Elbow Angle:", value: leftElbAngle },
            { label: "Right Elbow Angle:", value: rightElbAngle },
            { label: "Right Hip Angle:", value: rightHipAngle },
            { label: "Left Hip Angle:", value: leftHipAngle },
            { label: "Left Knee Angle:", value: leftKneeAngle },
            { label: "Right Knee Angle:", value: rightKneeAngle },
            { label: "Speed:", value: speed }
          ].map((item, index) => (
            <CardItem key={index} translateZ="60" className={`rounded p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'} border ${darkMode ? 'border-gray-700' : 'border-gray-300'} shadow-lg w-[230px]`} style={{ paddingBottom: '35px' }}>
              <h4>{item.label}</h4>
              <h4>{item.value}</h4>
            </CardItem>
          ))}
        </div>
      </CardBody>
    </CardContainer>
  );
};

export default Fencer_Stats;