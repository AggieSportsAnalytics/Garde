"use client";

import { Inter } from "next/font/google";

import "./globals.css";

// import navbar from "../components/Navbar";
// import CoachPage from "./coach_page/page";
const inter = Inter({ subsets: ["latin"] });
import { GoogleOAuthProvider } from "@react-oauth/google";

// export const metadata = {
// 	title: "Garde",
// 	description: "Fencing Coach powered by AI/ML",
// };

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<GoogleOAuthProvider clientId="863304397120-tf8iocednab0668so0qbrg837s6qvbuo.apps.googleusercontent.com">
				<body className={inter.className}>{children}</body>
			</GoogleOAuthProvider>
		</html>
	);
}
