import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function PUT(req) {
	try {
		const { message, email, name } = await req.json();

		const emailResult = await sendInfo(message, email, name);

		if (!emailResult.success) {
			return NextResponse.json(
				{ error: emailResult.error },
				{ status: emailResult.status },
			);
		}

		const nextResponse = NextResponse.json(
			{
				message: "Successfully sent email",
			},
			{ status: 200 },
		);

		return nextResponse;
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: error.response?.data?.error || "Internal server error" },
			{ status: error.response?.status || 500 },
		);
	}
}

async function sendInfo(message, email, name) {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: "gardefencing@gmail.com",
		subject: "Contact Inquiry",
		html: `
			<p><strong>Name:</strong> ${name}</p>
			<p><strong>Email:</strong> ${email}</p>
			<p><strong>Message:</strong></p>
			<p>${message}</p>
		`,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log("Verification email sent: ", info.response);
		return { success: true };
	} catch (error) {
		console.error("Error sending email: ", error);
		return { success: false, error: error.message, status: 500 };
	}
}
