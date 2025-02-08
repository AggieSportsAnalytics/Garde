"use client";
import React from "react";
import { FaLocationArrow } from "react-icons/fa6";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GoogleGeminiEffect } from "../ui/google-gemini-effect";

// Sample images array - replace with your actual image paths
const sampleImages = [
	"/images/New_FencerPage.png",
	"/images/CoachPage.png",
	"/images/tournaments.png",
];

const Hero = () => {
	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.3,
				delayChildren: 0.2
			}
		}
	};

	const buttonVariants = {
		hidden: { opacity: 0, y: 20 },
		show: { 
			opacity: 1, 
			y: 0,
			transition: {
				type: "spring",
				stiffness: 100,
				delay: 2
			}
		},
		hover: {
			scale: 1.05,
			transition: {
				type: "spring",
				stiffness: 400,
				damping: 10
			}
		},
		tap: {
			scale: 0.95
		}
	};

	const descriptionVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				duration: 0.5,
				delay: 1.5
			}
		}
	};

	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	// Auto-advance images every 5 seconds
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
			className="relative min-h-screen flex flex-col items-center justify-center bg-[#faf9f5] pt-8"
		>
			{/* Content container */}
			<motion.div 
				variants={containerVariants}
				className="flex flex-col items-center justify-center w-full max-w-4xl px-4 pt-8 md:pt-0"
			>
				{/* Brand and Problem Statement */}
				<div className="space-y-6 text-center">
					<div className="h-32">
						<h1 className="text-8xl md:text-9xl font-platypi text-[#1a2b3b]">Garde</h1>							
					</div>
					
					<div className="h-16">
						<TextGenerateEffect
							words="Smart Coaching, Smarter Fencing"
							className="text-3xl font-platypi text-[#2c3e50]"
						/>
					</div>

					<motion.p 
						variants={descriptionVariants}
						initial="hidden"
						animate="show"
						className="text-lg text-gray-600 max-w-lg mx-auto h-24 font-platypi font-extralight"
					>
						Elevate your fencing game with AI-powered analysis and
						personalized coaching. Get instant feedback and improve your
						technique.
					</motion.p>
				</div>

				{/* Upload CTA Button */}
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
			</motion.div>
		</motion.div>
	);
};

export default Hero;
