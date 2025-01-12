import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function PUT(req) {
	try {
		const {email } = await req.json();

		const emailResult = await sendEmailUpdate(
			email
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

async function sendEmailUpdate(email) {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	const mailOptions = {
		from: `"Garde" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Your Bout Recordings Are Ready!",
		html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://gardeai.com/images/garde-square.png" alt="Garde Logo" style="max-width: 150px; height: auto;">
                </div>
                <h2 style="color: #84cf1e; text-align: center;">Congratulations!</h2>
                <p>You can now access your bout recordings and analysis from the Davis Fencing Academy 25th Annual All-Weapons Tournament!</p>
                <p>Use <a href="[https://gardeai.com/signin]" style="color: #84cf1e; font-weight: bold;">this link</a> to visit our site and sign up for free with your email. Once your account is ready, we’ll send you a follow-up message with access to your recordings.</p>
                <p>While you wait, explore the rest of our platform! At Garde, we’re building the ultimate AI-powered fencing coach to help athletes like you train smarter. With a free account, you can test-drive features like:</p>
                <ul style="margin: 20px 0; padding-left: 20px;">
                    <li>Creating custom drills</li>
                    <li>Tracking your accuracy</li>
                    <li>Receiving detailed AI-driven feedback after each session</li>
                </ul>
                <p>All from home or your academy.</p>
                <p>As an early-stage company, we’re offering this free trial to help fencers discover the power of AI-assistance in their training. We’d love to hear your thoughts and feedback as we continue to improve.</p>
                <p>We can’t wait to start fencing with you!</p>
                <p>Best regards,<br>The Garde Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.9em; color: #888; text-align: center;">
                    You are receiving this email because you participated in the Davis Fencing Academy 25th Annual All-Weapons Tournament. If this message was sent in error, please contact support at <a href="mailto:gardefencing@gmail.com" style="color: #84cf1e;">gardefencing@gmail.com</a>.
                </p>
            </div>
		`,
		text: `
			Congratulations!
			
			You can now access your bout recordings and analysis from the Davis Fencing Academy 25th Annual All-Weapons Tournament!
			
			Use [this link] to visit our site and sign up for free with your email. Once your account is ready, we’ll send you a follow-up message with access to your recordings.
			
			While you wait, explore the rest of our platform! At Garde, we’re building the ultimate AI-powered fencing coach to help athletes like you train smarter. With a free account, you can:
			
			- Create custom drills
			- Track your accuracy
			- Receive detailed AI-driven feedback after each session
			
			All from home or your academy.
			
			As an early-stage company, we’re offering this free trial to help fencers discover the power of AI-assistance in their training. We’d love to hear your thoughts and feedback as we continue to improve.
			
			We can’t wait to start fencing with you!
			
			Best regards,
			The Garde Team
			
			---
			You are receiving this email because you participated in the Davis Fencing Academy 25th Annual All-Weapons Tournament. If this message was sent in error, please contact support at gardefencing@gmail.com.
		`,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log("Email update sent: ", info.response);
		return { success: true };
	} catch (error) {
		console.error("Error sending email: ", error);
		return { success: false, error: error.message, status: 500 };
	}
}