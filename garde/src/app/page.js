"use client";

import Navbar from "../components/Navbar";
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
import Fencer_Page from "./fencer_page/page";
import CoachPage from "./coach_page/page";

export default function Home({ session }) {
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
