const bcrypt = require("bcryptjs");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Set the JWT secret (ensure you have this in your .env.local file)
const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(req) {
	const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}/auth`;

	try {
		// Parse request body
		const { email, password, name, type } = await req.json();

		// Hash the user's password
		const hashedPassword = await hashPassword(password);

		// Generate a unique ID for the new user
		const id = uuidv4();

		// Create query data to send to the Cloudflare worker
		const queryData = {
			type: type,
			name: name,
			email: email,
			password: hashedPassword,
			id: id,
		};

		// Send user data to the worker
		const response = await axios.post(workerUrl, queryData, {
			headers: { "Content-Type": "application/json" },
		});

		// Send verification email
		const emailResult = await sendVerificationEmail(email, type); // Add 'await'

		if (!emailResult.success) {
			return NextResponse.json(
				{ error: emailResult.error },
				{ status: emailResult.status },
			);
		}

		const data = response.data;

		// If successful, generate JWT token and set as cookie
		if (data?.message) {
			const nextResponse = NextResponse.json(
				{
					message: "Successfully signed up",
				},
				{ status: 201 },
			);

			return nextResponse;
		}

		// If something goes wrong
		return NextResponse.json({ error: "Signup failed" }, { status: 400 });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: error.response?.data?.error || "Internal server error" },
			{ status: error.response?.status || 500 },
		);
	}
}

// Function to hash the user's password
async function hashPassword(plainPassword) {
	const saltRounds = 10; // Number of hashing rounds
	const salt = await bcrypt.genSalt(saltRounds); // Generate salt
	const hashedPassword = await bcrypt.hash(plainPassword, salt); // Hash the password with salt
	return hashedPassword;
}

async function sendVerificationEmail(email, type) {
	const transporter = nodemailer.createTransport({
		service: "gmail", // or another email service
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	const verificationToken = jwt.sign({ email: email, type: type }, JWT_SECRET, {
		expiresIn: "1h",
	});

	const verificationUrl = `${BASE_URL}/verify-email?token=${verificationToken}`;

	const mailOptions = {
		from: `"Garde" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Verify Your Email Address",
		html: `
			<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
				<div style="text-align: center; margin-bottom: 20px;">
					<img src="https://gardeai.com/images/garde-square.png" alt="Garde Logo" style="max-width: 150px; height: auto;">
				</div>
				<h2 style="color: #4CAF50; text-align: center;">Welcome to Garde!</h2>
				<p>Hi there,</p>
				<p>Thank you for signing up for Garde. We're excited to have you on board! Please verify your email address to activate your account.</p>
				<p style="text-align: center;">
					<a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Your Email</a>
				</p>
				<p>If the button above doesn't work, copy and paste the following link into your browser:</p>
				<p style="word-break: break-all; color: #555;">${verificationUrl}</p>
				<p>Thank you,<br>The Garde Team</p>
				<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
				<p style="font-size: 0.9em; color: #888; text-align: center;">
					You are receiving this email because you signed up for Garde. If you did not sign up, please ignore this email.
				</p>
			</div>
		`,
		text: `
			Welcome to Garde!
	
			Thank you for signing up for Garde. Please verify your email address to activate your account.
	
			Verify Your Email: ${verificationUrl}
	
			If you did not sign up for Garde, please ignore this email.
		`,
	};

	// Send the email using async/await
	try {
		const info = await transporter.sendMail(mailOptions);
		console.log("Verification email sent: ", info.response);
		return { success: true };
	} catch (error) {
		console.error("Error sending email: ", error);
		return { success: false, error: error.message, status: 500 };
	}
}
