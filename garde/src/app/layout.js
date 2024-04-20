import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'



import "./globals.css";

import navbar from "../components/Navbar";
import CoachPage from "./coach_page/page"
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Garde",
  description: "Fencing Coach powered by AI/ML",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
