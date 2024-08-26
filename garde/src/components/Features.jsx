import React from 'react'
import "../app/globals.css"
import Image from 'next/image'
import { LampContainer } from './ui/lamp'
import { AnimatedTooltip } from './ui/animated-tooltip'

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
    image: "/images/openailogo.png"
  },
  {
    id: 3,
    name: "MongoDB",
    designation: "Database",
    image: "/images/mongoDB.png"
  },
  {
    id: 4,
    name: "Amazon S3",
    designation: "Video Storage",
    image: "/images/amazonS3.png"
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
    image: "/images/prisma.png"
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
    image: "/images/tailwindcsslogo.webp"
  }
]

const Features = () => {
  return (
  <LampContainer  className="w-full">
    <div id="features" className="text-white font-semibold text-5xl mt-[-450px] flex justify-center font-platypi">
      Built using the industry leading tech stack.
    </div>
    <div className="flex flex-row items-center justify-center mt-10 w-full">
      <AnimatedTooltip items={tools}/>
    </div>
  </LampContainer>
  )
}

export default Features;
