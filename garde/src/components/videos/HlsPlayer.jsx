import { useRef, useEffect } from "react";
import Hls from "hls.js";

const HLSPlayer = ({ videoUrl, isLooping, thumbnail }) => {
	const videoRef = useRef(null);

	useEffect(() => {
		try {
			if (Hls.isSupported()) {
				const hls = new Hls();
				hls.loadSource(videoUrl);
				hls.attachMedia(videoRef.current);

				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					videoRef.current.play();
				});

				return () => {
					hls.destroy();
				};
			}
			if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
				// For Safari and other native HLS-supporting browsers
				videoRef.current.src = videoUrl;
				videoRef.current.addEventListener("loadedmetadata", () => {
					videoRef.current.play();
				});
			}
		} catch (error) {
			console.error("HLS connection failed:", error);
		}
	}, [videoUrl]);

	return (
		<div className="w-full max-w-4xl mx-auto bg-black rounded-lg">
			<video
				ref={videoRef}
				controls
				loop={isLooping}
				muted={false}
				poster={thumbnail}
				className="w-full h-auto aspect-video rounded-lg"
			/>
		</div>
	);
};

export default HLSPlayer;
