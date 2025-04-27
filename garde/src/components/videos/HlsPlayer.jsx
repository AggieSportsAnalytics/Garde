import { useRef, useEffect, useState } from "react";
import Hls from "hls.js";

const HLSPlayer = ({ videoUrl, isLooping, thumbnail, autoplay = true }) => {
	const videoRef = useRef(null);
	const [stopVideo, setStopVideo] = useState(false);

	useEffect(() => {
		if (!videoUrl) return;
		try {
			if (Hls.isSupported()) {
				const hls = new Hls();
				hls.loadSource(videoUrl);
				hls.attachMedia(videoRef.current);

				hls.on(Hls.Events.ERROR, (event, data) => {
					if (data.response?.code === 404) {
						setStopVideo(true);
					}

					if (data.fatal) {
						setStopVideo(true);
					}
				});

				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					if (autoplay) {
						setTimeout(() => {
							videoRef.current.play().catch((err) => {
								console.warn("Delayed play() failed", err);
							});
						}, 100);
					}
				});

				return () => {
					hls.destroy();
				};
			}
			if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
				// For Safari and other native HLS-supporting browsers
				videoRef.current.src = videoUrl;
				videoRef.current.autoplay = autoplay;
				videoRef.current.addEventListener("loadedmetadata", () => {
					videoRef.current.play();
				});
			}
		} catch (error) {
			console.error("HLS connection failed:", error);
		}
	}, [videoUrl, autoplay]);

	if (!videoUrl || stopVideo) {
		return null;
	}

	return (
		<div className="w-full max-w-4xl mx-auto bg-black rounded-lg">
			<video
				ref={videoRef}
				controls
				autoPlay={autoplay}
				loop={isLooping}
				muted
				poster={thumbnail}
				className="w-full h-auto aspect-video rounded-lg"
			/>
		</div>
	);
};

export default HLSPlayer;
