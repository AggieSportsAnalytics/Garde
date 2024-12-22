import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function PUT(req) {
	try {
		const { data, email, coachName, fencerName, videoUrl } = await req.json();

		const emailResult = await sendFeedback(
			data,
			email,
			coachName,
			fencerName,
			videoUrl,
		);

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

async function sendFeedback(data, email, coachName, fencerName, videoUrl) {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	const videoSectionHTML = videoUrl
		? `
		<p>You can review the video associated with this feedback here:</p>
		<p style="text-align: center; margin: 20px 0;">
			<a href="${videoUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Video</a>
		</p>
	`
		: "";

	const videoSectionText = videoUrl
		? `
		You can review the video associated with this feedback here:
		${videoUrl}
	`
		: "";

	const mailOptions = {
		from: `"Garde" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: `Feedback From Coach ${coachName}`,
		html: `
				<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
					<div style="text-align: center; margin-bottom: 20px;">
						<img src="https://gardeai.com/images/garde-square.png" alt="Garde Logo" style="max-width: 150px; height: auto;">
					</div>
					<h2 style="color: #4CAF50; text-align: center;">Feedback from Coach ${coachName}</h2>
					<p>Dear ${fencerName},</p>
					<p>You have received new feedback from your coach via the Garde platform:</p>
					<div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #eee; border-radius: 5px; margin: 20px 0;">
						${data}
					</div>
					${videoSectionHTML}
					<p>If you have any questions or need further clarification, feel free to reach out to your coach.</p>
					<p>Best regards,<br>The Garde Team</p>
					<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
					<p style="font-size: 0.9em; color: #888; text-align: center;">
						You are receiving this email because you are enrolled in Garde. If this message was sent in error, please contact support at <a href="mailto:gardefencing@gmail.com" style="color: #4CAF50;">gardefencing@gmail.com</a>.
					</p>
				</div>
			`,
		text: `
				Feedback from Coach ${coachName}
		
				Dear ${fencerName},
		
				You have received new feedback from your coach via the Garde platform:
				${data}
	
				${videoSectionText}
		
				If you have any questions or need further clarification, feel free to reach out to your coach.
		
				Best regards,
				The Garde Team
		
				---
				You are receiving this email because you are enrolled in Garde. If this message was sent in error, please contact support at support@gardeai.com.
			`,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log("Feedback email sent: ", info.response);
		return { success: true };
	} catch (error) {
		console.error("Error sending email: ", error);
		return { success: false, error: error.message, status: 500 };
	}
}
