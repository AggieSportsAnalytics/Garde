const nodemailer = require("nodemailer");
require("dotenv").config();
const fs = require("node:fs/promises");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { SignJWT } = require("jose");

// program description for usage
const programName = "email.js";
const programDescription = `
This is a Node.js script to automate email sending to mailing list.
`;
const programVersion =
	"Version 1.0.0 2024-09-12\nCreated by Honoré Alexander and Vikram Penumarti";

// Added function name
// (async () => {

// capturing args here
async function sendEmail(email, name, body, subject, emailStructure) {
	try {
		// since this is not server code, there is no request to be received
		// const { email, name } = req.body;

		//check inputs
		if (!email || !name) {
			// This is server specific code (res is response)
			// return res.status(400).json({ error: "Email and name are required." });
			console.error("No email or name provided");
			return false;
		}
		//nodemailer transporter
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD,
			},
		});

		// Want to make this consistent with the title of the email
		const header = `
		<div style="text-align: center; margin-bottom: 20px;">
			<img src="https://gardeai.com/images/garde-square.png" alt="Garde Logo" style="max-width: 150px; height: auto;">
		</div>
		<h2 style="color: #84cf1e; text-align: center;">${subject}</h2>
		`;

		const footer = `
		<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
		<p style="font-size: 0.9em; color: #888; text-align: center;">
			You are receiving this email because you are on the Garde mailing list. If this message was sent in error, please contact support at <a href="mailto:gardefencing@gmail.com" style="color: #84cf1e;">gardefencing@gmail.com</a>.
		</p>
		`;

		// replacing ${name} in string with actual name
		const parsedBody = body.replace("${name}", name);

		// deciding what to put based off of args
		let content = header + parsedBody + footer;
		if (emailStructure === 1) {
			content = parsedBody + footer;
		} else if (emailStructure === 2) {
			content = header + parsedBody;
		} else if (emailStructure === 3) {
			content = parsedBody;
		}

		//content
		const mailOptions = {
			from: `"Garde" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: subject,
			// subject: "Your Bout Recordings Are Ready!",
			html: content,
			// replacing hardcoded html with content
			// html: `
			// <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
			//     <div style="text-align: center; margin-bottom: 20px;">
			//         <img src="https://gardeai.com/images/garde-square.png" alt="Garde Logo" style="max-width: 150px; height: auto;">
			//     </div>
			//     <h2 style="color: #84cf1e; text-align: center;">Congratulations!</h2>
			//     <p>Hi ${name}!</p>
			//     <p>You can now access your bout recordings and analysis from the Davis Fencing Academy 25th Annual All-Weapons Tournament!</p>
			//     <p>Use <a href="[https://gardeai.com/signin]" style="color: #84cf1e; font-weight: bold;">this link</a> to visit our site and sign up for free with your email. Once your account is ready, we’ll send you a follow-up message with access to your recordings.</p>
			//     <p>While you wait, explore the rest of our platform! At Garde, we’re building the ultimate AI-powered fencing coach to help athletes like you train smarter. With a free account, you can test-drive features like:</p>
			//     <ul style="margin: 20px 0; padding-left: 20px;">
			//         <li>Creating custom drills</li>
			//         <li>Tracking your accuracy</li>
			//         <li>Receiving detailed AI-driven feedback after each session</li>
			//     </ul>
			//     <p>All from home or your academy.</p>
			//     <p style="text-align: center; margin: 20px 0;">
			//         <a href="https://gardeai.com/" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Visit Our Website</a>
			//     </p>
			//     <p>As an early-stage company, we’re offering this free trial to help fencers discover the power of AI-assistance in their training. We’d love to hear your thoughts and feedback as we continue to improve.</p>
			//     <p>We can’t wait to start fencing with you!</p>
			//     <p>Best regards,<br>The Garde Team</p>
			//     <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
			//     <p style="font-size: 0.9em; color: #888; text-align: center;">
			//         You are receiving this email because you participated in the Davis Fencing Academy 25th Annual All-Weapons Tournament. If this message was sent in error, please contact support at <a href="mailto:gardefencing@gmail.com" style="color: #84cf1e;">gardefencing@gmail.com</a>.
			//     </p>
			// </div>
			// `,
		};

		//send mail
		await transporter.sendMail(mailOptions);

		// more server specific code
		//respond
		// res.status(200).json({ message: "Email sent successfully!" });

		console.log(`Sent email to ${name} at ${email}`);

		return true;
	} catch (error) {
		console.error("Error sending email:", error);

		// server specific code again
		// res
		// 	.status(500)
		// 	.json({ error: "Failed to send email. Please try again later." });

		return false;
	}
}
// });

