import React from 'react'
import { CardSpotlight } from "./ui/card-spotlight";
import { MagicCard } from './ui/MagicCard';
import { useTheme } from "next-themes";
import { GlareCard } from './ui/glare-card';
import Image from "next/image";
import {Step} from "./ui/Step";
import { WobbleCard } from './ui/wobble-card';
const About = () => {
  const { theme } = useTheme();
  return (
    <div>
              <div className="mt-16">
          <CardSpotlight className="h-[500px] w-[1100px] ml-[100px]">
            <h1 className="flex justify-center text-white relative font-bold text-5xl font-platypi">Built for Fencers</h1>
            <ul className="list-none relative mt-10 font-semibold text-2xl">
              {/* <Step title="Personalized training tailored to individual fencers" />
              <Step title="Robust pose estimation for accurate form measurement" />
              <Step title="Cutting-edge AI/ML technology for advanced skill development" />
              <Step title="Patent-Pending Algorithm" /> */}
              <p className="text-white font-platypi">
                Personalized training tailored to individual fencers
                Robust pose estimation for accurate form measurement
                Cutting-edge AI/ML technology for advanced skill development
                Patent-Pending Algorithm
              </p>
            </ul>
            <WobbleCard className="h-64">
              <div className="flex justify-center">
                <Image 
                  src="/images/FencerPage.png"
                  width={500}
                  height={500}
                  className="flex justify-center rounded-2xl mt-[-70px]"
                />
              </div>
            </WobbleCard>
          </CardSpotlight>
        </div>

        <div className="mt-[-500px]">
          <CardSpotlight className="h-[500px] w-[1100px] ml-[1300px]">
            <h1 className="flex justify-center text-white relative font-bold text-5xl font-platypi">Built for Coaches</h1>
            <ul className="list-none relative mt-10 font-semibold text-2xl">
              {/* <Step title="Personalized training tailored to individual fencers" />
              <Step title="Robust pose estimation for accurate form measurement" />
              <Step title="Cutting-edge AI/ML technology for advanced skill development" />
              <Step title="Patent-Pending Algorithm" /> */}
              <p className="text-white font-platypi">
                Personalized training tailored to individual fencers
                Robust pose estimation for accurate form measurement
                Cutting-edge AI/ML technology for advanced skill development
                Patent-Pending Algorithm
              </p>
            </ul>
            <WobbleCard className="h-64">
              <div className="flex justify-center">
                <Image 
                  src="/images/CoachPage.png"
                  width={500}
                  height={500}
                  className="flex justify-center rounded-2xl mt-[-70px]"
                />
              </div>
            </WobbleCard>

          </CardSpotlight>
        </div>
    </div>
  )
}

export default About;
