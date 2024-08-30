"use client";

import Hero from "../components/Hero";
import About from "../components/About";
import Features from "../components/Features";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import Showcase from "../components/Showcase";
import Banner from "../components/Banner";

export default function Home() {
	return (
		<div className="">
			<Hero />
			<About />
			<Showcase />
			<Features />
			<Banner />
			<Contact />
			<Footer />
		</div>
	);
}
