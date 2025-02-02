"use client";
import React from "react";
import { Carousel, Card } from "../ui/apple-cards-carousel";

const Showcase = () => {
	const cards = data.map((card, index) => (
		<Card key={card.src} card={card} index={index} />
	));

	return (
		<div id="features" className="w-full h-full py-20 bg-white">
			<h2 className="flex justify-center text-blue-600 text-4xl sm:text-5xl md:text-6xl mt-24 font-platypi font-semibold">
				Get to know Garde.
			</h2>
			<div className="mt-24">
				<Carousel items={cards} />
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
