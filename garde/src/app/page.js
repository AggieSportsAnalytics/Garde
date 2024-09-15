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

export default function Home({ session }) {
	return (
		<SessionProvider session={session}>
			<div className="">
				<Navbar />
				<Hero />
				<About />
				<Features />
				<Contact />
				<Footer />
				{/**/}
			</div>
		</SessionProvider>
	);

	//   return (
	//      <div className="">
	//          <Fencer_Page />

	//       </div>
	//   )
}
