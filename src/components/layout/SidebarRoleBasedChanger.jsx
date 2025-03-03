'use client';

import { toast } from "sonner";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton } from "../ui/sidebar";
import { usePathname } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
	LayoutDashboard,
	Package,
	CalendarDays,
	BookOpenCheck,
	Settings,
	BarChart3,
	Receipt,
	Users,
	UserCog,
	ChevronRight
} from "lucide-react";

export default function RoleChanger({ role }) {
	const pathname = usePathname();
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, [])

	const menuItems = {
		SuperAdmin: [
			{
				label: "Dashboard",
				path: "/dashboard",
				icon: <LayoutDashboard className="w-4 h-4" />
			},
			{
				label: "Inventory",
				path: "/inventory",
				icon: <Package className="w-4 h-4" />
			},
			{
				label: "Sessions",
				path: "/sessions",
				icon: <CalendarDays className="w-4 h-4" />
			},
			{
				label: "Bookings",
				path: "/booking",
				icon: <BookOpenCheck className="w-4 h-4" />
			},
			{
				label: "Settings",
				path: "/settings",
				icon: <Settings className="w-4 h-4" />
			},
			{
				label: "Reports",
				path: "/reports",
				icon: <BarChart3 className="w-4 h-4" />,
				subItems: [
					{
						label: "Expenses Report",
						path: "/reports/expense-report",
						icon: <Receipt className="w-4 h-4" />
					},
					{
						label: "Customer Report",
						path: "/reports/customer-report",
						icon: <Users className="w-4 h-4" />
					},
					{
						label: "Staff Report",
						path: "/reports/staff-report",
						icon: <UserCog className="w-4 h-4" />
					},
				]
			},
		],
		Admin: [
			{
				label: "Dashboard",
				path: "/dashboard",
				icon: <LayoutDashboard className="w-4 h-4" />
			},
		],
		StoreManager: [
			{
				label: "Sessions",
				path: "/session",
				icon: <CalendarDays className="w-4 h-4" />
			},
			{
				label: "Bookings",
				path: "/booking",
				icon: <BookOpenCheck className="w-4 h-4" />
			},
		],
		Staff: [
			{
				label: "Sessions",
				path: "/session",
				icon: <CalendarDays className="w-4 h-4" />
			},
			{
				label: "Bookings",
				path: "/booking",
				icon: <BookOpenCheck className="w-4 h-4" />
			},
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
					{items.map(({ label, path, icon, subItems }) => (
						subItems ? (
							<AccordionItem key={path} value={path} className="px-2 border-none">
								<AccordionTrigger className="py-2 hover:no-underline">
									<div className="flex items-center gap-2">
										{icon}
										<span>{label}</span>
									</div>
								</AccordionTrigger>
								<AccordionContent>
									<div className="flex flex-col gap-1">
										{subItems.map(({ label, path, icon }) => (
											<SidebarButton
												key={path}
												path={path}
												icon={icon}
												isActive={pathname === path}
											>
												{label}
											</SidebarButton>
										))}
									</div>
								</AccordionContent>
							</AccordionItem>
						) : (
							<SidebarButton
								key={path}
								path={path}
								icon={icon}
								isActive={pathname === path}
								className="p-2"
							>
								{label}
							</SidebarButton>
						)
					))}
				</Accordion>
			</SidebarMenu>
		</SidebarGroup>
	);
}

function SidebarButton({ path, isActive, icon, children }) {
	return (
		<Link href={path}>
			<SidebarMenuButton
				className={`${isActive ? "bg-blue-500 text-white" : ""} gap-5 p-4`}
				href={path}
			>
				{icon}
				<span>{children}</span>
			</SidebarMenuButton>
		</Link>
	);
}

