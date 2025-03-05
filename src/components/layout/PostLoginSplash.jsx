"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PostLoginSplash() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      router.push("/booking"); // Redirect to booking page after splash
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
        <source src="/GG_LOGO_ANIMATION.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}