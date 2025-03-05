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
				label: "Cash Log",
				path: "/cashlog",
				icon: <Receipt className="w-4 h-4" />
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
			{
				label: "Cash Log",
				path: "/cashlog",
				icon: <Receipt className="w-4 h-4" />
			},
		],
		StoreManager: [
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
				label: "Inventory",
				path: "/inventory",
				icon: <Package className="w-4 h-4" />
			},
			{
				label: "Cash Log",
				path: "/cashlog",
				icon: <Receipt className="w-4 h-4" />
			},
		],
		Staff: [
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
				label: "Inventory",
				path: "/inventory",
				icon: <Package className="w-4 h-4" />
			},
			{
				label: "Cash Log",
				path: "/cashlog",
				icon: <Receipt className="w-4 h-4" />
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
							<AccordionItem value={label} key={label} className="border-none">
								<AccordionTrigger className="py-3 px-6 hover:bg-muted transition-colors duration-200">
									<div className="flex items-center gap-3">
										{icon}
										<span className="font-medium">{label}</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="pb-0">
									{subItems.map(({ label: subLabel, path: subPath, icon: subIcon }) => (
										<SidebarButton
											key={subPath}
											path={subPath}
											icon={subIcon}
											isActive={pathname === subPath}
										>
											{subLabel}
										</SidebarButton>
									))}
								</AccordionContent>
							</AccordionItem>
						) : (
							<SidebarButton
								key={path}
								path={path}
								icon={icon}
								isActive={pathname === path}
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
		<Link href={path} className="w-full">
			<SidebarMenuButton
				className={`w-full rounded-lg transition-colors duration-200 ${
					isActive 
						? "bg-primary/10 text-primary hover:bg-primary/15" 
						: "hover:bg-muted"
				} gap-3 px-6 py-3`}
			>
				{icon}
				<span className="font-medium">{children}</span>
			</SidebarMenuButton>
		</Link>
	);
}

