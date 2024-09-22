const bcrypt = require("bcryptjs");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Set the JWT secret (ensure you have this in your .env.local file)
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
	const workerUrl = "https://garde.gardefencing.workers.dev"; // Cloudflare Worker URL

	try {
		// Parse request body
		const { email, password, name, queryType, type } = await req.json();

		// Hash the user's password
		const hashedPassword = await hashPassword(password);

		// Generate a unique ID for the new user
		const id = uuidv4();

		// Create query data to send to the Cloudflare worker
		const queryData = {
			queryType: queryType,
			name: name,
			email: email,
			password: hashedPassword,
			id: id,
		};

		// Send user data to the worker
		const response = await axios.post(workerUrl, queryData, {
			headers: { "Content-Type": "application/json" },
		});

		if (response.status !== 200) {
			throw new Error(response.data.error);
		}

		// Send verification email
		const emailResult = sendVerificationEmail(email, type);

		if (!emailResult.success) {
			return NextResponse.json({ error: emailResult.error }, { status: 500 });
		}

		const data = response.data;

		// If successful, generate JWT token and set as cookie
		if (data?.success) {
			const token = jwt.sign(
				{
					id: id,
					name: name,
					email: email,
					type: type,
				},
				JWT_SECRET,
				{ expiresIn: "1h" },
			);

			const nextResponse = NextResponse.json({ id: id, name: name });
			nextResponse.cookies.set("token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 60 * 60, // 1 hour
				path: "/",
				sameSite: "Strict",
			});

			return nextResponse;
		}

		// If something goes wrong
		return NextResponse.json({ error: "Signup failed" }, { status: 400 });
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// Function to hash the user's password
async function hashPassword(plainPassword) {
	const saltRounds = 10; // Number of hashing rounds
	const salt = await bcrypt.genSalt(saltRounds); // Generate salt
	const hashedPassword = await bcrypt.hash(plainPassword, salt); // Hash the password with salt
	return hashedPassword;
}

function sendVerificationEmail(email, type) {
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

	const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: "Email Verification",
		text: `Click the link to verify your email: ${verificationUrl}`,
		html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending email: ", error);
			// Return an error to the parent function for handling
			return { success: false, error: error.message };
		}
		console.log("Verification email sent: ", info.response);
		return { success: true };
	});

	return { success: true };
}
