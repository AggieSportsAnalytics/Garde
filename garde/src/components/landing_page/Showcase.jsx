"use client";
import React from "react";
import { motion } from "framer-motion";

const Showcase = () => {
	return (
		<div id="features" className="w-full h-full pt-20 pb-10">
			<div className="max-w-7xl mx-auto px-4">
				<div className="flex flex-col md:flex-row items-center justify-between gap-8">
					{/* Left Side: Features Grid */}
					<div className="md:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Feature Card: Advanced Reasoning */}
						<div className="flex flex-col items-center text-center p-4 border rounded-lg shadow">
							<img
								src="/images/advanced-reasoning.png"
								alt="Advanced Reasoning"
								className="w-20 h-20 object-contain"
							/>
							<h3 className="mt-2 text-xl font-bold text-[#1a2b3b]">
								Advanced Reasoning
							</h3>
							<p className="mt-2 text-sm text-gray-600">
								Empowers tactical decisions with intelligent data analysis and predictive algorithms.
							</p>
						</div>
						{/* Feature Card: Vision Analysis */}
						<div className="flex flex-col items-center text-center p-4 border rounded-lg shadow">
							<img
								src="/images/vision.png"
								alt="Vision Analysis"
								className="w-20 h-20 object-contain"
							/>
							<h3 className="mt-2 text-xl font-bold text-[#1a2b3b]">
								Vision Analysis
							</h3>
							<p className="mt-2 text-sm text-gray-600">
								Provides real-time analysis to capture critical insights from every movement.
							</p>
						</div>
						{/* Feature Card: Speech-to-Speech */}
						<div className="flex flex-col items-center text-center p-4 border rounded-lg shadow">
							<img
								src="/images/speech.jpg"
								alt="Speech-to-Speech"
								className="w-20 h-20 object-contain"
							/>
							<h3 className="mt-2 text-xl font-bold text-[#1a2b3b]">
								Speech-to-Speech
							</h3>
							<p className="mt-2 text-sm text-gray-600">
								Enables interactive voice feedback to guide your performance dynamically.
							</p>
						</div>
						{/* Feature Card: Pose Mapping */}
						<div className="flex flex-col items-center text-center p-4 border rounded-lg shadow">
							<img
								src="/images/pose-mapping.jpg"
								alt="Pose Mapping"
								className="w-20 h-20 object-contain"
							/>
							<h3 className="mt-2 text-xl font-bold text-[#1a2b3b]">
								Pose Mapping
							</h3>
							<p className="mt-2 text-sm text-gray-600">
								Tracks and maps body movements to optimize your fencing stance and form.
							</p>
						</div>
					</div>
					{/* Right Side: Introduction to GSX-a1 */}
					<div className="md:w-1/2 text-center md:text-left gap-3">
						<h2 className="text-[#1a2b3b] text-4xl sm:text-5xl md:text-6xl font-platypi font-semibold flex justify-center">
							Meet GSX-a1
						</h2>
						<h2 className="text-[#1a2b3b] text-lg sm:text-5xl md:text-xl mt-10 font-platypi">
							Generative Sports Expert Alpha 1 is a state-of-the-art AI assistant built by Garde and trained on
							specialized fencing datasets to help you analyze your bouts and perform at your best.
						</h2>
					</div>
				</div>
			</div>
		</div>
	);
};

// const DummyContent = () => {
//   return (
//     <>
//       {[...new Array(3).fill(1)].map((_, index) => {
//         return (
//           <div
//             key={"dummy-content" + index}
//             className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
//           >
//             <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
//               <span className="font-bold text-neutral-700 dark:text-neutral-200">
//                 The first rule of Apple club is that you boast about Apple club.
//               </span>{" "}
//               Keep a journal, quickly jot down a grocery list, and take amazing
//               class notes. Want to convert those notes to text? No problem.
//               Langotiya jeetu ka mara hua yaar is ready to capture every
//               thought.
//             </p>
//             <Image
//               src="https://assets.aceternity.com/macbook.png"
//               alt="Macbook mockup from Aceternity UI"
//               height="500"
//               width="500"
//               className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
//             />
//           </div>
//         );
//       })}
//     </>
//   );
// };

const data = [
	{
		category: "Fencers",
		title: "Improve Your Fencing with Real-Time Feedback and Insights",
		src: "/images/fencer.jpg",
		// content: <DummyContent />,
	},
	{
		category: "Coaches",
		title: "Streamline Coaching with Video Dashboards and Analytics",
		src: "/images/fencing-coach.png",
		// content: <DummyContent />,
	},
	{
		category: "Artificial Intelligence",
		title: "AI-Powered Feedback and Pose Detection",
		src: "/images/ArtificialIntelligence.jpg",
		// content: <DummyContent />,
	},
	{
		category: "Backed by the best",
		title: "Built with the help of Team USA Coaches and Olympic Medallists",
		src: "/images/fencer-play.jpg",
		// content: <DummyContent />,
	},
];

export default Showcase;
