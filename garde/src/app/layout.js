import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Capacitor } from "@capacitor/core";

const inter = Inter({ subsets: ["latin"] });
import { GoogleOAuthProvider } from "@react-oauth/google";
import Providers from "./providers";

export const metadata = {
	title: "Garde",
	description:
		"Smart Coaching, Smarter Fencing. Garde uses AI to deliver real-time feedback for fencers and video/analytics dashboards for coaches, elevating performance.",
	metadataBase: new URL("https://gardeai.com"),
	robots: {
		index: true,
		follow: true,
		nocache: true,
	},
	openGraph: {
		title: "Garde",
		description:
			"Smart Coaching, Smarter Fencing. AI-powered tools for real-time feedback and analytics, helping fencers and coaches elevate performance.",
		url: "https://gardeai.com",
		siteName: "Garde",
		images: [
			{
				url: "/images/garde-square.png",
				width: 1200,
				height: 630,
				alt: "Garde Logo",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Garde",
		description:
			"Smart Coaching, Smarter Fencing. AI-powered tools for real-time feedback and analytics, helping fencers and coaches elevate performance.",
		images: ["/images/garde-square.png"],
	},
};

export const viewport = {
	themeColor: "#ffffff",
};

if (Capacitor.isNativePlatform()) {
	window.location.href = "https://mygardeapp.com";
}

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link rel="manifest" href="/site.webmanifest" />
				<Script
					src="https://challenges.cloudflare.com/turnstile/v0/api.js"
					async
					defer
				/>
			</head>
			<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
				<body className={inter.className}>
					<Providers>{children}</Providers>
				</body>
			</GoogleOAuthProvider>
		</html>
	);
}
