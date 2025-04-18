"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import "../../app/globals.css";
import { motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { BiLogIn, BiLogOut } from "react-icons/bi";
import { useRouter } from "next/navigation";
import checkAuth from "@/src/app/hooks/jwt_verify";
import renewSession from "@/src/app/hooks/renew_session";
import axios from "axios";

const Navbar = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [loggedIn, setLoggedIn] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const initPage = async () => {
			try {
				const decoded = await checkAuth(router, "signin", "", true);

				if (decoded) {
					setLoggedIn(true);
				} else {
					setLoggedIn(false);
				}

				renewSession(decoded).then((val) => {
					if (!val) {
						setLoggedIn(false);
					}
				});
			} catch (error) {
				console.error(error);
			}
		};

		initPage();
	}, []);

	const handleLogout = async () => {
		try {
			await axios.get("/api/logout", {
				headers: {
					Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
				},
				withCredentials: true,
			});
			setLoggedIn(false);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<motion.nav
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ type: "spring", stiffness: 100 }}
			className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between p-4 bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg text-white"
		>
			{/* Logo or Brand Name */}
			<Link href="/" className="flex items-center">
				<Image
					src="/images/garde-square.png" // Ensure this path is correct
					alt="Garde Logo"
					width={55} // Adjust width as needed
					height={55} // Adjust height as needed
					className="object-contain rounded-xl"
				/>
			</Link>

			{/* Menu Section */}
			<div className="ml-auto flex items-center gap-4">
				{/* Desktop Menu */}
				<div className="hidden md:flex items-center gap-6">
					<Link
						href="/tournaments"
						className="flex items-center gap-2 hover:text-blue-300 transition-colors duration-200"
					>
						<FaTrophy size={20} className="text-slate-200" />
						<span className="text-slate-200">Tournaments</span>
					</Link>

					{loggedIn ? (
						<button
							onClick={handleLogout}
							type="button"
							className="flex hover:text-blue-300 transition-colors duration-200"
						>
							<BiLogOut size={20} className="text-slate-200" />
							<span className="text-slate-200 ml-2">Logout</span>
						</button>
					) : (
						<a
							href="/signin"
							className="flex hover:text-blue-300 transition-colors duration-200"
						>
							<BiLogIn size={20} className="text-slate-200" />
							<span className="text-slate-200 ml-2">Sign-In/Sign-Up</span>
						</a>
					)}
				</div>

				{/* Mobile Menu Button */}
				<div className="md:hidden">
					<div
						className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200 cursor-pointer"
						onClick={() => setMenuOpen((prev) => !prev)}
					>
						<div className="space-y-1">
							<div className="w-6 h-1 bg-slate-400" />
							<div className="w-6 h-1 bg-slate-400" />
							<div className="w-6 h-1 bg-slate-400" />
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
					<Link
						href="/tournaments"
						className="flex items-center gap-2 w-full text-left text-white hover:text-blue-500 mb-4 transition-colors duration-200"
					>
						<FaTrophy size={20} />
						<span>Tournaments</span>
					</Link>
					{loggedIn ? (
						<button
							onClick={handleLogout}
							type="button"
							className="flex hover:text-blue-300 transition-colors duration-200"
						>
							<BiLogOut size={20} />
							<span className="ml-2">Logout</span>
						</button>
					) : (
						<a
							href="/signin"
							className="flex hover:text-blue-500 transition-colors duration-200"
						>
							<BiLogIn size={20} />
							<span className="text-white ml-2 hover:text-blue-500">
								Sign-In/Sign-Up
							</span>
						</a>
					)}
				</motion.div>
			)}
		</motion.nav>
	);
};

export default Navbar;
