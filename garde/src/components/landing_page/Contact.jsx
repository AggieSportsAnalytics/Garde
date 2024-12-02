"use client";
import React, { useRef, useState } from "react";
import axios from "axios";
import { FaLinkedin, FaYoutube, FaInstagram } from "react-icons/fa";

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
			const response = await axios.put("/api/contact_us", formData);

			if (response.status === 200) {
				setSuccess("Email sent successfully!");
				form.current.reset();
				setTimeout(() => setSuccess(""), 2000);
			}
		} catch (error) {
			console.error("Error sending email:", error);
			setSuccess("Error sending email. Please try again.");
		}

		setLoading(false);
	};

	return (
		<>
			<div className="" id="contact">
				<div className="mt-16">
					<h1 className="text-center text-white text-4xl md:text-6xl font-extrabold font-platypi">
						Contact Us.
					</h1>
				</div>

				<div className="flex justify-center mt-10 px-4">
					<h4 className="text-white font-platypi mt-5 text-base md:text-xl text-center">
						If you are a coach and want to use Garde, please fill out the form
						below. <br /> We will get in touch with you soon.
					</h4>
				</div>
			</div>

			<div className="flex justify-center mt-10 px-4">
				<div className="bg-gray-700 rounded-xl w-full max-w-lg md:max-w-xl lg:max-w-2xl p-6">
					<form ref={form} onSubmit={sendEmail}>
						<div className="flex flex-col">
							<input
								type="text"
								name="user_name"
								className="h-14 w-full text-lg rounded-xl block p-2.5 bg-gray-800 text-white mt-2"
								placeholder="Name"
								required
							/>
							<input
								type="email"
								name="user_email"
								className="h-14 w-full text-lg rounded-xl block p-2.5 bg-gray-800 text-white mt-4"
								placeholder="Email"
								required
							/>
							<textarea
								name="message"
								className="h-32 md:h-48 w-full bg-gray-800 border border-gray-600 text-lg rounded-xl block p-2.5 text-white mt-4"
								placeholder="Message"
								required
							/>
							<input
								type="submit"
								className={`h-12 text-lg p-2.5 rounded-xl w-full mt-6 font-bold ${
									loading
										? "bg-gray-500"
										: "bg-gray-900 hover:bg-gray-800 text-gray-300"
								}`}
								value={loading ? "Sending..." : "Submit"}
								disabled={loading}
							/>
							{success && (
								<p className="text-center mt-4 text-white">{success}</p>
							)}
						</div>
					</form>

					{/* Social Media Icons */}
					<div className="flex justify-center space-x-4 mt-6">
						<div className="bg-slate-500 w-12 h-12 rounded-xl hover:bg-slate-400 flex items-center justify-center">
							<a
								href="https://www.linkedin.com/company/gardeai/"
								target="_blank"
								rel="noreferrer"
							>
								<FaLinkedin className="w-6 h-6 text-white" />
							</a>
						</div>
						<div className="bg-slate-500 w-12 h-12 rounded-xl hover:bg-slate-400 flex items-center justify-center">
							<a
								href="https://www.instagram.com/garde.ai"
								target="_blank"
								rel="noreferrer"
							>
								<FaInstagram className="w-6 h-6 text-white" />
							</a>
						</div>
						<div className="bg-slate-500 w-12 h-12 rounded-xl hover:bg-slate-400 flex items-center justify-center">
							<a
								href="https://www.youtube.com/@gardefencing"
								target="_blank"
								rel="noreferrer"
							>
								<FaYoutube className="w-6 h-6 text-white" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Contact;
