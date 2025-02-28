'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProtectedUrls } from "../constant/ProtectedUrl";

export default function ProtectedRoutes({ children, role }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const currentPath = pathname.replace("/", "");

    const route = ProtectedUrls.find((item) => item.url === currentPath);

    if (route && !route.accessTo.includes(role)) {
      router.replace('/unauthorized');
    }
  }, [pathname, role, router]);

  return (
    <>
      {children}
    </>
  )
}
