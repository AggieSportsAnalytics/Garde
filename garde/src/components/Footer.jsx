import React from 'react'
import Image from 'next/image'

const Footer = () => {
  return (
    <div>
      <div className="mt-20">
        <Image 
            src="/images/logo.png"
            alt="logo"
            width={72}
            height={72}
            quality={100}
            className="mt-[100px] ml-[800px] rounded-full"
        />
      </div>

      <div className="mt-5 flex justify-center text-stone-300">
        © 2024-2025 Garde™. All Rights Reserved.
      </div>

      <div className="text-slate-950 mt-5">
        i
      </div>
    </div>
  )
}

export default Footer