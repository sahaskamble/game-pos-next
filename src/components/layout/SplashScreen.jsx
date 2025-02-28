"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
	const [showSplash, setShowSplash] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowSplash(false);
			router.push("/home"); // Redirect after splash
		}, 5000); // Adjust duration as needed

		return () => clearTimeout(timer);
	}, [router]);

	if (!showSplash) return null; // Hide splash after timeout

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black">
			<video
				autoPlay
				muted
				playsInline
				className="w-full h-full object-cover"
			>
				<source src="/splashscreen.mp4" type="video/mp4" />
				Your browser does not support the video tag.
			</video>
		</div>
	);
}

