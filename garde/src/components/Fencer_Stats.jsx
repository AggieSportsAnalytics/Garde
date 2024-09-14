import React, { useEffect, useState, useRef } from 'react';
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
  const [predictedPose, setPredictedPose] = useState('onguard');
  const [speed, setSpeed] = useState(null);
  const [frontFootState, setFrontFootState] = useState(null);
  const [facingDirection, setFacingDirection] = useState(null);
  
  const prevPoseRef = useRef(null);
  const stateBufferRef = useRef([]);
  let speedHistory = [];

  const smoothSpeed = (currentSpeed) => {
    const smoothingFactor = 0.7;
    if (speedHistory.length > 0) {
      const smoothedSpeed = smoothingFactor * currentSpeed + (1 - smoothingFactor) * speedHistory[speedHistory.length - 1];
      speedHistory.push(smoothedSpeed);
      if (speedHistory.length > 5) speedHistory.shift();
      return smoothedSpeed;
    } else {
      speedHistory.push(currentSpeed);
      return currentSpeed;
    }
  };
  
  const determineFacingDirection = (pose) => {
    const nose = pose.keypoints[0];
    const leftHip = pose.keypoints[23];
    const rightHip = pose.keypoints[24];

    const midHipX = (leftHip.x + rightHip.x) / 2;

    if (nose.x < midHipX) {
      // If the nose is to the left of the mid-hip, the user is facing right
      return 'facingLeft';
    } else if (nose.x > midHipX) {
      // If the nose is to the right of the mid-hip, the user is facing left
      return 'facingRight';
    } else {
      // If the nose and mid-hip are aligned, the user is facing forward or backward
      return null;
    }
  };
  
  

  const determineFrontFoot = (leftAnkleX, rightAnkleX, facingDirection) => {
    if (facingDirection === 'facingLeft') {
      return leftAnkleX < rightAnkleX ? 'left' : 'right';
    } else if (facingDirection === 'facingRight') {
      return leftAnkleX > rightAnkleX ? 'left' : 'right';
    } else {
      return null; // Can't determine
    }
  };
  

  const detectMovement = (currentPose, prevPose, facingDirection) => {
    if (!currentPose || !prevPose || !facingDirection) return 'static';
  
    const currentLeftAnkle = currentPose.keypoints[27];
    const currentRightAnkle = currentPose.keypoints[28];
    const prevLeftAnkle = prevPose.keypoints[27];
    const prevRightAnkle = prevPose.keypoints[28];
  
    const averageMovement = ((currentLeftAnkle.x + currentRightAnkle.x) / 2) - ((prevLeftAnkle.x + prevRightAnkle.x) / 2);
    const movementThreshold = 0.5; // Adjust this value based on your needs
  
    console.log(`Average Movement: ${averageMovement}`);
    console.log(`Facing Direction: ${facingDirection}`);
  
    if (Math.abs(averageMovement) > movementThreshold) {
      if ((facingDirection === 'facingRight' && averageMovement > 0) || (facingDirection === 'facingLeft' && averageMovement < 0)) {
        return 'advance';
      } else {
        return 'retreat';
      }
    }
    return 'static';
  };
  

  const stabilizeState = (newState) => {
    const bufferSize = 10; // Increased buffer size for more stability
    const buffer = stateBufferRef.current;

    buffer.push(newState);
    if (buffer.length > bufferSize) {
      buffer.shift();
    }

    const stateCounts = buffer.reduce((acc, state) => {
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    // Require a significant majority for state change
    const threshold = bufferSize * 0.7;
    for (const [state, count] of Object.entries(stateCounts)) {
      if (count >= threshold) {
        return state;
      }
    }

    // If no clear majority, return the most recent stable state
    return buffer[buffer.length - 1];
  };

  const predictPose = (pose, feetDistance, shoulderWidth) => {
    if (!pose || !pose.keypoints) return 'onguard';
  
    const rightKneeAngle = calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28]);
    const leftKneeAngle = calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27]);
    const swordArmAngle = calculateAngle(pose.keypoints[11], pose.keypoints[13], pose.keypoints[15]);
    const nonSwordArmAngle = calculateAngle(pose.keypoints[12], pose.keypoints[14], pose.keypoints[16]);

    const instantaneousMovement = detectMovement(pose, prevPoseRef.current, facingDirection);

    // Lunge Detection
    const lungeKneeAngleThreshold = 120;
    const lungeArmAngleThreshold = 140;
    const lungeDistanceThreshold = shoulderWidth * 1.8;
  
    if (
      ((rightKneeAngle >= 80 && rightKneeAngle <= lungeKneeAngleThreshold && leftKneeAngle > 160) ||
      (leftKneeAngle >= 80 && leftKneeAngle <= lungeKneeAngleThreshold && rightKneeAngle > 160)) &&
      swordArmAngle > lungeArmAngleThreshold &&
      nonSwordArmAngle > lungeArmAngleThreshold &&
      feetDistance > lungeDistanceThreshold
    ) {
      return 'lunge';
    }
  
    // En Garde Detection
    const enGardeKneeAngleThreshold = 150;
    const enGardeFeetDistanceThreshold = shoulderWidth * 1.2;
  
    if (
      rightKneeAngle <= enGardeKneeAngleThreshold &&
      leftKneeAngle <= enGardeKneeAngleThreshold &&
      feetDistance <= enGardeFeetDistanceThreshold &&
      swordArmAngle < lungeArmAngleThreshold &&
      nonSwordArmAngle < lungeArmAngleThreshold &&
      instantaneousMovement === 'static'
    ) {
      return 'onguard';
    }
  
    // Return the instantaneous movement if it's not a lunge or on guard
    return instantaneousMovement !== 'static' ? instantaneousMovement : 'onguard';
  };

  useEffect(() => {
    if (pose && pose.keypoints) {
      if (!facingDirection) {
        const direction = determineFacingDirection(pose);
        if (direction) {
          setFacingDirection(direction);
        }
      }

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

        if (pose.keypoints.length >= 33) {
          setLeftElbAngle(Math.round(calculateAngle(pose.keypoints[11], pose.keypoints[13], pose.keypoints[15])));
          setRightElbAngle(Math.round(calculateAngle(pose.keypoints[12], pose.keypoints[14], pose.keypoints[16])));
          setLeftHipAngle(Math.round(calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27])));
          setRightHipAngle(Math.round(calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28])));
          setLeftKneeAngle(Math.round(calculateAngle(pose.keypoints[23], pose.keypoints[25], pose.keypoints[27])));
          setRightKneeAngle(Math.round(calculateAngle(pose.keypoints[24], pose.keypoints[26], pose.keypoints[28])));

          const feetDistancePixels = displayFeetDistance(pose.keypoints).feetDistance;
          const feetDistanceMeters = convertPixelsToMeters(feetDistancePixels, height, fencerHeightPixels).toFixed(2);
          setFeetDistanceState(feetDistanceMeters);

          const instantaneousPose = predictPose(pose, feetDistance, shoulderWidth);
          const stablePose = stabilizeState(instantaneousPose);
          setPredictedPose(stablePose);

          setSpeed(Math.round(smoothSpeed(calculateSpeed(pose.keypoints).currentSpeed)));

          // Update the previous pose reference
          prevPoseRef.current = pose;
        }
      }
    }
  }, [pose, height, setFeetDistance, setShoulderWidth]);

  useEffect(() => {
    if (feetDistanceState) {
      setFeetDistance(feetDistanceState);
    }
  }, [feetDistanceState, setFeetDistance]);

  useEffect(() => {
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
  }, [pose, lastCalled, setLastCalled, predictedPose, feetDistanceState, leftElbAngle, rightElbAngle, rightHipAngle, leftHipAngle, leftKneeAngle, rightKneeAngle, speed, setAiFeedback]);

  return (
    <CardContainer className="inter-var w-full h-full bg-none">
      <CardBody className={`relative group/card ${darkMode ? 'bg-none text-white' : 'bg-none text-black'} w-full h-full rounded-xl p-8 space-y-4 border ${darkMode ? 'border-gray-700' : 'border-gray-300'} flex flex-col justify-center items-center`} >
        <CardItem translateZ="50" className="text-xl font-bold mb-4">
          Fencer Statistics
        </CardItem>
        <div className="grid grid-rows-4 grid-cols-2 gap-4">
          {[
            { label: "Predicted Pose", value: predictedPose },
            { label: "Feet Distance (m)", value: feetDistanceState || 'N/A' },
            { label: "Left Elbow Angle", value: leftElbAngle },
            { label: "Right Elbow Angle", value: rightElbAngle },
            { label: "Right Hip Angle", value: rightHipAngle },
            { label: "Left Hip Angle", value: leftHipAngle },
            { label: "Left Knee Angle", value: leftKneeAngle },
            { label: "Right Knee Angle", value: rightKneeAngle },
            { label: "Speed", value: speed },
            { label: "Front Foot", value: frontFootState || 'N/A' }
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
