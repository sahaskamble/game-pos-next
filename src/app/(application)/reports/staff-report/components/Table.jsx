import React from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';

function StaffTable({ data = [] }) {
	console.log(data);
	return (
		<div className="rounded-lg overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="border-b">
						<TableHead className="font-bold">Staff Member</TableHead>
						<TableHead className="font-bold">Role</TableHead>
						<TableHead className="font-bold">Branch</TableHead>
						<TableHead className="font-bold">Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((staff, i) => (
						<TableRow key={i} className="border-b">
							<TableCell>
								<div className="flex items-center gap-3">
									<Avatar>
										<AvatarFallback>
											{staff.username?.charAt(0).toUpperCase() || 'U'}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-medium">{staff.username || 'Unknown'}</div>
										<div className="text-sm text-muted-foreground">
											{staff.email || 'No email'}
										</div>
									</div>
								</div>
							</TableCell>
							<TableCell>{staff.role}</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-1">
									{staff.expand?.branch_id?.length > 0 ? (
										staff.expand.branch_id.map((branch, index) => (
											<Badge
												key={index}
												variant="secondary"
												className="mr-1"
											>
												{branch.name}
											</Badge>
										))
									) : (
										'Not Assigned'
									)}
								</div>							</TableCell>
							<TableCell>{staff.status || 'Active'}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}

export default StaffTable 
