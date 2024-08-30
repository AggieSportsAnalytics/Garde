import React from "react";
import { CardSpotlight } from "./ui/card-spotlight";
import Image from "next/image";
import { WobbleCard } from "./ui/wobble-card";

const About = () => {
	return (
		<div className="flex flex-col items-center justify-center mt-36">
			<div className="flex justify-center">
				<h1 className="text-white font-semibold text-6xl font-platypi mt-[-100px]">
					Features.
				</h1>
			</div>

			<div className="flex justify-center mt-14">
				<CardSpotlight className="h-[600px] w-[900px]">
					<h1 className="flex justify-center text-white relative font-bold text-2xl mt-[-30px] font-platypi">
						Built for Fencers
					</h1>
					<ul className="list-none relative font-semibold text-base mt-5">
						<p className="text-white font-platypi">
							Garde harnesses the power of advanced pose estimation technology
							to deliver precise analysis of your fencing form. By continuously
							tracking your body position and movements in real-time, Garde
							provides invaluable feedback on your technique, helping you to
							identify and correct bad form instantly.
						</p>
					</ul>
					<div className="mt-5">
						<WobbleCard className="h-96">
							<div className="flex justify-center">
								<Image
									src="/images/FencerPage.png"
									width={700}
									height={700}
									className="rounded-2xl mt-[-60px]"
								/>
							</div>
						</WobbleCard>
					</div>
				</CardSpotlight>
			</div>

			<div className="flex justify-center mt-14">
				<CardSpotlight className="h-[600px] w-[900px]">
					<h1 className="flex justify-center text-white relative font-bold text-2xl mt-[-30px] font-platypi">
						Built for Coaches
					</h1>
					<ul className="list-none relative font-semibold text-base mt-5">
						<p className="text-white font-platypi">
							Garde offers a robust platform where coaches can effortlessly
							track and manage their students' progress. Our system integrates
							real-time analytics with a comprehensive database, allowing you to
							access detailed performance metrics and insights for each fencer.
						</p>
					</ul>
					<div className="mt-5">
						<WobbleCard className="h-96">
							<div className="flex justify-center">
								<Image
									src="/images/CoachPage.png"
									width={700}
									height={700}
									className="rounded-2xl mt-[-60px]"
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
