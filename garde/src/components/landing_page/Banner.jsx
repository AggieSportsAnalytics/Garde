import React from "react";
import { useTheme } from "next-themes"; // Assuming you are using next-themes for theme management
import { MagicCard } from "../ui/MagicCard"; // Import MagicCard component

const Banner = () => {
	// const { theme } = useTheme();
	return (
		<div className="mt-16 px-4">
			<MagicCard
				className="cursor-pointer justify-center shadow-2xl text-center text-4xl sm:text-5xl md:text-6xl h-[150px] sm:h-[180px] md:h-[200px] whitespace-normal"
				// gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
			>
				<div className="flex items-center justify-center h-full">
					<h1 className="font-platypi font-extrabold text-white">
						Minimize costs, Maximize performance.
					</h1>
				</div>
			</MagicCard>
		</div>
	);
};

export default Banner;
