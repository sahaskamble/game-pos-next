"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { splashScreen } from "@/constants/main";

export default function SplashScreen() {
	const [showSplash, setShowSplash] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowSplash(false);
			router.push("/login");
		}, 4000); // 2 seconds duration

		return () => clearTimeout(timer);
	}, [router]);

	if (!showSplash) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black z-50">
			<video
				autoPlay
				muted
				playsInline
				className="w-full h-full object-contain"
			>
				<source src={splashScreen} type="video/mp4" />
				Your browser does not support the video tag.
			</video>
		</div>
	);
}

