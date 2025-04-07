"use client";

import Hero from "../components/landing_page/Hero";
import Features from "../components/landing_page/Features";
import Banner from "../components/landing_page/Banner";
import Contact from "../components/landing_page/Contact";
import Footer from "../components/landing_page/Footer";
import Showcase from "../components/landing_page/Showcase";
import Navbar from "../components/landing_page/Navbar";

export default function Home() {
	return (
		<div className="bg-[#faf9f5]">
			<Navbar />
			<Hero />
			<Showcase />
			<Features />
			<Banner />
			<div id="contact">
				<Contact />
			</div>
			<Footer />
		</div>
	);
}
