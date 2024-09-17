import React from 'react'
import { MagicCard } from './ui/MagicCard';
import { useTheme } from "next-themes";
const Banner = () => {
  const { theme } = useTheme();
  return (
    <div className="mt-16">
    <MagicCard className=
              "cursor-pointer justify-center shadow-2xl whitespace-nowrap text-6xl h-[200px]"
              gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
    >
      <div className="mt-14">
        <h1 className="text-6xl font-platypi font-extrabold relative mt-2 text-white">
          Minimize costs, Maximize performance.
        </h1>
      </div>
    </MagicCard>
  </div>
  )
}

export default Banner
