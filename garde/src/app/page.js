"use client";

import Hero from "../components/landing_page/Hero";
// Removed duplicate components that are now integrated into Hero component
// import Features from "../components/landing_page/Features";
// import Banner from "../components/landing_page/Banner";
// import Showcase from "../components/landing_page/Showcase";
// import Contact from "../components/landing_page/Contact"; // Removed as contact form is now in Hero
import Footer from "../components/landing_page/Footer";
import Navbar from "../components/landing_page/Navbar";

export default function Home() {
	return (
		<div className="bg-[#faf9f5]">
			<Navbar />
			<Hero />
			{/* Removed duplicate components */}
			{/* <Showcase /> */}
			{/* <Features /> */}
			{/* <Banner /> */}
			{/* Contact form is now integrated into Hero component */}
			{/* <div id="contact">
				<Contact />
			</div> */}
			<Footer />
		</div>
	);
}
