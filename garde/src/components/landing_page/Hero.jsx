import { TextGenerateEffect } from "../ui/TextGenerateEffect";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCloudUploadAlt } from "react-icons/fa";
import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input";
import { useRouter } from "next/navigation";

// Sample images array - replace with your actual image paths
const sampleImages = [
	"/images/New_FencerPage.png",
	"/images/CoachPage.png",
	"/images/tournaments.png",
];

const Hero = () => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const router = useRouter();

	// Auto-advance images every 5 seconds
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentImageIndex((prev) => (prev + 1) % sampleImages.length);
		}, 5000);
		return () => clearInterval(timer);
	}, []);

	const placeholders = [
		"Show me every attack that I missed...",
		"Show me how to improve my timing...",
		"Analyze my footwork during this bout...",
		"How can I improve against this opponent...",
		"Ask me anything...",
	];

	const handleSubmit = (e) => {
		e.preventDefault();
		// Redirect to upload page or handle submission
		router.push("/fencer_page");
	};

	return (
		<div className="relative min-h-screen flex bg-[#faf9f5]">
			{/* Left side with light background */}
			<div className="w-full md:w-1/2 px-4 pt-32 md:pt-36 relative">
				<div className="max-w-xl mx-auto">
					{/* DO NOT USE NEXT/LINK FOR ROUTING TO SIGNIN PAGE */}
					<div className="flex gap-4 mb-16">
						<a
							href="/signin"
							className="px-6 py-2 bg-[#1a2b3b] text-white rounded-lg hover:bg-[#2c3e50] transition"
						>
							Login
						</a>
						<a
							href="/signin?isSignUp=true"
							className="px-6 py-2 border border-[#1a2b3b] text-[#1a2b3b] rounded-lg hover:bg-gray-50 transition"
						>
							Sign Up
						</a>
					</div>

					{/* Brand and Problem Statement */}
					<div className="space-y-6">
						<h1 className="text-6xl font-platypi text-[#1a2b3b]">Garde</h1>
						<TextGenerateEffect
							words="Smart Coaching, Smarter Fencing"
							className="text-3xl font-platypi text-[#2c3e50]"
						/>
						<p className="text-lg text-gray-600 max-w-lg">
							Elevate your fencing game with AI-powered analysis and
							personalized coaching. Get instant feedback and improve your
							technique.
						</p>
					</div>

					{/* Replace the Upload CTA Button with the new input */}
					<div className="mt-8">
						<PlaceholdersAndVanishInput
							placeholders={placeholders}
							onSubmit={handleSubmit}
						/>
					</div>

					{/* New Upload Button */}
					<div className="mt-4 flex flex-col items-center">
						<button
							className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
							onClick={handleSubmit}
							type="button"
						>
							<FaCloudUploadAlt className="text-xl" />
							<span>Upload Your Bout</span>
						</button>
					</div>
				</div>
			</div>

			{/* Right side with dark background */}
			<div className="hidden md:block w-1/2 bg-[#1a2b3b] relative rounded-l-lg">
				<div className="absolute inset-0 flex items-center justify-center p-8">
					<div className="w-full max-w-2xl">
						<AnimatePresence mode="wait">
							<motion.img
								key={currentImageIndex}
								src={sampleImages[currentImageIndex]}
								alt="Fencing sample"
								className="w-full h-auto rounded-xl shadow-2xl"
								initial={{ opacity: 0, x: 100 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -100 }}
								transition={{ duration: 0.5, ease: "easeInOut" }}
							/>
						</AnimatePresence>

						{/* Image navigation dots */}
						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
							{sampleImages.map((_, index) => (
								<button
									key={index}
									className={`w-2 h-2 rounded-full transition ${
										index === currentImageIndex ? "bg-white" : "bg-white/50"
									}`}
									onClick={() => setCurrentImageIndex(index)}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Hero;
