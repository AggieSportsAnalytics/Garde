"use client";

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function RootLayout({ children }) {
	const CLIENT_ID =
		process.env.NODE_ENV === "development"
			? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_DEV
			: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_PROD;

	return (
		<html lang="en">
			<GoogleOAuthProvider clientId={CLIENT_ID}>
				<body className={inter.className}>{children}</body>
			</GoogleOAuthProvider>
		</html>
	);
}
