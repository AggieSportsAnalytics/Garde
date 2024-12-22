import React from "react";
import { CardSpotlight } from "../ui/card-spotlight";
import Image from "next/image";
import { WobbleCard } from "../ui/wobble-card";

const About = () => {
	return (
		<div
			id="about"
			className="flex flex-col items-center justify-center mt-36 px-4"
		>
			<div className="flex justify-center">
				<h1 className="text-white font-semibold text-4xl md:text-6xl font-platypi mt-[-50px] md:mt-[-100px]">
					Features.
				</h1>
			</div>

			<div className="flex flex-col space-y-10">
				{/* First Row */}
				<div className="flex flex-row space-x-10">
					{/* Card for Fencers */}
					<div className="flex justify-center mt-8 md:mt-14 w-full">
						<CardSpotlight className="w-full max-w-md md:max-w-lg lg:max-w-3xl h-auto p-4">
							<h1 className="flex justify-center text-white font-bold text-xl md:text-2xl mt-[-20px] md:mt-[-30px] font-platypi">
								Built for Fencers
							</h1>
							<ul className="list-none font-semibold text-sm md:text-base mt-5">
								<p className="text-white font-platypi">
									Garde uses advanced pose estimation technology to analyze your
									fencing form with precision. Instantly receive actionable
									feedback to improve your technique, correct improper form, and
									elevate your performance in every session.
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

					{/* Card for Coaches */}
					<div className="flex justify-center mt-8 md:mt-14 w-full">
						<CardSpotlight className="w-full max-w-md md:max-w-lg lg:max-w-3xl h-auto p-4">
							<h1 className="flex justify-center text-white font-bold text-xl md:text-2xl mt-[-20px] md:mt-[-30px] font-platypi">
								Built for Coaches
							</h1>
							<ul className="list-none font-semibold text-sm md:text-base mt-5">
								<p className="text-white font-platypi">
									Garde provides a powerful platform for coaches to track and
									enhance their students' progress effortlessly. With a video
									dashboard and detailed analytics, you can review fencers'
									performance, access key metrics, and provide targeted feedback
									with ease.
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

				{/* Second Row */}
				<div className="flex justify-center mt-8 md:mt-14 w-full">
					<CardSpotlight className="w-full max-w-md md:max-w-lg lg:max-w-3xl h-auto p-4">
						<h1 className="flex justify-center text-white font-bold text-xl md:text-2xl mt-[-20px] md:mt-[-30px] font-platypi">
							Built for Tournaments
						</h1>
						<ul className="list-none font-semibold text-sm md:text-base mt-5">
							<p className="text-white font-platypi">
								Effortlessly organize and manage fencing tournaments with Garde.
								Streamline participant signups, share essential details such as
								location, schedule, registration fees, and organizer
								information. Showcase key tournament aspects, including
								participant profiles (name, email), descriptions, rules, and
								eligibility criteria. Easily access and review tournament
								videos, and results—all within a single, comprehensive platform.
							</p>
						</ul>
						<div className="flex justify-center mt-5">
							<WobbleCard className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl h-[400px] md:h-[400px]">
								<div className="flex justify-center items-center h-full">
									<Image
										alt="Tournaments page"
										src="/images/tournaments.png"
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
		</div>
	);
};

export default About;
