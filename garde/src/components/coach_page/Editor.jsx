"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import { FaBold, FaItalic } from "react-icons/fa";
import ListItem from "@tiptap/extension-list-item";
import axios from "axios";

function Editor({ fencer, coachName, currentVideo }) {
	const [errorMessage, setErrorMessage] = useState("");
	const [success, setSuccess] = useState("");

	// Initialize editor with necessary extensions, including lists
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				listItem: false, // Disable default listItem to use custom ListItem extension
			}),
			ListItem,
		],
		content: "",
		placeholder: "Enter your feedback here...",
		immediatelyRender: false,
	});

	const handleSubmit = async () => {
		if (!editor) return;

		const content = editor.getHTML();

		if (content === "" || content === "<p></p>") {
			setErrorMessage("Feedback cannot be empty.");
			setTimeout(() => {
				setErrorMessage("");
			}, 2000);
			return;
		}

		editor.commands.setContent(""); // Clear content after submission

		const queryData = {
			fencerName: fencer.fencer_name,
			data: content,
			email: fencer.fencer_email,
			coachName: coachName,
			videoUrl: currentVideo
				? `https://pub-8c962831e75547f6a9ca8e7d2bd89c9c.r2.dev/${fencer.fencer_id}/${currentVideo}/full_video.webm`
				: null,
		};

		try {
			const res = await axios.put("/api/send_feedback", queryData, {
				withCredentials: true,
				headers: {
					"Content-Type": "application/json",
				},
			});

			setSuccess("Successfully sent feedback!");
			setTimeout(() => {
				setSuccess("");
			}, 2000);
		} catch (error) {
			setErrorMessage("Failed to send feedback");
			setTimeout(() => {
				setErrorMessage("");
			}, 2000);
			console.error(error);
		}
	};

	const handleBold = () => editor?.chain().focus().toggleBold().run();
	const handleItalic = () => editor?.chain().focus().toggleItalic().run();

	return (
		<div className="w-full text-black">
			{" "}
			{/* Full width */}
			{/* Toolbar */}
			<div className="flex mb-4 space-x-4 border-b pb-2">
				<button
					type="button"
					onClick={handleBold}
					className={`px-4 py-2 rounded ${editor?.isActive("bold") ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
				>
					<FaBold />
				</button>
				<button
					type="button"
					onClick={handleItalic}
					className={`px-4 py-2 rounded ${editor?.isActive("italic") ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
				>
					<FaItalic />
				</button>
			</div>
			{/* Editor */}
			<div className="editor-content border border-gray-300 p-4 rounded bg-white">
				<EditorContent editor={editor} />
			</div>
			{/* Error Message */}
			{errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
			{success && <p className="text-green-500 mt-2">{success}</p>}
			{/* Submit Button */}
			<div className="text-center">
				<button
					type="button"
					className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
					onClick={handleSubmit}
				>
					Submit Feedback
				</button>
			</div>
		</div>
	);
}

export default Editor;
