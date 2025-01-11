import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(req) {
	try {
		const { email, type } = await req.json();

		const emailResult = await sendForgotEmail(email, type);

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

async function sendForgotEmail(email, type) {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	const verificationToken = jwt.sign({ email: email, type: type }, JWT_SECRET, {
		expiresIn: "15m",
	});

	const verificationUrl = `${BASE_URL}/forgot/verified?token=${verificationToken}`;

	const mailOptions = {
		from: `"Garde" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Reset Your Password",
		html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://gardeai.com/images/garde-square.png" alt="Garde Logo" style="max-width: 150px; height: auto;">
                </div>
                <h2 style="color: #4CAF50; text-align: center;">Reset Your Password</h2>
                <p>Hi there,</p>
                <p>We received a request to reset your password for your Garde account. If you did not request this, please ignore this email. Otherwise, you can reset your password using the button below:</p>
                <p style="text-align: center;">
                    <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Your Password</a>
                </p>
                <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
                <p style="word-break: break-all; color: #555;">${verificationUrl}</p>
                <p>This link will expire in 15 minutes for your security.</p>
                <p>Thank you,<br>The Garde Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.9em; color: #888; text-align: center;">
                    If you did not request a password reset, please ignore this email or contact our support team if you have concerns.
                </p>
            </div>
        `,
		text: `
            Reset Your Password
        
            We received a request to reset your password for your Garde account. If you did not request this, please ignore this email. Otherwise, you can reset your password using the link below:
        
            Reset Your Password: ${verificationUrl}
        
            This link will expire in 15 minutes for your security.
        
            If you did not request this, please contact our support team.
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
