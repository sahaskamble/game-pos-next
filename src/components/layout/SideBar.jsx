'use client';

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
} from "@/components/ui/sidebar"
import { Gamepad2 } from "lucide-react";
import RoleChanger from "./SidebarRoleBasedChanger";
import { useAuth } from "@/lib/context/AuthContext";

export function AppSidebar() {
	const { user } = useAuth();

	return (
		<Sidebar className="border-r border-border">
			<SidebarHeader className="border-b border-border">
				<div className="flex items-center gap-3 px-6 py-4">
					<div className="bg-primary w-10 h-10 flex items-center justify-center rounded-xl shadow-lg">
						<Gamepad2 className="text-primary-foreground w-6 h-6" />
					</div>
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

