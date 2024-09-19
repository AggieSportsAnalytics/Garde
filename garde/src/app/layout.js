"use client";

import { Inter } from "next/font/google";

import "./globals.css";

// import navbar from "../components/Navbar";
// import CoachPage from "./coach_page/page";
const inter = Inter({ subsets: ["latin"] });
import { UserProvider } from "../components/UserContext";

// export const metadata = {
// 	title: "Garde",
// 	description: "Fencing Coach powered by AI/ML",
// };

export default function RootLayout({ children }) {
	return (
		<UserProvider>
			<html lang="en">
				<body className={inter.className}>{children}</body>
			</html>
		</UserProvider>
	);
}
