import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
	return (
		<footer className="bg-black py-4">
			<div className="flex justify-center">
				<Image
					src="/images/garde-wide.png"
					alt="logo"
					width={150}
					height={150}
					quality={100}
					className="mt-4 rounded-2xl p-1 bg-black"
				/>
			</div>

			<div className="mt-2 flex justify-center text-stone-300">
				© 2024-2025 Garde™. All Rights Reserved.
			</div>
			<Link
				className="py-2 flex justify-center text-blue-400"
				href="/privacy-policy"
			>
				Privacy Policy
			</Link>
			<div className="flex justify-center">
				<a href="mailto:support@gardeai.com" className="py-1 text-blue-400">
					support@gardeai.com
				</a>
			</div>
		</footer>
	);
};

export default Footer;
