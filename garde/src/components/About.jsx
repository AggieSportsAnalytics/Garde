import React from 'react'
import { CardSpotlight } from "./ui/card-spotlight";
import { MagicCard } from './ui/MagicCard';
import { useTheme } from "next-themes";
import { GlareCard } from './ui/glare-card';
import {Step} from "./ui/Step";
const About = () => {
  const { theme } = useTheme();
  return (
    <div>
        <div className="mt-16">
          <MagicCard className=
                    "cursor-pointer justify-center shadow-2xl whitespace-nowrap text-4xl h-[300px]"
                    gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
          >
            <div className="mt-24">
              <h1 className="text-8xl font-bold relative mt-2 text-white">
                Minimize costs, Maximize performance.
              </h1>
            </div>
          </MagicCard>
        </div>

        <div className="mt-16">
          <CardSpotlight className="h-[500px] w-[1100px] ml-[100px]">
            <ul className="list-none relative mt-10 font-semibold text-2xl">
              {/* <Step title="Personalized training tailored to individual fencers" />
              <Step title="Robust pose estimation for accurate form measurement" />
              <Step title="Cutting-edge AI/ML technology for advanced skill development" />
              <Step title="Patent-Pending Algorithm" /> */}
              <p className="text-white">
                Personalized training tailored to individual fencers
                Robust pose estimation for accurate form measurement
                Cutting-edge AI/ML technology for advanced skill development
                Patent-Pending Algorithm
              </p>
            </ul>
          </CardSpotlight>
        </div>

        <div className="mt-[-500px]">
          <CardSpotlight className="h-[500px] w-[1100px] ml-[1300px]">
            <ul className="list-none relative mt-10 font-semibold text-2xl">
              {/* <Step title="Personalized training tailored to individual fencers" />
              <Step title="Robust pose estimation for accurate form measurement" />
              <Step title="Cutting-edge AI/ML technology for advanced skill development" />
              <Step title="Patent-Pending Algorithm" /> */}
              <p className="text-white">
                Personalized training tailored to individual fencers
                Robust pose estimation for accurate form measurement
                Cutting-edge AI/ML technology for advanced skill development
                Patent-Pending Algorithm
              </p>
            </ul>
          </CardSpotlight>
        </div>

    </div>
  )
}

export default About;
