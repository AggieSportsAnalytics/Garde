"use client";

import Hero from "../components/landing_page/Hero";
import Contact from "../components/landing_page/Contact";
import Footer from "../components/landing_page/Footer";
import Navbar from "../components/landing_page/Navbar";
import FAQSection from "../components/landing_page/Faq";

export default function Home() {
	return (
		<div className="bg-[#faf9f5]">
			<Navbar />
			<Hero />
			<FAQSection />
			<Contact />
			<Footer />
		</div>
	);
}
