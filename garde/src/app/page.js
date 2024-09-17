"use client";

import Hero from "../components/Hero";
import About from "../components/About";
import Features from "../components/Features";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { SessionProvider } from "next-auth/react";
// import Fencer_Page from "./fencer_page/page";
// import CoachPage from "./coach_page/page";
import Showcase from "../components/Showcase";
import Banner from "../components/Banner";
import { useState, useEffect } from "react";

export default function Home({ session }) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const userAgent =
			typeof window.navigator === "undefined" ? "" : navigator.userAgent;
		const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(userAgent);

		if (isMobileDevice) {
			alert(
				"For a better viewing experience, please visit this website on a computer.",
			);
			setIsMobile(true);
		}
	}, []);

	return (
		<SessionProvider session={session}>
			<div className="">
				<Hero />
				<About />
				<Showcase />
				<Features />
				<Banner />
				<Contact />
				<Footer />
				{/**/}
			</div>
		</SessionProvider>
	);
}
