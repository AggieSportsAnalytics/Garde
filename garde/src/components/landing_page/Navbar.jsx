"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import "../../app/globals.css";

const navbar = () => {
	const [nav, setNav] = useState(false);
	const [shadow, setShadow] = useState(false);
	const hamburgerRef = useRef(null);

	const handleNav = () => {
		setNav(!nav);
		if (hamburgerRef.current) {
			hamburgerRef.current.checked = !nav;
		}
	};

	useEffect(() => {
		const changeShadow = () => {
			if (window.scrollY >= 90) {
				setShadow(true);
			} else {
				setShadow(false);
			}
		};

		window.addEventListener("scroll", changeShadow);
	}, []);

	return (
		<div
			className={
				shadow
					? "navbar fixed md:w-[850px] w-[340px] mt-4 md:mt-12 left-1/2 transform -translate-x-1/2 h-16 z-[100] rounded-full duration-500"
					: "fixed md:w-[850px] w-[340px] mt-4 md:mt-12 left-1/2 transform -translate-x-1/2 h-16 z-[100]"
			}
		>
			<div className="flex justify-between items-center w-full h-full px-4">
				<Link href="/#home">
					<Image
						src="/images/garde-wide.png"
						alt="logo"
						width={120}
						height={120}
						quality={100}
						className="rounded-3xl hover:animate-pulse object-contain"
					/>
				</Link>
				<div className="hidden md:flex items-center justify-center space-x-4">
					<Link href="/#about">
						<span className="text-sm text-[#6e7273] hover:text-[#5bb1d5] transition-colors duration-500">
							About
						</span>
					</Link>
					<Link href="/#features">
						<span className="text-sm text-[#6e7273] hover:text-[#5bb1d5] transition-colors duration-500">
							Features
						</span>
					</Link>
					<Link href="/#contact">
						<span className="text-sm text-[#6e7273] hover:text-[#5bb1d5] transition-colors duration-500">
							Contact
						</span>
					</Link>
					<Link href="/fencer_signin">
						<button className="login text-sm hover:text-[#5bb1d5] transition-colors duration-500">
							Fencer Login/Signup
						</button>
					</Link>
					<Link href="/coach_signin">
						<button className="button text-sm">
							<span className="button-content font-bold">
								Coach Login/Signup
							</span>
						</button>
					</Link>
				</div>
				<div className="md:hidden flex items-center">
					<label className="hamburger">
						<input type="checkbox" ref={hamburgerRef} onClick={handleNav} />
						<svg viewBox="0 0 32 32">
							<path
								className="line line-top-bottom"
								d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
							></path>
							<path className="line" d="M7 16 27 16"></path>
						</svg>
					</label>
				</div>
			</div>

			<div
				className={nav ? "md:hidden fixed right-0 top-0 h-screen" : "hidden"}
			>
				<div
					className={
						nav
							? "mt-20 navbar fixed right-0 top-0 w-[75%] sm:w-[60%] md:w-[45%] h-[500px] rounded-lg bg-[#121317] p-10 transition-transform duration-500 transform translate-x-0"
							: "fixed right-[-100%] top-0 p-10 transition-transform duration-500 transform translate-x-full"
					}
				>
					<div className="text-center py-2 mx-auto mb-6 flex flex-col">
						<ul className="space-y-2">
							<Link href="/#about">
								<li className="text-[17px] text-[#6e7273] hover:text-[#ac4bac] transition-colors duration-500">
									About
								</li>
							</Link>
							<Link href="/#features">
								<li className="text-[17px] text-[#6e7273] hover:text-[#ac4bac] transition-colors duration-500">
									Features
								</li>
							</Link>
							<Link href="/#contact">
								<li className="text-[17px] text-[#6e7273] hover:text-[#ac4bac] transition-colors duration-500">
									Contact
								</li>
							</Link>
							<button className="login mt-4 hover:text-[#ac4bac] transition-colors duration-500 text-md">
								Login
							</button>
							<button className="button mt-2">
								<span className="button-content font-bold">Get Started</span>
							</button>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default navbar;
