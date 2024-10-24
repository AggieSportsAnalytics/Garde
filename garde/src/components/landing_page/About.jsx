import React from "react";
import { CardSpotlight } from "../ui/card-spotlight";
import Image from "next/image";
import { WobbleCard } from "../ui/wobble-card";

const About = () => {
	return (
		<div className="flex flex-col items-center justify-center mt-36 px-4">
			<div className="flex justify-center">
				<h1 className="text-white font-semibold text-4xl md:text-6xl font-platypi mt-[-50px] md:mt-[-100px]">
					Features.
				</h1>
			</div>

			<div id="about" className="flex justify-center mt-8 md:mt-14 w-full">
				<CardSpotlight className="w-full max-w-md md:max-w-lg lg:max-w-3xl h-auto p-4">
					<h1 className="flex justify-center text-white font-bold text-xl md:text-2xl mt-[-20px] md:mt-[-30px] font-platypi">
						Built for Fencers
					</h1>
					<ul className="list-none font-semibold text-sm md:text-base mt-5">
						<p className="text-white font-platypi">
							Garde harnesses the power of advanced pose estimation technology
							to deliver precise analysis of your fencing form. By continuously
							tracking your body position and movements in real-time, Garde
							provides invaluable feedback on your technique, helping you to
							identify and correct bad form instantly.
						</p>
					</ul>
					<div className="flex justify-center mt-5">
						<WobbleCard className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl h-[400px] md:h-[400px]">
							<div className="flex justify-center items-center h-full">
								<Image
									alt="Fencer page"
									src="/images/New_FencerPage.png"
									width={700}
									height={700}
									className="rounded-2xl object-contain"
								/>
							</div>
						</WobbleCard>
					</div>
				</CardSpotlight>
			</div>

			<div className="flex justify-center mt-8 md:mt-14 w-full">
				<CardSpotlight className="w-full max-w-md md:max-w-lg lg:max-w-3xl h-auto p-4">
					<h1 className="flex justify-center text-white font-bold text-xl md:text-2xl mt-[-20px] md:mt-[-30px] font-platypi">
						Built for Coaches
					</h1>
					<ul className="list-none font-semibold text-sm md:text-base mt-5">
						<p className="text-white font-platypi">
							Garde offers a robust platform where coaches can effortlessly
							track and manage their students' progress. Our system integrates
							real-time analytics with a comprehensive database, allowing you to
							access detailed performance metrics and insights for each fencer.
						</p>
					</ul>
					<div className="flex justify-center mt-5">
						<WobbleCard className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl h-[400px] md:h-[400px]">
							<div className="flex justify-center items-center h-full">
								<Image
									alt="Coach page"
									src="/images/CoachPage.png"
									width={700}
									height={700}
									className="rounded-2xl object-contain"
								/>
							</div>
						</WobbleCard>
					</div>
				</CardSpotlight>
			</div>
		</div>
	);
};

export default About;
