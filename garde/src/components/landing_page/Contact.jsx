"use client";
import React, { useRef, useState } from "react";
import axios from "axios";
import { FaLinkedin, FaYoutube, FaInstagram } from "react-icons/fa";
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
		<section className="bg-[#faf9f5] py-12 px-6">
			{/* Floating Centered Card */}
			<div className="max-w-lg mx-auto bg-[#2c3e50] p-8 rounded-3xl shadow-2xl">
				<h2 className="text-4xl font-platypi text-white text-center mb-8">
					Interested?
				</h2>
				<h3 className="text-lg font-platypi text-white text-center mb-8">
					Fill out the form below and we will be in touch shortly!
				</h3>
				<form ref={form} onSubmit={sendEmail} className="space-y-6">
					<div>
						<label htmlFor="name" className="block text-lg text-gray-300 mb-2">
							Name
						</label>
						<input
							type="text"
							name="user_name"
							placeholder="Your Name"
							className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-300 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label htmlFor="email" className="block text-lg text-gray-300 mb-2">
							Email
						</label>
						<input
							type="email"
							name="user_email"
							placeholder="Your Email"
							className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-300 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="message"
							className="block text-lg text-gray-300 mb-2"
						>
							Message
						</label>
						<textarea
							name="message"
							placeholder="Your Message"
							rows="5"
							className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-300 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						></textarea>
					</div>
					{/* Centered Send Message Button */}
					<div className="flex justify-center">
						<button
							type="submit"
							className={`px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ${
								loading ? "bg-gray-500" : ""
							}`}
							disabled={loading}
						>
							{loading ? "Sending..." : "Send Message"}
						</button>
					</div>
					{success && <p className="text-center mt-4 text-white">{success}</p>}
				</form>

				{/* Social Media Icons */}
				<div className="flex justify-center mt-4">
					<div className="flex space-x-4">
						<div className="bg-slate-500 w-12 h-12 rounded-xl hover:bg-slate-400 flex items-center justify-center">
							<Link
								href="https://www.linkedin.com/company/gardeai/"
								target="_blank"
								rel="noreferrer"
							>
								<FaLinkedin className="w-6 h-6 text-white" />
							</Link>
						</div>
						<div className="bg-slate-500 w-12 h-12 rounded-xl hover:bg-slate-400 flex items-center justify-center">
							<Link
								href="https://www.instagram.com/garde.ai"
								target="_blank"
								rel="noreferrer"
							>
								<FaInstagram className="w-6 h-6 text-white" />
							</Link>
						</div>
						<div className="bg-slate-500 w-12 h-12 rounded-xl hover:bg-slate-400 flex items-center justify-center">
							<Link
								href="https://www.youtube.com/@gardefencing"
								target="_blank"
								rel="noreferrer"
							>
								<FaYoutube className="w-6 h-6 text-white" />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Contact;
