"use client";
import React from 'react';
import { OpenAIAPIFeedback } from './Fencer_Canvas';

const AI_Feedback = (props) => {
    let data = OpenAIAPIFeedback(props);
    return (
      <div className="rounded p-6 mb-4 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-lg" style={{ fontSize: '16px', color: 'white' }}>
        <h4> 
          {data} 
        </h4> 
      </div>
    );
  };

export default AI_Feedback;