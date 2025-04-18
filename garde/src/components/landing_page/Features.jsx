import React from "react";
import "../../app/globals.css";
import { motion } from "framer-motion";

// This component has been disabled as its content is already included in the Hero component
const Features = () => {
	return null; // Return null instead of duplicating the "See GSX-a1 in action" section
};

// Previous implementation (commented out to avoid duplication)
/*
const Features = () => {
	return (
		<div className="max-w-7xl mx-auto px-4 my-8">
			<div className="flex flex-col md:flex-row items-center justify-between gap-8">
				{/* Left Side: Action Text */}
				<div className="md:w-1/2 text-center md:text-left">
					<motion.h2
						className="text-4xl sm:text-5xl md:text-6xl font-platypi text-[#1a2b3b]"
						initial={{ opacity: 0, x: -50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 1, delay: 0.5 }}
					>
						See GSX-a1 in action
					</motion.h2>
				</div>
				{/* Right Side: Fencing Video */}
				<div className="md:w-1/2">
					<motion.video
						// mp4 codec not supported on mobile, weird, but use this webm
						src="/images/fencing-vid.webm"
						autoPlay
						loop
						muted
						playsInline
						className="w-full h-auto rounded-lg shadow-lg"
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 1 }}
					/>
				</div>
			</div>
		</div>
	);
};
*/

export default Features;
