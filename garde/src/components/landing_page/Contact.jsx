"use client";
import React, { useRef, useState } from "react";
import axios from "axios";
import { FaLinkedin, FaYoutube, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";

const Contact = () => {
	const form = useRef();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState("");

	const sendEmail = async (e) => {
		e.preventDefault();
		setLoading(true);

		// Collect form data
		const formData = {
			name: form.current.user_name.value,
			email: form.current.user_email.value,
			message: form.current.message.value,
		};

		try {
			// Send a POST request to the backend
			const response = await axios.put("/api/contact_us", formData, {
				headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}` },
				withCredentials: true,
			});

			setSuccess("Email sent successfully!");
			form.current.reset();
			setTimeout(() => setSuccess(""), 2000);
		} catch (error) {
			console.error("Error sending email:", error);
			setSuccess("Error sending email. Please try again.");
		}

		setLoading(false);
	};

	return (
		<div
			id="contact"
			className="w-full px-0 py-16 bg-slate-50 border-t border-slate-100"
		>
			<div className="max-w-7xl mx-auto px-6">
				<div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-emerald-100 transform hover:scale-[1.01] transition-all duration-300">
					<div className="px-8 py-10 md:px-16 md:py-12">
						<h2 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-3 font-mono">
							Interested?
						</h2>
						<p className="text-slate-600 text-center max-w-lg mx-auto mb-10 font-mono">
							Fill out the form below and we will be in touch shortly!
						</p>

						<form
							ref={form}
							onSubmit={sendEmail}
							className="space-y-6 max-w-4xl mx-auto font-mono"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label htmlFor="name" className="block text-slate-700 mb-2">
										Name
									</label>
									<input
										name="user_name"
										required
										type="text"
										id="name"
										placeholder="Your Name"
										className="w-full bg-slate-50 border border-slate-200 rounded-md p-4 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
									/>
								</div>

								<div>
									<label htmlFor="email" className="block text-slate-700 mb-2">
										Email
									</label>
									<input
										type="email"
										id="email"
										name="user_email"
										required
										placeholder="Your Email"
										className="w-full bg-slate-50 border border-slate-200 rounded-md p-4 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
									/>
								</div>
							</div>

							<div>
								<label htmlFor="message" className="block text-slate-700 mb-2">
									Message
								</label>
								<textarea
									name="message"
									required
									id="message"
									placeholder="Your Message"
									rows="5"
									className="w-full bg-slate-50 border border-slate-200 rounded-md p-4 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none font-mono"
								/>
							</div>

							<div className="flex justify-center mt-8">
								<motion.button
									type="submit"
									className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-md font-medium text-lg transition-all font-tiempos"
									whileHover={{
										y: -2,
										boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.5)",
									}}
									whileTap={{ scale: 0.98 }}
									disabled={loading}
								>
									{loading ? "Sending..." : "Send Message"}
								</motion.button>
							</div>
							{success && (
								<p className="text-center mt-4 text-black">{success}</p>
							)}
						</form>

						{/* Social media links */}
						<div className="flex justify-center mt-10 space-x-6">
							<Link
								href="https://www.linkedin.com/company/gardeai"
								target="_blank"
								rel="noreferrer"
								className="bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 p-3 rounded-md transition-all"
							>
								<FaLinkedin size={25} />
							</Link>
							<Link
								href="https://www.instagram.com/garde.ai"
								target="_blank"
								rel="noreferrer"
								className="bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 p-3 rounded-md transition-all"
							>
								<FaInstagram size={25} />
							</Link>
							<Link
								href="https://www.youtube.com/@gardefencing"
								target="_blank"
								rel="noreferrer"
								className="bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 p-3 rounded-md transition-all"
							>
								<FaYoutube size={25} />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Contact;
