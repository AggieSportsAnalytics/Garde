import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";

export default function TurnstileVerificationModal() {
	const [isVerified, setIsVerified] = useState(true);

	useEffect(() => {
		const getVerification = async () => {
			try {
				const res = await axios.get("/api/get-token", {
					headers: {
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
					},
					withCredentials: true,
				});
				const { captchaVerified } = res.data;

				if (!captchaVerified) {
					setIsVerified(false);
				}
			} catch (error) {
				console.error(error);
				setIsVerified(false);
			}
		};

		window.callback = async (token) => {
			try {
				await axios.put(
					"/api/siteverify",
					{ token: token },
					{
						headers: {
							Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
						},
					},
				);

				setIsVerified(true);
			} catch (error) {
				console.error(error);
			}
		};

		getVerification();
	}, []);

	return (
		<Modal
			isOpen={!isVerified}
			contentLabel="Verify You Are Human"
			style={{
				overlay: {
					backgroundColor: "rgba(0, 0, 0, 0.75)",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					zIndex: 9999,
				},
				content: {
					position: "relative",
					margin: "0",
					padding: "2rem",
					width: "400px",
					maxWidth: "90%",
					textAlign: "center",
					borderRadius: "10px",
					inset: "auto",
				},
			}}
		>
			<div className="text-center">
				<h2 className="text-lg font-bold mb-4">Please Verify to Proceed</h2>
				<div
					className="cf-turnstile flex justify-center pt-4"
					data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
					data-callback="callback"
				/>
			</div>
		</Modal>
	);
}
