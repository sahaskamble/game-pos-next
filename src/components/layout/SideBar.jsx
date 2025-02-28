'use client';

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/components/ui/sidebar"
import { Gamepad2 } from "lucide-react";
import RoleChanger from "./SidebarRoleBasedChanger";
import { useAuth } from "@/lib/context/AuthContext";

export function AppSidebar() {
	const { user } = useAuth();

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="inline-flex justify-start items-center gap-4 p-2">
					<div className="bg-primary w-10 h-10 inline-flex justify-center items-center rounded-lg">
						<Gamepad2 />
					</div>
					<h1>Game Ground</h1>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<RoleChanger role={user?.role} />
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	)
}

