import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
	return (
		<div>
			<div className="mt-20 flex justify-center">
				<Image
					src="/images/garde-wide.png"
					alt="logo"
					width={150}
					height={150}
					quality={100}
					className="mt-[100px] rounded-2xl p-1"
				/>
			</div>

			<div className="mt-5 flex justify-center text-stone-300">
				© 2024-2025 Garde™. All Rights Reserved.
			</div>
			<Link
				className="mt-5 flex justify-center text-blue-400"
				href="/privacy-policy"
			>
				Privacy Policy
			</Link>

			<div className="mt-5" />
		</div>
	);
};

export default Footer;
