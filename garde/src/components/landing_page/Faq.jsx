import { useState } from "react";

const faqs = [
	{
		question: "What is Garde?",
		answer:
			"Garde is an AI-driven coaching system designed to transform athletic performance across sports, starting with fencing. It offers instant, data-backed feedback on bout performance to help athletes refine their technique and strategy. Garde also delivers video and analytics dashboards that empower coaches with actionable insights to elevate training programs.",
	},
	{
		question: "How does Garde work?",
		answer:
			"Users upload video recordings of their athletic performances to the Garde platform, where proprietary AI models analyze every movement and decision in real time. Within moments, athletes receive detailed feedback on technical errors, tactical opportunities, and physical metrics, all presented through intuitive visualizations.",
	},
	{
		question: "How do I get started with Garde?",
		answer: (
			<>
				Visit{" "}
				<a
					href="https://gardeai.com"
					target="_blank"
					rel="noreferrer"
					className="text-emerald-600 underline hover:text-emerald-800"
				>
					gardeai.com
				</a>{" "}
				and click 'Sign Up' to create an account. Upload your performance video
				through the 'Upload Your Bout' interface to receive instant AI-driven
				feedback and access detailed dashboards.
			</>
		),
	},
	{
		question: "How can I contact Garde for support or inquiries?",
		answer: (
			<>
				For support or questions, email{" "}
				<a
					href="mailto:support@gardeai.com"
					className="text-emerald-600 underline hover:text-emerald-800"
				>
					support@gardeai.com
				</a>{" "}
				or complete the 'Interested?' form at the bottom of our homepage. Our
				team will reach out promptly.
			</>
		),
	},
	{
		question: "What are the core features of Garde?",
		answer:
			"AdvancedReasoning: Suggests optimal tactical decisions during competition. Vision Analysis: Captures and interprets biomechanical insights like timing and angles. Speech-to-Speech: Provides dynamic, voice-based coaching cues mid-practice. Pose Mapping: Tracks posture and limb positioning to improve form, efficiency, and safety.",
	},
	{
		question: "Does Garde have a mobile app?",
		answer:
			"Garde is currently developing a mobile app, which will be available soon to make accessing AI-driven feedback even more convenient for athletes and coaches.",
	},
	{
		question: "Where is Garde based and when was it founded?",
		answer:
			"Garde is headquartered in Davis, California, and was founded in 2024 as a privately held software company focused on AI-powered sports technology.",
	},
];

function FAQSection() {
	const [openIndex, setOpenIndex] = useState(null);

	const toggle = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<section className="max-w-4xl mx-auto px-6 pb-12">
			<h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
				Frequently Asked Questions
			</h2>
			<div className="space-y-4">
				{faqs.map((faq, index) => (
					<div key={index} className="border rounded-lg shadow-sm">
						<button
							className="w-full text-left p-4 flex justify-between items-center focus:outline-none"
							onClick={() => toggle(index)}
						>
							<span className="font-semibold text-gray-700">
								{faq.question}
							</span>
							<span className="text-xl text-gray-400">
								{openIndex === index ? "-" : "+"}
							</span>
						</button>
						{openIndex === index && (
							<div className="p-4 pt-0 text-gray-600">{faq.answer}</div>
						)}
					</div>
				))}
			</div>
		</section>
	);
}

export default FAQSection;
