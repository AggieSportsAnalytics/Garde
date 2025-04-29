import { TextGenerateEffect } from "../ui/TextGenerateEffect";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlayCircle } from "react-icons/fa";
import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ContainerScroll } from "../ui/container-scroll-animation";

// Sample images array - replace with your actual image paths
const sampleImages = [
	"/images/New_FencerPage.png",
	"/images/CoachPage.png",
	"/images/tournaments.png",
];

// Background GIFs array
const backgroundGifs = [
	"/images/runners.gif",
	"/images/basketball.gif",
	"/images/tennis.gif",
	"/images/swimmer.gif",
];

// Feature cards data
const featureCards = [
	{
		title: "Advanced Reasoning",
		description:
			"Turns raw stats into winning tactics with predictive algorithms.",
		icon: "/images/advanced-reasoning.png",
	},
	{
		title: "Vision Analysis",
		description:
			"Breaks down every movement frame-by-frame to surface critical insights.",
		icon: "/images/vision.png",
	},
	{
		title: "Speech-to-Speech",
		description:
			"Gives live, conversational feedback while you practice—no screens needed.",
		icon: "/images/speech.jpg",
	},
	{
		title: "Pose Mapping",
		description:
			"Tracks and maps body mechanics across any sport to optimize form and reduce injury risk.",
		icon: "/images/pose-mapping.jpg",
	},
];

// Pre-calculate fixed opacity values to avoid hydration issues
const dotOpacities = Array(25)
	.fill()
	.map(() =>
		Array(6)
			.fill()
			.map(() => 0.3),
	);
// Pre-calculate fixed delays to avoid hydration issues
const dotDelays = Array(25)
	.fill()
	.map((_, i) =>
		Array(6)
			.fill()
			.map((_, j) => 0.1 + 0.2 * ((i * 6 + j) / 150)),
	);

