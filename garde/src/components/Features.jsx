import React from 'react'
import "../app/globals.css"
import Image from 'next/image'

const Features = () => {
  return (
    <div>
      <div id="features" className="text-white font-bold text-5xl mt-[200px] flex justify-center">
        Garde's Frameworks and Tools
      </div>  

    <div className="flex flex-wrap justify-around p-10 mt-[100px]">
      <div className="circle">
        <Image
            src="/images/tensorflowJS.png"
            alt="logo"
            width={100}
            height={100}
            quality={100}
        />
      </div>

      {/* <div className="mt-[2]">
        <span className="font-bold text-white text-sm"> Tensorflow.JS </span>
      </div> */}

      <div className="circle">
        <Image
            src="/images/mongoDB.png"
            alt="logo"
            width={100}
            height={100}
            quality={100}
        />
      </div>

      {/* <div className="mt-[2]">
        <span className="font-bold text-white text-sm"> MongoDB </span>
      </div> */}

      <div className="circle">
        <Image
            src="/images/openCV.png"
            alt="logo"
            width={80}
            height={80}
            quality={100}
        />
      </div>

      {/* <div className="mt-[2]">
        <span className="font-bold text-white text-sm"> OpenCV.JS </span>
      </div> */}

      <div className="circle">
        <Image
            src="/images/nodeJS.png"
            alt="logo"
            width={100}
            height={100}
            quality={100}
        />
      </div>

      {/* <div className="mt-[2]">
        <span className="font-bold text-white text-sm"> Node.JS </span>
      </div> */}

      <div className="circle">
        <Image
            src="/images/expressJS.png"
            alt="logo"
            width={100}
            height={100}
            quality={100}
        />
      </div>

      {/* <div className="mt-[2]">
        <span className="font-bold text-white text-sm"> Express.JS </span>
      </div> */}

      <div className="circle">
        <Image
            src="/images/ReactLogo.png"
            alt="logo"
            width={100}
            height={100}
            quality={100}
        />
      </div>

      {/* <div className="mt-[2]">
        <span className="font-bold text-white text-sm"> React.JS </span>
      </div> */}

      <div className="circle">
        <Image
            src="/images/nextLogo.png"
            alt="logo"
            width={100}
            height={100}
            quality={100}
        />
      </div>

      {/* <div className="mt-[2]">
        <span className="font-bold text-white text-sm"> Next.JS </span>
      </div> */}

      <div className="circle">
        <Image
            src="/images/amazonS3.png"
            alt="logo"
            width={70}
            height={70}
            quality={100}
        />
      </div>

      {/* <div className="mt-[2]">
        <span className="font-bold text-white text-sm"> Amazon S3 </span>
      </div> */}

      <div className="circle">
        <Image
            src="/images/clerkLogo.png"
            alt="logo"
            width={100}
            height={100}
            quality={100}
        />
      </div>
    
      {/* <div className="mt-[2]">
        <span className="font-bold text-white text-sm"> Clerk </span>
      </div> */}

    </div>
    </div>
  )
}

export default Features;
