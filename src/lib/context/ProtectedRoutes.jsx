'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProtectedUrls } from "../constant/ProtectedUrl";

export default function ProtectedRoutes({ children, role }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Wait for role to be available
    if (!role) return;

    const currentPath = pathname.replace("/", "");
    
    // If we're at the root path, don't check protection
    if (!currentPath) return;

    const route = ProtectedUrls.find((item) => item.url === currentPath);

    // Only redirect if route exists and user doesn't have access
    if (route && !route.accessTo.includes(role)) {
      router.replace('/unauthorized');
    }
  }, [pathname, role, router]);

  return <>{children}</>;
}
