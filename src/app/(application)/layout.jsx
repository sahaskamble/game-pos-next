'use client';

import Header from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/SideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/context/AuthContext";
import ProtectedRoutes from "@/lib/context/ProtectedRoutes";

export default function ApplicationLayout({ children }) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ProtectedRoutes role={user?.role}>
          <Header />
          {children}
        </ProtectedRoutes>
      </SidebarInset>
    </SidebarProvider>
  );
}