// creating a function to get the mailing list
async function getMailingList(token) {
	try {
		const res = await fetch(`${process.env.GARDE_WORKER}/getMailingList`, {
			headers: {
				ApiKey: `Bearer ${process.env.API_KEY}`,
				Authorization: `Bearer ${token}`,
			},
		});

		if (res.status < 200 || res.status >= 300) {
			return null;
		}

		const { people } = await res.json();

		console.log("Successfully fetched mailing list");

		return people;
	} catch (error) {
		console.error(error);
		return null;
	}
}

// getting token for CF worker api authorization
async function getToken() {
	try {
		const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

		const token = await new SignJWT({ purpose: "authentication" })
			.setProtectedHeader({ alg: "HS256" })
			.setExpirationTime("25h")
			.sign(JWT_SECRET);

		console.log("Successfully signed token");

		return token;
	} catch (error) {
		console.error(error);
		return null;
	}
}

// get body of email from file (html)
async function getEmailBody(file = "./email.txt") {
	try {
		const body = await fs.readFile(file, "utf8");

		console.log("Successfully got email body");

		return body;
	} catch (err) {
		console.error("Error reading the file:", err);
		return null;
	}
}

// main function to wrap things together
async function main() {
	try {
		const argv = parseArgs();
		const token = await getToken();

		if (!token) {
			console.error("Failed to sign token");
			process.exit(1);
		}

		let people = await getMailingList(token);

		if (argv.dry) {
			console.log("Executing dry run");
			people = [
				{ name: "Vikram Penumarti", email: "vikram.penumarti@gmail.com" },
				{ name: "Honoré Alexander", email: "haalexander@ucdavis.edu" },
				{ name: "Sujash Barman", email: "sjbarman@ucdavis.edu" },
				{ name: "Rishit Das", email: "rdas@ucdavis.edu" },
			];
		}
		const body = await getEmailBody(argv.file);

		if (!people || !body || !argv.subject) {
			console.error("Mailing list, body, or subject is null, exiting");
			process.exit(1);
		}

		for (const person of people) {
			const res = await sendEmail(
				person.email,
				person.name,
				body,
				argv.subject,
				argv.email_structure,
			);

			if (!res) {
				console.error(
					`Email failed to send:\nRecipient: ${person}\nBody: ${body}\nExiting...`,
				);
				process.exit(1);
			}
		}

		console.log("Script success!");
	} catch (error) {
		console.error(error);
		console.error("Script failure");
	}
}

// parsing commandline arguments
function parseArgs() {
	const argv = yargs(hideBin(process.argv))
		.scriptName(programName)
		.usage(
			`${programDescription.trim()}\n\nUsage: email.js [options] --file FILE_NAME --subject SUBJECT --dry DRY_RUN --email_structure <1,2,or,3>`,
		)
		.version(programVersion)
		.option("file", {
			alias: "f",
			type: "string",
			description: "Path to the file",
			demandOption: false,
		})
		.option("subject", {
			alias: "s",
			type: "string",
			description: "Subject of the email",
			demandOption: true,
		})
		.option("dry", {
			alias: "d",
			type: "boolean",
			description: "Dry run of the script",
			demandOption: false,
		})
		.option("email_structure", {
			alias: "es",
			type: "number",
			description: `What combination of header and footer to use from .txt file:\n
				1) Premade header not used
				2) Premade footer not used
				3) Premade header and footer not used

				This command ONLY accepts "1, 2, or 3"
			`,
			demandOption: false,
		})
		.help().argv;

	console.log("Successfully parsed args");

	return argv;
}

// running main
main();
