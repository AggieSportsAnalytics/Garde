import React from "react";
import "../app/globals.css";
import { LampContainer } from "./ui/lamp";
import { AnimatedTooltip } from "./ui/animated-tooltip";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";

const tools = [
	{
		id: 1,
		name: "TensorflowJS",
		designation: "AI/ML Library used for Pose Estimation",
		image: "/images/tensorflowJS.png",
	},
	{
		id: 2,
		name: "OpenAI API",
		designation: "Used for LLM Output",
		image: "/images/openailogo.png",
	},
	{
		id: 3,
		name: "MongoDB",
		designation: "Database",
		image: "/images/mongoDB.png",
	},
	{
		id: 4,
		name: "Amazon S3",
		designation: "Video Storage",
		image: "/images/amazonS3.png",
	},
	{
		id: 5,
		name: "Terraform",
		designation: "Database Management",
		image: "/images/terraformlogo.png",
	},
	{
		id: 6,
		name: "Prisma",
		designation: "MongoDB Communication",
		image: "/images/prisma.png",
	},
	{
		id: 7,
		name: "NextJS",
		designation: "Web Development",
		image: "/images/nextjs.png",
	},
	{
		id: 8,
		name: "Tailwind CSS",
		designation: "Frontend Web Development",
		image: "/images/tailwindcsslogo.webp",
	},
];

const words = [
	{
		text: "Built",
	},
	{
		text: "using",
	},
	{
		text: "the",
	},
	{
		text: "industry",
	},
	{
		text: "leading",
	},
	{
		text: "tech",
	},
	{
		text: "stack.",
	},
];

const Features = () => {
	return (
		<>
			<div className="flex justify-center mt-10">
				<TypewriterEffectSmooth
					words={words}
					className="font-platypi text-2xl md:text-3xl lg:text-4xl text-center"
				/>
			</div>

			<LampContainer className="w-full mt-10">
				<div className="flex flex-wrap justify-center mt-10 md:mt-20 w-full px-4">
					<AnimatedTooltip
						items={tools}
						className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 max-w-xs mx-2 mb-4"
					/>
				</div>
			</LampContainer>
		</>
	);
};

export default Features;
