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
		from: process.env.EMAIL_USER,
		to: email,
		subject: "Email Verification",
		text: `Click the link to verify your email: ${verificationUrl}`,
		html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
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
