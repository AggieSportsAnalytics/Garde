import { useState } from "react";
import "./index.css";

const milestones = [
	{
		date: "October 2023",
		title: "The Beginning",
		description:
			"Garde was born inside Aggie Sports Analytics at UC Davis. We identified a gap in sports performance technology — elite fencing athletes had almost no data-driven tools to analyze their technique. We entered a case competition and won against peers judged by real industry professionals, validating that the problem was worth solving.",
		image: "/asa-win.jpeg",
	},
	{
		date: "Summer 2024",
		title: "Going Deeper",
		description:
			"We spent the summer doing what every serious founder has to do: talk to the people who actually live the problem. We sat down with Olympic-level fencing athletes, listened to their frustrations, and reshaped our product around their real needs. Out of those conversations came a relationship with Davis Fencing Academy — our first institutional partner and a critical proving ground for Garde.",
		image: "/davis-fencing-academy.png",
	},
	{
		date: "Fall 2024",
		title: "Plasma '25 Cohort",
		description:
			"Garde was accepted into UC Davis Plasma '25, the university's premier student startup accelerator run through the Student Startup Center. Surrounded by mentors, investors, and fellow founders, we sharpened our go-to-market strategy, refined our pitch, and pushed our product development forward with renewed urgency.",
		image: "/demo-day.png",
	},
	{
		date: "Winter 2024–25",
		title: "Real Deployment",
		description:
			"We took Garde off the whiteboard and into a live fencing tournament. Our system recorded match footage in real time and delivered actionable video analysis to athletes and coaches on-site. Seeing our product work in a real competitive environment — with real athletes, real stakes — was a milestone we are genuinely proud of.",
		image: "/first-tournament.png",
	},
	{
		date: "Spring 2025",
		title: "National Stage",
		description:
			"We showcased Garde at a national fencing conference, putting our platform in front of the most influential voices in the sport. The reception exceeded our expectations: the CEO of USA Fencing took notice, and we were invited to a direct conversation with him about Garde's role in the future of fencing development in the United States.",
		image: "/usa-fencing.png",
	},
];

const team = [
	{
		name: "Vikram Penumarti",
		photo: "/vikram-headshot.jpg",
		role: "Co-Founder",
		email: "vikram.penumarti@gmail.com",
		linkedin: "https://www.linkedin.com/in/vikram-penumarti",
	},
	{
		name: "Sujash",
		photo: "/sujash-headshot.png",
		role: "Co-Founder",
		email: "sjbarman@ucdavis.edu",
		linkedin: "https://www.linkedin.com/in/sujash-barman",
	},
	{
		name: "Rishit",
		photo: "/rishit-headshot.png",
		role: "Co-Founder",
		email: "rdas@ucdavis.edu",
		linkedin: "https://www.linkedin.com/in/rishitdas",
	},
	{
		name: "Honoré",
		photo: "/honore-headshot.png",
		role: "Co-Founder",
		email: "haalexander@ucdavis.edu",
		linkedin: "https://www.linkedin.com/in/honore-alexander",
	},
];

