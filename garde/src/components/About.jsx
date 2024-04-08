import React from 'react'

const About = () => {
  return (
    <div>
      <div id="about" className="mt-[200px] ml-10 text-left text-white font-bold text-5xl">
        Minimize costs, Maximize performance. <br />
        Garde is here to help.
        </div>
      <div className="mt-5 ml-10 text-stone-400 font-light"> 
          Garde employs advanced pose estimation technology to deliver precise angle measurement, <br />
          movement analysis, offering invaluable insights to enhance performance <br />
          across various disciplines and sports.
      </div>
      <div>
        <ul role="list" className="">
          <li className="flex">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#6ed0dd" stroke="#6ed0dd" className="ml-10 mt-5 w-5 h-5"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-.997-4L6.76 11.757l1.414-1.414 2.829 2.829 5.656-5.657 1.415 1.414L11.003 16z"></path> </g> </g></svg>
            <span className="text-white mt-4 ml-3 font-semibold"> Personalized training tailored to individual fencers </span>
          </li>

          <li className="flex">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#6ed0dd" stroke="#6ed0dd" className="ml-10 mt-5 w-5 h-5"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-.997-4L6.76 11.757l1.414-1.414 2.829 2.829 5.656-5.657 1.415 1.414L11.003 16z"></path> </g> </g></svg>
            <span className="text-white mt-4 ml-3 font-semibold"> Robust pose estimation for accurate angle measurement </span>
          </li>

          <li className="flex">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#6ed0dd" stroke="#6ed0dd" className="ml-10 mt-5 w-5 h-5"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-.997-4L6.76 11.757l1.414-1.414 2.829 2.829 5.656-5.657 1.415 1.414L11.003 16z"></path> </g> </g></svg>
            <span className="text-white mt-4 ml-3 font-semibold"> Cutting-edge AI/ML technology for advanced skill development </span>
          </li>

        </ul>
      </div>

    </div>
  )
}

export default About;
