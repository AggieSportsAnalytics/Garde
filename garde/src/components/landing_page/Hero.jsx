"use client";
import React, { useState, useEffect } from "react";
import { FaLocationArrow } from "react-icons/fa6";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Sample images array - replace with your actual image paths
const sampleImages = [
	"/images/New_FencerPage.png",
	"/images/CoachPage.png",
	"/images/tournaments.png",
];

// Variants for the image transition
const imageVariants = {
	initial: { opacity: 0, scale: 0.8 },
	animate: { opacity: 1, scale: 1, transition: { duration: 1 } },
	exit: { opacity: 0, scale: 1.2, transition: { duration: 1 } },
};

const Hero = () => {
	// Variants for overall animations
	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.3,
				delayChildren: 0.2,
			},
		},
	};

	const buttonVariants = {
		hidden: { opacity: 0, y: 20 },
		show: { 
			opacity: 1, 
			y: 0,
			transition: {
				type: "spring",
				stiffness: 100,
				delay: 2,
			},
		},
		hover: {
			scale: 1.05,
			transition: {
				type: "spring",
				stiffness: 400,
				damping: 10,
			},
		},
		tap: { scale: 0.95 },
	};

	const descriptionVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				duration: 0.5,
				delay: 1.5,
			},
		},
	};

	// Auto-advance sample images every 5 seconds
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentImageIndex((prev) => (prev + 1) % sampleImages.length);
		}, 5000);
		return () => clearInterval(timer);
	}, []);

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="show"
			className="relative min-h-screen bg-[#faf9f5] pt-8"
		>
			<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
				{/* Left Side: Current Page Content */}
				<div className="md:w-1/2 flex flex-col items-center text-center">
					<div className="space-y-6">
						{/* Garde Logo and Title */}
						<div className="flex justify-center flex-row gap-3 items-center">
							<motion.img
								src="/images/garde-square.png"
								alt="Garde Logo"
								className="w-10 h-10"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5 }}
							/>
							<motion.h1
								className="flex text-3xl md:text-3xl font-platypi text-[#1a2b3b]"
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3, duration: 0.5 }}
							>
								Garde
							</motion.h1>
						</div>
						<div className="h-32">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5, duration: 1 }}
								className="text-5xl font-platypi text-[#2c3e50]"
							>
								Smart Coaching,<br />Smarter Fencing
							</motion.div>
						</div>
						<motion.p
							variants={descriptionVariants}
							initial="hidden"
							animate="show"
							className="text-lg text-gray-600 max-w-lg font-platypi font-extralight"
						>
							Elevate your fencing game with AI-powered analysis and personalized coaching.
							Get instant feedback and improve your technique.
						</motion.p>
					</div>
					<motion.div
						variants={buttonVariants}
						initial="hidden"
						animate="show"
						whileHover="hover"
						whileTap="tap"
						className="mt-6"
					>
						<Link href="/upload">
							<motion.button
								className="group relative px-8 py-4 bg-[#1a2b3b] text-white rounded-lg hover:bg-[#2c3e50] transition flex items-center gap-3 text-lg overflow-hidden"
							>
								<span className="absolute inset-0 border-2 border-transparent group-hover:border-white transition-all duration-300"></span>
								<span className="relative">Get Started Now</span>
								<motion.div
									initial={{ x: 0 }}
									whileHover={{ x: 5 }}
									transition={{ type: "spring", stiffness: 200 }}
								>
									<FaLocationArrow className="transition" />
								</motion.div>
							</motion.button>
						</Link>
					</motion.div>
				</div>
				{/* Right Side: Sample Images with Blue Background */}
				<div className="md:w-1/2 mt-8 md:mt-0 flex justify-center items-center bg-cyan-950 p-8 rounded-lg">
					<AnimatePresence mode="wait">
						<motion.img
							key={sampleImages[currentImageIndex]}
							src={sampleImages[currentImageIndex]}
							alt="Sample Visual"
							className="object-cover rounded-lg shadow-lg"
							variants={imageVariants}
							initial="initial"
							animate="animate"
							exit="exit"
						/>
					</AnimatePresence>
				</div>
			</div>
		</motion.div>
	);
};

export default Hero;