const Hero = () => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [currentGifIndex, setCurrentGifIndex] = useState(0);
	const router = useRouter();
	const [boxAnimationComplete, setBoxAnimationComplete] = useState(false);
	const [dotAnimationStarted, setDotAnimationStarted] = useState(false);
	const [glowAnimationStarted, setGlowAnimationStarted] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const timerRef = useRef(null);

	// Set isClient to true on mount
	useEffect(() => {
		setIsClient(true);

		// Clear timer on unmount
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, []);

	// App preview images rotation
	useEffect(() => {
		if (!isClient) return;

		const timer = setInterval(() => {
			setCurrentImageIndex((prev) => (prev + 1) % sampleImages.length);
		}, 5000);

		return () => clearInterval(timer);
	}, [isClient]);

	// GIF cycling through all 4 GIFs (runners, basketball, tennis, swimmer)
	useEffect(() => {
		if (!isClient) return;

		// Clear any existing timer to prevent multiple timers
		if (timerRef.current) {
			clearInterval(timerRef.current);
		}

		// Start with runners gif
		setCurrentGifIndex(0);

		// Cycle through all GIFs every 3 seconds
		timerRef.current = setInterval(() => {
			setCurrentGifIndex((prev) => (prev + 1) % backgroundGifs.length);
		}, 3000);

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [isClient]);

	// Preload the background GIFs to prevent loading delay - only on client
	useEffect(() => {
		if (!isClient) return;

		// Preload all background GIFs
		backgroundGifs.forEach((src) => {
			const img = new window.Image();
			img.src = src;
		});
	}, [isClient]);

	// Set a timer to start glow after dots begin appearing - only on client
	useEffect(() => {
		if (!isClient) return;

		if (boxAnimationComplete) {
			setDotAnimationStarted(true);
			const timer = setTimeout(() => {
				setGlowAnimationStarted(true);
			}, 1200); // Delay glow effect to start after dots have time to appear
			return () => clearTimeout(timer);
		}
	}, [boxAnimationComplete, isClient]);

	const placeholders = [
		"Show me every play I could have finished stronger...",
		"Show me how to improve my timing...",
		"Analyze my form during this game...",
		"How can I improve against this opponent...",
		"Ask me anything...",
	];

	const handleSubmit = (e) => {
		e.preventDefault();
		// Redirect to upload page or handle submission
		router.push("/fencer_page");
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-gray-50 font-tiempos">
			{/* Top Hero Section with cycling GIF background */}
			<div className="relative pb-4 md:pb-0">
				{/* Background GIF with overlay - limited to top section */}
				<div className="absolute inset-0 z-0 overflow-hidden h-[85vh] max-h-[720px]">
					<div className="absolute inset-0 bg-white/85 z-10"></div>{" "}
					{/* Overlay to lighten the gif */}
					{/* Multi-GIF Cycling */}
					{isClient && (
						<div className="absolute inset-0 w-full h-full z-0">
							<Image
								src={backgroundGifs[currentGifIndex]}
								alt="Athletic background"
								fill
								style={{ objectFit: "cover", objectPosition: "center" }}
								className="opacity-60"
								priority={true}
								unoptimized={true}
							/>
						</div>
					)}
					{/* Static image for server render */}
					{!isClient && (
						<div className="absolute inset-0 w-full h-full z-0">
							<Image
								src={backgroundGifs[0]}
								alt="Athletic background"
								fill
								style={{ objectFit: "cover", objectPosition: "center" }}
								className="opacity-60"
								priority={true}
								unoptimized={true}
							/>
						</div>
					)}
					{/* Film grain overlay */}
					<div
						className="absolute inset-0 z-20 pointer-events-none"
						style={{
							opacity: 0.08,
							backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
							mixBlendMode: "multiply",
						}}
					></div>
					{/* Subtle vignette effect */}
					<div
						className="absolute inset-0 z-20 pointer-events-none"
						style={{
							background:
								"radial-gradient(circle, transparent 50%, rgba(0,0,0,0.1) 100%)",
						}}
					></div>
				</div>

				{/* Decorative elements - contained to top section only */}
				<div className="absolute top-0 left-0 w-full h-[85vh] max-h-[720px] overflow-hidden opacity-20 pointer-events-none z-0">
					<div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-blue-300 mix-blend-multiply filter blur-3xl"></div>
					<div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-emerald-300 mix-blend-multiply filter blur-3xl"></div>
					<div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-purple-300 mix-blend-multiply filter blur-3xl"></div>
				</div>

				{/* Hero Content - adjusted bottom padding to keep buttons in section */}
				<div className="relative z-10 px-6 pt-32 pb-12 md:pt-36 md:pb-20 mx-auto max-w-7xl">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Left column - Text */}
						<div className="text-center lg:text-left">
							<motion.h1
								className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-tight"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8 }}
							>
								Garde
							</motion.h1>
							<div className="mt-4 relative">
								{/* Redesigned tagline container with consistent text and box alignment */}
								<div className="relative max-w-[280px] sm:max-w-[300px] lg:max-w-[320px] mx-auto lg:mx-0 lg:ml-0 overflow-visible pb-2">
									{/* Main text first - this ensures the box wraps around the text */}
									<div className="relative z-20 text-center lg:text-left flex items-center justify-center lg:justify-start h-12 sm:h-10">
										<div className="inline-block overflow-hidden px-4 sm:px-3">
											{isClient && (
												<TextGenerateEffect
													words="Train smarter, instantly"
													className="text-[1.1rem] sm:text-[1.2rem] font-bold text-emerald-700 inline-block whitespace-nowrap tracking-tight"
												/>
											)}
											{!isClient && (
												<h2 className="text-[1.1rem] sm:text-[1.2rem] font-bold text-emerald-700 inline-block whitespace-nowrap tracking-tight">
													Train smarter, instantly
												</h2>
											)}
										</div>
									</div>

									{/* Highlight border that animates like a Finder selection drag */}
									<motion.div
										initial={{
											width: 0,
											height: 0,
											opacity: 0.4,
											top: "-10%",
											left: "-6px",
										}}
										animate={{
											width: "100%",
											height: "120%",
											opacity: 0.5,
										}}
										transition={{
											width: { duration: 0.9, ease: "easeOut" },
											height: { duration: 0.9, ease: "easeOut", delay: 0.2 },
											opacity: { duration: 0.3, delay: 0.7 },
										}}
										style={{
											borderWidth: "4px",
											borderStyle: "solid",
											borderColor: "#047857",
											position: "absolute",
											zIndex: 10,
											transformOrigin: "top left",
											borderRadius: "0.75rem",
											pointerEvents: "none",
											background: "rgba(16, 185, 129, 0.08)",
											boxShadow:
												"0 0 15px rgba(16, 185, 129, 0.2), inset 0 0 8px rgba(16, 185, 129, 0.1)",
										}}
										className="absolute top-0 bottom-0 my-auto h-[calc(100%+4px)]
											-left-4 -right-4
											sm:-left-4 sm:-right-4
											md:-left-6 md:-right-6
											lg:-left-4 lg:-right-4
											xl:-left-4 xl:-right-4"
										onAnimationComplete={() =>
											isClient && setBoxAnimationComplete(true)
										}
									>
										{/* Contained grid of dots that stay within the box */}
										{isClient &&
											boxAnimationComplete &&
											[...Array(25)].map((_, i) =>
												[...Array(6)].map((_, j) => (
													<motion.div
														key={`${i}-${j}`}
														initial={{ opacity: 0 }}
														animate={{ opacity: dotOpacities[i][j] }}
														transition={{
															duration: 0.8,
															ease: "easeIn",
															delay: dotDelays[i][j],
														}}
														className="absolute w-1 h-1 rounded-full bg-emerald-600"
														style={{
															left: `${5 + i * 3.8}%`,
															top: `${10 + j * 15}%`,
														}}
													/>
												)),
											)}
									</motion.div>

									{/* Glow effect with matching animation */}
									{isClient && (
										<motion.div
											initial={{
												width: 0,
												height: 0,
												opacity: 0,
												top: "-10%",
												left: "-8px",
											}}
											animate={
												glowAnimationStarted
													? {
															width: "100%",
															height: "120%",
															opacity: 0.2,
														}
													: {
															width: 0,
															height: 0,
															opacity: 0,
														}
											}
											transition={{
												width: { duration: 1.0, ease: "easeOut" },
												height: { duration: 1.0, ease: "easeOut", delay: 0.2 },
												opacity: { duration: 0.5, delay: 0.9 },
											}}
											style={{
												background: "linear-gradient(135deg, #047857, #10b981)",
												position: "absolute",
												zIndex: 9,
												transformOrigin: "top left",
												borderRadius: "0.75rem",
												pointerEvents: "none",
												filter: "blur(10px)",
											}}
											className="absolute -top-3 -bottom-1
												-left-8 -right-8
												sm:-left-10 sm:-right-14
												md:-left-12 md:-right-14
												lg:-left-8 lg:-right-2
												xl:-left-8 xl:-right-[35%]"
										/>
									)}
								</div>
							</div>
							<motion.p
								className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.2 }}
							>
								Real-time, AI-powered performance analysis for athletes and
								teams in <i>any</i> sport.
							</motion.p>

							{/* CTA Button */}
							<div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
								<motion.button
									className="px-8 py-3 bg-emerald-600 text-white rounded-md hover:shadow-lg transition-all flex items-center gap-2 transform hover:scale-105 font-tiempos w-full sm:w-auto justify-center"
									onClick={handleSubmit}
									type="button"
									whileHover={{ y: -2 }}
									whileTap={{ scale: 0.98 }}
								>
									<FaPlayCircle className="text-xl" />
									<span>Analyze My Performance</span>
								</motion.button>

								<motion.a
									href="#features"
									className="px-8 py-3 bg-transparent border border-emerald-600 text-emerald-700 rounded-md hover:bg-emerald-50 transition-all font-tiempos w-full sm:w-auto text-center"
									whileHover={{ y: -2 }}
									whileTap={{ scale: 0.98 }}
								>
									Explore All Features
								</motion.a>
							</div>
						</div>

						{/* Right column - App Preview */}
						<div className="relative mx-auto max-w-xl">
							<div className="bg-white p-1 rounded-2xl shadow-xl backdrop-blur-sm border border-slate-200">
								{isClient && (
									<AnimatePresence mode="wait">
										<motion.div
											key={currentImageIndex}
											className="relative rounded-xl overflow-hidden shadow-inner"
											initial={{ opacity: 0, scale: 0.95 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.95 }}
											transition={{ duration: 0.5, ease: "easeInOut" }}
											style={{ height: "270px", width: "100%" }}
										>
											<Image
												src={sampleImages[currentImageIndex]}
												alt="Fencing app preview"
												width={600}
												height={350}
												className="w-full h-auto rounded-xl"
											/>
										</motion.div>
									</AnimatePresence>
								)}

								{/* Use a placeholder image for server-side rendering */}
								{!isClient && (
									<div className="relative rounded-xl overflow-hidden shadow-inner">
										<Image
											src={sampleImages[0]}
											alt="Fencing app preview"
											width={600}
											height={350}
											className="w-full h-auto rounded-xl"
										/>
									</div>
								)}

								{/* Image navigation dots */}
								<div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white px-3 py-1 rounded-full shadow-md">
									{sampleImages.map((_, index) => (
										<button
											key={index}
											className={`w-2 h-2 rounded-full transition ${
												isClient && index === currentImageIndex
													? "bg-emerald-500"
													: "bg-slate-300"
											}`}
											onClick={() => setCurrentImageIndex(index)}
										/>
									))}
								</div>
							</div>

							{/* Search/Query Input - Moved here, below the image showcase */}
							<div className="mt-12 max-w-[calc(100%-2rem)] sm:max-w-md mx-auto">
								<div className="relative group">
									<div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full opacity-70 blur-sm group-hover:opacity-100 transition duration-300 group-hover:duration-200 group-hover:blur-md"></div>
									<PlaceholdersAndVanishInput
										placeholders={placeholders}
										onSubmit={handleSubmit}
										onChange={() => {}}
										className="relative bg-white rounded-full shadow-lg border border-emerald-100 group-hover:border-emerald-200 transition-all duration-300"
									/>
								</div>
							</div>

							{/* Decorative elements */}
							<div className="absolute -z-10 -top-4 -left-4 w-20 h-20 rounded-full bg-emerald-100 animate-pulse"></div>
							<div className="absolute -z-10 -bottom-4 -right-4 w-16 h-16 rounded-full bg-blue-100 animate-pulse"></div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-center mt-4">
				<div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-blue-500 mb-4 rounded-full"></div>

				<div className="mb-4">
					<h2 className="text-3xl md:text-4xl font-bold text-slate-800 text-center">
						Meet GSX-a1 — Your Generative Sports Expert
					</h2>
					<p className="text-slate-600 max-w-2xl mx-auto mt-4 text-center">
						Garde is a vision-language model for sports trained on authentic
						coaching insights to analytics and coaching. Get feedback for any
						sport, from basketball shot correction to marathon strides.
					</p>
				</div>

				{/* Feature cards in a row - MOVED ABOVE THE CONTAINER */}
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<motion.div
							className="bg-white backdrop-blur-lg border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all"
							whileHover={{
								y: -5,
								boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.1)",
							}}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
						>
							<h3 className="text-xl font-bold text-slate-800 mb-2">
								Advanced Reasoning
							</h3>
							<p className="text-slate-600">
								Converts complex statistics into winning strategies.
							</p>
						</motion.div>

						<motion.div
							className="bg-white backdrop-blur-lg border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all"
							whileHover={{
								y: -5,
								boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.1)",
							}}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.1 }}
						>
							<h3 className="text-xl font-bold text-slate-800 mb-2">
								Vision Analysis
							</h3>
							<p className="text-slate-600">
								Delivers frame-by-frame movement breakdowns for tailored
								feedback.
							</p>
						</motion.div>

						<motion.div
							className="bg-white backdrop-blur-lg border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all"
							whileHover={{
								y: -5,
								boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.1)",
							}}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.2 }}
						>
							<h3 className="text-xl font-bold text-slate-800 mb-2">
								Speech-to-Speech Interaction
							</h3>
							<p className="text-slate-600">
								Offers live, conversational coaching during practice sessions—no
								screens required.
							</p>
						</motion.div>

						<motion.div
							className="bg-white backdrop-blur-lg border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all"
							whileHover={{
								y: -5,
								boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.1)",
							}}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.3 }}
						>
							<h3 className="text-xl font-bold text-slate-800 mb-2">
								Injury Prevention
							</h3>
							<p className="text-slate-600">
								Analyzes form in real-time to minimize injury risks across all
								sports.
							</p>
						</motion.div>
					</div>
				</div>

				{/* Rest of the sections with plain white background */}
				<div className="bg-none relative z-20">
					{/* Features Section - REPLACED WITH CONTAINER SCROLL ANIMATION */}
					<div id="features" className="px-6 mx-auto max-w-7xl pt-0 pb-0">
						{/* Mobile app preview section below feature cards */}
						<div className="grid grid-cols-1 sm:grid-cols-2 items-start px-2 sm:px-6">
							{/* LEFT SIDE: phone demo */}
							<div className="w-full flex justify-center sm:justify-end pr-4 sm:pr-8">
								<ContainerScroll titleComponent={<></>}>
									<div className="flex h-full w-full items-center justify-center">
										<div className="overflow-hidden">
											<video
												src="/images/garde-mobile-demo.webm"
												muted
												className="
													block w-auto h-auto
													max-h-[70vh] max-w-full
													object-contain
													xs:scale-90 sm:scale-95
												"
												autoPlay
												loop
											/>
										</div>
									</div>
								</ContainerScroll>
							</div>

							{/* RIGHT SIDE: text */}
							<div className="w-full text-slate-700 px-3 sm:px-4">
								<h3 className="text-xl md:mt-28 sm:text-2xl font-bold mb-2 text-slate-800">
									Your AI Coach, Always Ready in Your Pocket
								</h3>

								<button
									type="button"
									disabled
									className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg"
								>
									Mobile App (Coming Soon)
								</button>

								<p className="font-semibold mb-4 text-base sm:text-xl">
									Level up your training wherever you are:
								</p>

								<ul className="list-disc list-inside space-y-2 text-base sm:text-lg">
									<li>Record or upload sports clips instantly</li>
									<li>
										Receive jargon-free AI performance breakdowns in seconds
									</li>
									<li>
										Ask follow-up questions like, "How do I fix my technique?"
										and receive immediate guidance
									</li>
									<li>
										Track your progress with personalized drills and metrics
									</li>
								</ul>

								<p className="mt-4 text-base sm:text-lg">
									Whether you're competing in tournaments or training solo,
									Garde puts expert-level AI coaching at your fingertips.
								</p>
							</div>
						</div>
					</div>

					{/* Visual separator */}
					<div className="max-w-6xl mx-auto mb-12 opacity-20">
						<div className="h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
					</div>
				</div>

				{/* Our Mission Section */}
				<div
					id="mission"
					className="px-6 mx-auto max-w-7xl mt-0 pb-20 relative"
				>
					<div className="absolute -z-10 inset-0 bg-gradient-to-b from-white to-emerald-50 opacity-80"></div>

					<div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
						{/* Text content - takes 3 columns on large screens */}
						<div className="lg:col-span-3 text-center lg:text-left">
							<h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-6">
								Our Mission
							</h2>
							<div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto lg:mx-0 rounded-full mb-6"></div>
							<p className="text-slate-600 text-lg mb-8">
								We're here to revolutionize athletic training and sports
								analytics through cutting-edge AI. From local clubs to
								world-class teams, Garde empowers athletes everywhere to unlock
								their full potential.
							</p>

							<div className="flex flex-wrap gap-4 justify-center lg:justify-start">
								<motion.a
									href="/signin?isSignUp=true"
									className="px-8 py-3 bg-emerald-600 text-white rounded-md hover:shadow-lg transition-all flex items-center gap-2 font-tiempos"
									whileHover={{ y: -2 }}
									whileTap={{ scale: 0.98 }}
								>
									Get Started Today
								</motion.a>

								{/* Commented out Contact Us button
								<motion.a
									href="#"
									className="px-8 py-3 bg-transparent border border-emerald-600 text-emerald-700 rounded-md hover:bg-emerald-50 transition-all font-tiempos"
									whileHover={{ y: -2 }}
									whileTap={{ scale: 0.98 }}
								>
									Contact Us
								</motion.a>
								*/}
							</div>

							{/* Partner logos */}
							<div className="mt-12">
								<p className="text-slate-500 mb-4">
									Trusted by coaches and athletes across basketball, soccer,
									tennis, fencing, and more.
								</p>
								<div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
									<div className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity">
										<div className="text-slate-700 font-semibold">
											Athletes Worldwide
										</div>
									</div>
									<div className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity">
										<div className="text-slate-700 font-semibold">
											Multi-Sport Analytics
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Image - takes 2 columns on large screens */}
						<div className="lg:col-span-2 mx-auto">
							<div className="relative">
								<div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur-xl opacity-20 animate-pulse" />
								<div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
									<video
										src="/images/garde-demo.webm"
										autoPlay
										muted
										controls
										loop
										controlsList="nodownload"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Hero;
