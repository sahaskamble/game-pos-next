'use client';

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
} from "@/components/ui/sidebar"
import RoleChanger from "./SidebarRoleBasedChanger";
import { useAuth } from "@/lib/context/AuthContext";
import { useTheme } from "next-themes";
import Image from "next/image";
import { darkThemeLogo, lightThemeLogo } from "@/constants/main";

export function AppSidebar() {
	const { user } = useAuth();
	const { theme } = useTheme();

	return (
		<Sidebar className="border-r border-border">
			<SidebarHeader className="border-b border-border">
				<div className="flex items-center gap-3 px-6 py-4">
					<Image
						src={theme === 'light' ? lightThemeLogo : darkThemeLogo}
						width={50}
						height={50}
						alt="Logo"
					/>
					<div>
						<h1 className="font-semibold text-lg">Game Ground</h1>
						<p className="text-xs text-muted-foreground">{user?.branch_name || 'Gaming Center'}</p>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<RoleChanger role={user?.role} />
			</SidebarContent>
		</Sidebar>
	)
}

