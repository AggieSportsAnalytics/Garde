import React from "react";
import { MagicCard } from "../ui/MagicCard"; // Import MagicCard component

// This component has been disabled as its content is already included in the Hero component
const Banner = () => {
  return null; // Return null instead of duplicating the "Our Mission" section
};

// Previous implementation is commented out to avoid duplication
/* 
const Banner = () => {
  return (
    <section className="bg-[#faf9f5] py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-8xl font-platypi text-[#1a2b3b] mb-4">Our Mission</h1>
        <p className="text-2xl font-platypi text-gray-700 mb-8">
          Our mission is to revolutionize fencing and sports analytics through state-of-the-art AI technology.
          We proudly work with Davis Fencing Academy and Team USA Fencing to deliver unmatched training insights.
        </p>
        <MagicCard />
      </div>
    </section>
  );
};
*/

export default Banner;
