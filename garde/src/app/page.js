"use client"

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Features from "../components/Features";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import Showcase from "../components/Showcase";
import Banner from "../components/Banner";
import Fencer_Page from "./fencer_page/page";
import CoachPage from "./coach_page/page";

export default function Home() {
     
        return (
        
            <div className="">
                <Navbar />
                <Hero />
                <Features />
                <About />
                <Showcase />
                <Banner />
                <Contact />
                <Footer />
                {/**/}
            </div>
        )
     
   //   return ( 
   //      <div className="">
   //          <Fencer_Page />
            
   //       </div>
   //   )
}
