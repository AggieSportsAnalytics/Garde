import { useState } from "react";
import Link from "next/link";

export default function TournamentDetail({
	handleSubmit,
	formData,
	setFormData,
	isOrganize,
	backTo,
}) {
	const [errors, setErrors] = useState({});

	const onSubmit = (e) => {
		e.preventDefault();

		if (Object.values(errors)?.filter((val) => val !== undefined)?.length > 0) {
			return;
		}
		handleSubmit();
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		// Update form data
		const updatedFormData = {
			...formData,
			[name]: type === "checkbox" ? checked : value,
		};

		// Start with existing errors
		const validationErrors = { ...errors };

		// Validate `end_time` against `start_time`
		if (
			name === "end_time" &&
			new Date(value) <= new Date(updatedFormData.start_time)
		) {
			validationErrors.end_time = "End time must be greater than start time.";
		} else if (name === "end_time") {
			validationErrors.end_time = undefined;
		}

		// Validate `start_time` against `end_time`
		if (
			name === "start_time" &&
			new Date(updatedFormData.end_time) <= new Date(value)
		) {
			validationErrors.start_time = "Start time must be less than end time.";
		} else if (name === "start_time") {
			validationErrors.start_time = undefined;
		}

		// Validate `signup_deadline` against `start_time`
		if (
			name === "signup_deadline" &&
			new Date(value) > new Date(updatedFormData.start_time)
		) {
			validationErrors.signup_deadline =
				"Signup deadline must be less than or equal to start time.";
		} else if (name === "signup_deadline") {
			validationErrors.signup_deadline = undefined;
		}

		// Update errors state
		setErrors(validationErrors);

		// Update form data state
		setFormData(updatedFormData);
	};

	return (
		<>
			<Link href={backTo} className="cursor-pointer">
				<button
					type="button"
					className="bg-white text-black ml-5 mt-5 py-2 px-4 rounded text-lg font-semibold hover:bg-gray-300 transition-transform duration-200 hover:scale-110 active:scale-100"
					title="Go Back"
				>
					&#8592;
				</button>
			</Link>
			<div className="p-6 max-w-3xl mx-auto bg-black text-white min-h-screen">
				<h1 className="text-2xl font-bold mb-4">Organize a Tournament</h1>
				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-400">
							Tournament Name <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Privacy <span className="text-red-500">*</span>
						</label>
						<select
							name="privacy"
							value={formData.privacy}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						>
							<option value="public">Public</option>
							<option value="private">Private</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Organizer Phone (optional)
						</label>
						<input
							type="text"
							name="organizer_phone"
							value={formData.organizer_phone}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Description (optional)
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Location <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							name="location"
							value={formData.location}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Start Time <span className="text-red-500">*</span>
						</label>
						<input
							type="datetime-local"
							name="start_time"
							value={formData.start_time}
							onChange={handleChange}
							className={`w-full p-2 border ${
								errors.start_time ? "border-red-500" : "border-gray-700"
							} rounded bg-gray-900 text-white`}
							required
						/>
						{errors.start_time && (
							<p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							End Time <span className="text-red-500">*</span>
						</label>
						<input
							type="datetime-local"
							name="end_time"
							value={formData.end_time}
							onChange={handleChange}
							className={`w-full p-2 border ${
								errors.end_time ? "border-red-500" : "border-gray-700"
							} rounded bg-gray-900 text-white`}
							required
						/>
						{errors.end_time && (
							<p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Signup Deadline
						</label>
						<input
							type="datetime-local"
							name="signup_deadline"
							value={formData.signup_deadline}
							onChange={handleChange}
							className={`w-full p-2 border ${
								errors.signup_deadline ? "border-red-500" : "border-gray-700"
							} rounded bg-gray-900 text-white`}
						/>
						{errors.signup_deadline && (
							<p className="text-red-500 text-sm mt-1">
								{errors.signup_deadline}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Max Participants (optional)
						</label>
						<input
							type="number"
							name="max_participants"
							value={formData.max_participants}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Registration Fee (optional)
						</label>
						<input
							type="number"
							name="registration_fee"
							value={formData.registration_fee}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Category (optional)
						</label>
						<input
							type="text"
							name="category"
							value={formData.category}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Prize Pool (optional)
						</label>
						<input
							type="number"
							name="prize_pool"
							value={formData.prize_pool}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Eligibility (optional)
						</label>
						<textarea
							name="eligibility"
							value={formData.eligibility}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Team-Based Tournament (optional)
						</label>
						<input
							type="checkbox"
							name="is_team_based"
							checked={formData.is_team_based}
							onChange={handleChange}
							className="mr-2"
						/>
						<span>Yes</span>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-400">
							Rules (optional)
						</label>
						<textarea
							name="rules"
							value={formData.rules}
							onChange={handleChange}
							className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
						/>
					</div>

					<button
						type="submit"
						className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
					>
						{isOrganize ? "Create Tournament" : "Update Tournament"}
					</button>
				</form>
			</div>
		</>
	);
}
