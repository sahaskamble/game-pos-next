'use client';

import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

export default function Header() {
	const pathname = usePathname();
	const paths = pathname.split("/").filter(Boolean); // Splitting pathname into segments

	return (
		<header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 h-4" />
			</div>

			{/* Breadcrumbs */}
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>

					{paths.map((segment, index) => {
						const href = `/${paths.slice(0, index + 1).join("/")}`;
						const isLast = index === paths.length - 1;

						return (
							<BreadcrumbItem key={href}>
								<BreadcrumbSeparator />
								{isLast ? (
									<span className="text-gray-500">{segment}</span>
								) : (
									<BreadcrumbLink href={href}>{segment}</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						);
					})}
				</BreadcrumbList>
			</Breadcrumb>
		</header>
	);
}

