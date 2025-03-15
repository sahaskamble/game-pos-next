"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { splashScreen } from "@/constants/main";
import { useAuth } from "@/lib/context/AuthContext";

export default function PostLoginSplash() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      // Conditional routing based on user role
      if (user?.role === 'Staff') {
        router.push(`/cashlog/add-drawer/${user.id}`);
      } else {
        router.push("/booking");
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [router, user]);

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
      </video>
    </div>
  );
}
