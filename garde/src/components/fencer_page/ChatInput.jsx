import { useRef, useEffect } from "react";

export default function ChatInput({
	userInput,
	setUserInput,
	loading,
	isMenuOpen,
	darkMode,
	handleSubmit,
}) {
	const textareaRef = useRef(null);
	const MAX_HEIGHT = 200; // px, adjust as you like

	const resize = () => {
		const ta = textareaRef.current;
		if (!ta) return;

		ta.style.height = "auto";
		const newHeight = Math.min(ta.scrollHeight, MAX_HEIGHT);
		ta.style.height = `${newHeight}px`;

		ta.style.overflowY = ta.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
	};

	useEffect(() => {
		resize();
	}, [userInput]);

	return (
		<form
			onSubmit={handleSubmit}
			className={`
        fixed bottom-4 left-1/2
        ${isMenuOpen ? "md:left-[calc(50%+8rem)]" : ""}
        transform -translate-x-1/2
        w-full max-w-4xl
        z-50
        transition-all duration-300 ease-in-out
      `}
		>
			<div
				className={`
          relative
          w-full
          bg-white rounded-xl shadow-md
          border border-gray-300
          ${darkMode ? "bg-gray-700 border-gray-600" : ""}
        `}
			>
				<textarea
					ref={textareaRef}
					rows={1}
					value={userInput}
					onChange={(e) => setUserInput(e.target.value)}
					onInput={resize}
					className={`
            w-full p-3 pr-20
            resize-none
            bg-transparent
            ${darkMode ? "text-white placeholder-gray-500" : "text-gray-700 placeholder-gray-400"}
            focus:outline-none
            max-h-[200px]         /* Tailwind clamp */
            overflow-hidden        /* start hidden, JS will toggle */
          `}
					placeholder="Ask about your fencing technique..."
					disabled={loading}
					style={{ maxHeight: `${MAX_HEIGHT}px` }}
				/>

				<button
					type="submit"
					disabled={loading || !userInput.trim()}
					className={`
            absolute right-2 bottom-2
            px-4 py-2
            rounded-full
            text-white
            ${
							darkMode
								? "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700"
								: "bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
						}
            transition
          `}
				>
					Send
				</button>
			</div>
		</form>
	);
}