function Timeline() {
	return (
		<section className="py-24 px-6">
			<div className="max-w-3xl mx-auto">
				<h2 className="text-3xl font-bold text-white mb-16 text-center tracking-tight">
					Our Journey
				</h2>
				<div className="relative">
					<div className="absolute left-0 top-0 bottom-0 w-px bg-white/10 ml-5" />
					<div className="space-y-16">
						{milestones.map((m) => (
							<div key={m.date} className="flex gap-8 relative">
								<div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center z-10">
									<div className="w-2 h-2 rounded-full bg-white" />
								</div>
								<div className="pb-2 flex-1">
									<span className="text-xs font-semibold tracking-widest uppercase text-white/40">
										{m.date}
									</span>
									<h3 className="text-xl font-semibold text-white mt-1 mb-3">
										{m.title}
									</h3>
									<p className="text-white/60 leading-relaxed text-base mb-5">
										{m.description}
									</p>
									{/* {m.image && (
										<div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
											<img
												src={m.image}
												alt={m.title}
												className="max-h-72 w-full object-contain"
											/>
										</div>
									)} */}
									{m.image && (
										<div className="rounded-xl overflow-hidden flex items-center justify-center">
											<img
												src={m.image}
												alt={m.title}
												className="bg-white min-h-72 max-h-72 rounded-xl object-cover"
											/>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

function StatBar() {
	const stats = [
		{ label: "Founded", value: "2023" },
		{ label: "Accelerator", value: "Plasma '25" },
		{ label: "Partners", value: "Davis Fencing Academy" },
		{ label: "User Interviews", value: "100+" },
	];

	return (
		<section className="border-y border-white/10 py-10 px-6">
			<div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
				{stats.map((s) => (
					<div key={s.label}>
						<div className="text-white font-bold text-lg leading-tight">
							{s.value}
						</div>
						<div className="text-white/40 text-xs mt-1 uppercase tracking-widest">
							{s.label}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function DemoSection() {
	return (
		<section className="py-24 px-6 bg-white/[0.02]">
			<div className="max-w-4xl mx-auto text-center">
				<h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
					See Garde in Action
				</h2>
				<p className="text-white/50 mb-12 text-base max-w-xl mx-auto">
					A look at the product we built — video-based fencing analysis
					delivered in real time.
				</p>
				<div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
					{/* eslint-disable-next-line jsx-a11y/media-has-caption */}
					<video
						className="w-full aspect-video object-cover"
						src="/garde-demo-edited.mp4"
						controls
						playsInline
					/>
				</div>
				<a
					href="/garde-pitchdeck.pdf"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 mt-10 px-6 py-3 rounded-full border border-white/20 text-white/70 text-sm hover:bg-white/5 hover:text-white transition-all duration-200"
				>
					<svg
						aria-hidden="true"
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
						/>
					</svg>
					View Pitch Deck
				</a>
			</div>
		</section>
	);
}

function Closing() {
	return (
		<section className="py-24 px-6">
			<div className="max-w-2xl mx-auto text-center">
				<h2 className="text-3xl font-bold text-white mb-6 tracking-tight">
					Where We Ended Up
				</h2>
				<p className="text-white/60 leading-relaxed text-base mb-6">
					After more than a year of building, testing, and iterating, we made
					the difficult decision to wind Garde down. Market timing, the
					realities of a niche sport, and the demands of building a software
					product as a student team spread across three countries all played a
					role.
				</p>
				<p className="text-white/60 leading-relaxed text-base mb-6">
					But we leave proud of what we accomplished. We built real technology,
					deployed it in a real competition, earned the trust of coaches and
					athletes at every level of the sport, and made it to rooms we had no
					business being in — including a conversation with the CEO of USA
					Fencing.
				</p>
				<p className="text-white/40 leading-relaxed text-sm">
					Garde was a team effort, and everything we learned along the way goes
					with us into whatever comes next.
				</p>
			</div>
		</section>
	);
}

function TeamSection() {
	return (
		<section className="py-24 px-6">
			<div className="max-w-4xl mx-auto">
				<h2 className="text-3xl font-bold text-white mb-4 text-center tracking-tight">
					The Team
				</h2>
				<p className="text-white/40 text-center text-base mb-16 max-w-xl mx-auto">
					Four UC Davis students who decided a case competition win wasn't
					enough — and spent two years finding out how far they could take it.
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
					{team.map((person) => (
						<div
							key={person.name}
							className="flex gap-5 p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
						>
							<img
								src={person.photo}
								alt={person.name}
								className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-white/10"
							/>
							<div>
								<div className="text-white font-semibold text-base leading-tight">
									{person.name}
								</div>
								<div className="text-white/40 text-xs uppercase tracking-widest mt-0.5 mb-3">
									{person.role}
								</div>
								<p className="text-white/40 text-xs">Contact:</p>
								<a
									className="text-white/35 text-xs leading-relaxed underline hover:text-white/60 transition-colors"
									href={`mailto:${person.email}`}
								>
									{person.email}
								</a>
								<br />
								<a
									className="text-white/35 text-xs leading-relaxed underline hover:text-white/60 transition-colors"
									href={person.linkedin}
									target="_blank"
									rel="noopener noreferrer"
								>
									{person.linkedin}
								</a>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function StoryTab() {
	return (
		<>
			<StatBar />
			<Timeline />
			<DemoSection />
			<Closing />
		</>
	);
}

export default function App() {
	const [tab, setTab] = useState("story");

	return (
		<div className="min-h-screen bg-[#0a0a0a] font-sans antialiased">
			{/* Header */}
			<header className="px-6 pt-10 pb-6 flex items-center justify-between max-w-5xl mx-auto">
				<div className="flex items-center gap-3">
					<img
						src="/garde-square.png"
						alt="Garde logo"
						className="w-20 h-20 rounded-lg"
					/>
				</div>
				<span className="text-white/30 text-sm">2023 – 2025</span>
			</header>

			{/* Hero */}
			<section className="px-6 pt-16 pb-16 text-center max-w-3xl mx-auto">
				<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-white/40 text-xs mb-8 tracking-wider uppercase">
					UC Davis · Plasma '25
				</div>
				<h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
					Bringing data-driven analysis to{" "}
					<span className="text-white/50">competitive fencing.</span>
				</h1>
				<p className="text-white/50 text-lg leading-relaxed max-w-xl mx-auto">
					Garde was a sports technology startup built to give fencing athletes
					and coaches the analytical tools that top-tier sports have taken for
					granted for decades. This is the story of how we built it.
				</p>
			</section>

			{/* Tab nav */}
			<div className="flex justify-center mb-2 px-6">
				<div className="inline-flex rounded-full border border-white/10 p-1 gap-1">
					{[
						{ id: "story", label: "Story" },
						{ id: "team", label: "Team" },
					].map((t) => (
						<button
							key={t.id}
							type="button"
							onClick={() => setTab(t.id)}
							className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
								tab === t.id
									? "bg-white text-black"
									: "text-white/50 hover:text-white"
							}`}
						>
							{t.label}
						</button>
					))}
				</div>
			</div>

			{tab === "story" ? <StoryTab /> : <TeamSection />}

			{/* Footer */}
			<footer className="border-t border-white/10 py-10 px-6 text-center">
				<p className="text-white/20 text-sm">
					© 2023–2025 Garde. Davis, California.
				</p>
			</footer>
		</div>
	);
}
