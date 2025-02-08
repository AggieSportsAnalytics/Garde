import React, { useState } from 'react'
import Image from "next/image";
import Link from 'next/link';
import { Button } from '../ui/button';
import "../../app/globals.css"
import { motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { BiLogIn, BiLogOut } from "react-icons/bi";

const Navbar = ({ setLoggedIn, loggedIn }) => {
	const [menuOpen, setMenuOpen] = useState(false);

	const handleAuth = async () => {
		if (loggedIn) {
			// Handle logout logic
			setLoggedIn(false);
		} else {
			// Redirect to sign-in page
		}
	};

	return (
		<motion.nav
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ type: "spring", stiffness: 100 }}
			className="sticky top-0 z-50 flex items-center justify-between backdrop-blur-sm bg-[#1a2b3b] text-white p-4 border-b border-white/10"
		>
			{/* Logo or Brand Name */}
			<Link href="/" className="flex items-center">
				<Image
					src="/images/garde-wide.png" // Ensure this path is correct
					alt="Garde Logo"
					width={90} // Adjust width as needed
					height={30} // Adjust height as needed
					className="object-contain"
				/>
			</Link>

			{/* Menu Section */}
			<div className="ml-auto flex items-center gap-4">
				{/* Desktop Menu */}
				<div className="hidden md:flex items-center gap-6">
					<Link href="/tournaments/my-tournaments" className="flex items-center gap-2 hover:text-blue-300 transition-colors duration-200">
						<FaTrophy size={20} />
						<span>My Tournaments</span>
					</Link>
					<div
						onClick={handleAuth}
						className="flex items-center gap-2 cursor-pointer hover:text-blue-300 transition-colors duration-200"
					>
						{loggedIn ? (
							<>
								<BiLogOut size={20} />
								<span>Logout</span>
							</>
						) : (
							<>
								<BiLogIn size={20} />
								<span>Sign-In/Sign-Up</span>
							</>
						)}
					</div>
				</div>

				{/* Mobile Menu Button */}
				<div className="md:hidden">
					<div
						className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200 cursor-pointer"
						onClick={() => setMenuOpen((prev) => !prev)}
					>
						<div className="space-y-1">
							<div className="w-6 h-1 bg-white" />
							<div className="w-6 h-1 bg-white" />
							<div className="w-6 h-1 bg-white" />
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Menu Dropdown */}
			{menuOpen && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					className="absolute top-full right-0 w-64 bg-gray-800/95 backdrop-blur-sm p-4 rounded-lg shadow-lg md:hidden z-50 mt-2"
				>
					<Link href="/tournaments/my-tournaments" className="flex items-center gap-2 w-full text-left text-white hover:text-blue-500 mb-4 transition-colors duration-200">
						<FaTrophy size={20} />
						<span>My Tournaments</span>
					</Link>
					<div
						onClick={handleAuth}
						className="flex items-center gap-2 w-full text-left text-white hover:text-blue-500 transition-colors duration-200 cursor-pointer"
					>
						{loggedIn ? (
							<>
								<BiLogOut size={20} />
								<span>Logout</span>
							</>
						) : (
							<>
								<BiLogIn size={20} />
								<span>Sign-In/Sign-Up</span>
							</>
						)}
					</div>
				</motion.div>
			)}
		</motion.nav>
	);
}

export default Navbar;
