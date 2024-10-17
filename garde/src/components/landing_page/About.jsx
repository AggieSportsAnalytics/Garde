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

			<div className="flex justify-center mt-8 md:mt-14 w-full">
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
					<div className="mt-5">
						<WobbleCard className="h-72 md:h-96">
							<div className="flex justify-center">
								<Image
									src="/images/FencerPage.png"
									width={500}
									height={500}
									className="rounded-2xl"
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
					<div className="mt-5">
						<WobbleCard className="h-72 md:h-96">
							<div className="flex justify-center">
								<Image
									src="/images/CoachPage.png"
									width={500}
									height={500}
									className="rounded-2xl"
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
