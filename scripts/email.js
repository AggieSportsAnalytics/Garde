const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());

app.put("/send-feedback", async (req, res) => {
	try {
		const { email, name } = req.body;

		//check inputs
		if (!email || !name) {
			return res.status(400).json({ error: "Email and name are required." });
		}
		//nodemailer transporter
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
		//content
		const mailOptions = {
			from: `"Garde" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: "Your Bout Recordings Are Ready!",
			html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://gardeai.com/images/garde-square.png" alt="Garde Logo" style="max-width: 150px; height: auto;">
                </div>
                <h2 style="color: #84cf1e; text-align: center;">Congratulations!</h2>
                <p>Hi ${name}!</p>
                <p>You can now access your bout recordings and analysis from the Davis Fencing Academy 25th Annual All-Weapons Tournament!</p>
                <p>Use <a href="[https://gardeai.com/signin]" style="color: #84cf1e; font-weight: bold;">this link</a> to visit our site and sign up for free with your email. Once your account is ready, we’ll send you a follow-up message with access to your recordings.</p>
                <p>While you wait, explore the rest of our platform! At Garde, we’re building the ultimate AI-powered fencing coach to help athletes like you train smarter. With a free account, you can test-drive features like:</p>
                <ul style="margin: 20px 0; padding-left: 20px;">
                    <li>Creating custom drills</li>
                    <li>Tracking your accuracy</li>
                    <li>Receiving detailed AI-driven feedback after each session</li>
                </ul>
                <p>All from home or your academy.</p>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="https://gardeai.com/" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Visit Our Website</a>
                </p>
                <p>As an early-stage company, we’re offering this free trial to help fencers discover the power of AI-assistance in their training. We’d love to hear your thoughts and feedback as we continue to improve.</p>
                <p>We can’t wait to start fencing with you!</p>
                <p>Best regards,<br>The Garde Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.9em; color: #888; text-align: center;">
                    You are receiving this email because you participated in the Davis Fencing Academy 25th Annual All-Weapons Tournament. If this message was sent in error, please contact support at <a href="mailto:gardefencing@gmail.com" style="color: #84cf1e;">gardefencing@gmail.com</a>.
                </p>
            </div>
            `,
		};

		//send mail
		await transporter.sendMail(mailOptions);

		//respond
		res.status(200).json({ message: "Email sent successfully!" });
	} catch (error) {
		console.error("Error sending email:", error);
		res.status(500).json({ error: "Failed to send email. Please try again later." });
	}
});
//start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
