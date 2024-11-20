"use client";

import Hero from "../components/landing_page/Hero";
import About from "../components/landing_page/About";
import Features from "../components/landing_page/Features";
import Contact from "../components/landing_page/Contact";
import Footer from "../components/landing_page/Footer";
import Showcase from "../components/landing_page/Showcase";
import Banner from "../components/landing_page/Banner";
import { useEffect } from "react";
import Navbar from "../components/landing_page/Navbar";

export default function Home() {
	useEffect(() => {
		const userAgent =
			typeof window.navigator === "undefined" ? "" : navigator.userAgent;
		const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(userAgent);

		if (isMobileDevice) {
			alert(
				"For a better viewing experience, please visit this website on a computer.",
			);
		}
	}, []);

	return (
		<div className="">
			<Navbar />
			<Hero />
			<About />
			<Showcase />
			{/* <Features /> */}
			{/* <Banner /> */}
			<Contact />
			<Footer />
			{/**/}
		</div>
	);
}
