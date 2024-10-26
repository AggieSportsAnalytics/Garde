/** @type {import('next').NextConfig} */

export default {
	reactStrictMode: false,
	images: {
		domains: ["images.unsplash.com", "assets.aceternity.com", "unsplash.com"],
		loader: "default",
		unoptimized: true,
	},
	// output: "export",
};
