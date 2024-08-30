import { FaLocationArrow } from "react-icons/fa6";

import MagicButton from "./MagicButton";
import { Spotlight } from "./ui/Spotlight";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";

const Hero = () => {
	return (
		<div className="pb-20 pt-36 relative flex justify-center items-center">
			{/**
			 *  UI: Spotlights
			 *  Link: https://ui.aceternity.com/components/spotlight
			 */}
			<div className="absolute inset-0">
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

			{/**
			 *  UI: grid
			 *  change bg color to bg-black-100 and reduce grid color from
			 *  0.2 to 0.03
			 */}
			<div
				className="h-screen w-full dark:bg-black-100 bg-black-100 dark:bg-grid-white/[0.03] bg-grid-black-100/[0.03]
        absolute top-0 left-0 flex items-center justify-center"
			>
				{/* Radial gradient for the container to give a faded look */}
				<div
					className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black-100
          bg-black-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
				/>
			</div>

			<div className="flex flex-col items-center justify-center relative my-20 z-10 text-center">
				<div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw]">
					<p className="uppercase tracking-widest text-8xl font-platypi text-center text-blue-100">
						GARDE
					</p>

					{/**
					 *  Link: https://ui.aceternity.com/components/text-generate-effect
					 *
					 *  change md:text-6xl, add more responsive code
					 */}
					<div className="mt-4">
						<TextGenerateEffect
							words="Your AI Fencing Companion"
							className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-platypi"
						/>
					</div>

					<div className="mt-8">
						<a href="#features">
							<MagicButton
								title="Learn More"
								icon={<FaLocationArrow />}
								position="right"
							/>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Hero;
