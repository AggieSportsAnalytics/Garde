import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";

const VideoSource = ({ videoUrl, thumbnail, isGridLayout }) => {
	const videoRef = useRef(null);
	const hlsRef = useRef(null);
	const [isBuffering, setIsBuffering] = useState(false);

	useEffect(() => {
		return () => {
			if (hlsRef.current) {
				hlsRef.current.destroy();
				hlsRef.current = null;
			}
		};
	}, []);

	const handleMouseEnter = () => {
		setIsBuffering(true);
		try {
			if (Hls.isSupported()) {
				const hls = new Hls();
				hlsRef.current = hls;
				hls.loadSource(videoUrl);
				hls.attachMedia(videoRef.current);

				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					setIsBuffering(false);
					videoRef.current.play();
				});
			} else if (
				videoRef.current.canPlayType("application/vnd.apple.mpegurl")
			) {
				videoRef.current.src = videoUrl;
				videoRef.current.play();
				setIsBuffering(false);
			}
		} catch (error) {
			setIsBuffering(false);
			console.error(error);
		}
	};

	const handleMouseLeave = () => {
		setIsBuffering(false);
		if (videoRef.current) {
			videoRef.current.pause();
			videoRef.current.currentTime = 0;
		}
		if (hlsRef.current) {
			hlsRef.current.destroy();
			hlsRef.current = null;
		}
	};

	const handleTouchStart = () => {
		handleMouseEnter();

		setTimeout(() => {
			if (videoRef.current) {
				videoRef.current.pause();
			}
		}, 10000);
	};

	return (
		<div
			className={`relative overflow-hidden rounded-lg ${
				isGridLayout
					? "w-full aspect-video"
					: "w-full max-w-sm md:max-w-md lg:max-w-lg aspect-video"
			}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onTouchStart={handleTouchStart}
		>
			<video
				className="w-full h-full object-cover"
				ref={videoRef}
				muted
				playsInline
				poster={thumbnail}
			/>
			{isBuffering && (
				<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
					<div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
				</div>
			)}
		</div>
	);
};

export default VideoSource;
