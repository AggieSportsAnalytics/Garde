import { FaLocationArrow } from "react-icons/fa6";
import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { FencerHelmet } from "./fencer-helmet";
import { FencerSword } from "./fencer-sword";
import MagicButton from "./MagicButton";
import { Spotlight } from "../ui/Spotlight";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";

function FencerAttire() {
	const leatherTexture = useTexture("/images/leather-fabric.jpg");
	return (
		<>
			<FencerHelmet
				scale={[0.2, 0.2, 0.2]}
				position={[0, -0.7, -1]}
				rotation={[Math.PI / 2, Math.PI, Math.PI]}
			>
				<meshStandardMaterial map={leatherTexture} />
			</FencerHelmet>
			<FencerSword
				scale={[0.07, 0.07, 0.07]}
				position={[0.5, -0.7, -1]}
				rotation={[-(Math.PI / 13), -(Math.PI / 7), Math.PI / 4]}
			/>
			<FencerSword
				scale={[0.07, 0.07, 0.07]}
				position={[0, -0.7, -1]}
				rotation={[-(Math.PI / 5), -(Math.PI / 7), -(Math.PI / 4)]}
			/>
		</>
	);
}

const Hero = () => {
	return (
		<div className="relative flex flex-col items-center justify-center pt-36 pb-20">
			{/* Spotlights */}
			<div className="absolute inset-0 pointer-events-none">
				<Spotlight
					className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
					fill="white"
				/>
				<Spotlight
					className="h-[80vh] w-[50vw] top-10 left-1/2 transform -translate-x-1/2"
					fill="purple"
				/>
				<Spotlight
					className="left-1/2 top-28 h-[80vh] w-[50vw] transform -translate-x-1/2"
					fill="blue"
				/>
			</div>

			{/* Background Grid */}
			<div
				className="absolute inset-0 h-screen w-full dark:bg-black-100 bg-black-100 
        dark:bg-grid-white/[0.03] bg-grid-black-100/[0.03] flex items-center justify-center"
			>
				<div
					className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black-100
          bg-black-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
				/>
			</div>

			{/* Hero Content - Side by Side Layout */}
			<div className="relative z-10 flex flex-col md:flex-row items-center justify-center mt-8 md:mt-0 text-center space-x-8">
				{/* Hero Text */}
				<div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw]">
					<p className="uppercase tracking-widest text-6xl sm:text-7xl md:text-8xl font-platypi text-center text-blue-100">
						GARDE
					</p>
					<div className="mt-4">
						<TextGenerateEffect
							words="Smart Coaching, Smarter Fencing"
							className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-platypi"
						/>
					</div>
					<div className="mt-8">
						<a href="#about">
							<MagicButton
								title="Learn More"
								icon={<FaLocationArrow />}
								position="right"
							/>
						</a>
					</div>
				</div>

				{/* 3D Model Canvas */}
				<div className="md:w-[400px] md:h-[400px]">
					<Canvas>
						<Environment preset="studio" />
						<OrbitControls enableZoom={false} autoRotate={true} />
						<FencerAttire />
					</Canvas>
				</div>
			</div>
		</div>
	);
};

export default Hero;
