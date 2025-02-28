'use client';

import { toast } from "sonner";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton } from "../ui/sidebar";
import { usePathname } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useEffect, useState } from "react";

export default function RoleChanger({ role }) {
	const pathname = usePathname();
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, [])

	const menuItems = {
		SuperAdmin: [
			{ label: "Dashboard", path: "/dashboard" },
			{ label: "Inventory", path: "/inventory" },
			{ label: "Sessions", path: "/sessions" },
			{ label: "Bookings", path: "/booking" },
			{
				label: "Reports",
				path: "/reports",
				subItems: [
					{
						label: "Expenses Report",
						path: "/expense-report",
					},
					{
						label: "Customer Report",
						path: "/customer-report",
					},
					{
						label: "Staff Report",
						path: "/staff-report",
					},
				]
			},
		],
		Admin: [
			{ label: "Dashboard", path: "/dashboard" },
		],
		StoreManager: [
			{ label: "Sessions", path: "/session" },
			{ label: "Bookings", path: "/booking" },
		],
		Staff: [
			{ label: "Sessions", path: "/session" },
			{ label: "Bookings", path: "/booking" },
		],
	};

	if (!menuItems[role]) {
		toast.warning("Role doesn't match");
		return null;
	}

	return isClient && <RoleMenu role={role} items={menuItems[role]} pathname={pathname} />;
}

function RoleMenu({ role, items, pathname }) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>{role.replace(/([A-Z])/g, " $1").trim()}</SidebarGroupLabel>
			<SidebarMenu>
				<Accordion type="single" collapsible className="w-full">
					{items.map(({ label, path, subItems }) => (
						subItems ? (
							<AccordionItem key={path} value={path} className="px-2">
								<AccordionTrigger>
									<span>{label}</span>
								</AccordionTrigger>
								<AccordionContent>
									{subItems.map(({ label, path }) => (
										<SidebarButton key={path} path={path} isActive={pathname === path}>
											{label}
										</SidebarButton>
									))}
								</AccordionContent>
							</AccordionItem>
						) : (
							<SidebarButton key={path} path={path} isActive={pathname === path}>
								{label}
							</SidebarButton>
						)
					))}
				</Accordion>
			</SidebarMenu>
		</SidebarGroup>
	);
}

function SidebarButton({ path, isActive, children }) {
	return (
		<SidebarMenuButton className={isActive ? "bg-blue-500 text-white" : ""} href={path}>
			{children}
		</SidebarMenuButton>
	);
}

