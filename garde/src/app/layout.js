import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata = {
	title: "Garde",
	description: "Enhance your fencing skills with AI-powered insights.",
	metadataBase: new URL("https://gardeai.com"),
	robots: {
		index: true,
		follow: true,
		nocache: true,
	},
	openGraph: {
		title: "Garde",
		description: "Enhance your fencing skills with AI-powered insights.",
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
		description: "Enhance your fencing skills with AI-powered insights.",
		images: ["/images/garde-square.png"],
	},
};

export const viewport = {
	themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
	const CLIENT_ID =
		process.env.NODE_ENV === "development"
			? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_DEV
			: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_PROD;

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
			</head>
			<GoogleOAuthProvider clientId={CLIENT_ID}>
				<body className={inter.className}>{children}</body>
			</GoogleOAuthProvider>
		</html>
	);
}
