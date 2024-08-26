import React from 'react'
import { MagicCard } from './ui/MagicCard';
import { useTheme } from "next-themes";
const Banner = () => {
  const { theme } = useTheme();
  return (
    <div className="mt-16">
    <MagicCard className=
              "cursor-pointer justify-center shadow-2xl whitespace-nowrap text-4xl h-[300px]"
              gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
    >
      <div className="mt-24">
        <h1 className="text-8xl font-platypi relative mt-2 text-white">
          Minimize costs, Maximize performance.
        </h1>
      </div>
    </MagicCard>
  </div>
  )
}

export default Banner
