'use client';

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const columns = [
  {
    accessorKey: "customer_id.name",
    header: "Customer",
  },
  {
    accessorKey: "device_id.name",
    header: "Device",
  },
  {
    accessorKey: "game_id.name",
    header: "Game",
  },
  {
    accessorKey: "branch_id.name",
    header: "Branch",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <Badge variant={status === "Active" ? "success" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created",
    header: "Start Time",
    cell: ({ row }) => {
      return format(new Date(row.getValue("created")), "PPp");
    },
  },
  {
    accessorKey: "end_time",
    header: "End Time",
    cell: ({ row }) => {
      const endTime = row.getValue("end_time");
      return endTime ? format(new Date(endTime), "PPp") : "-";
    },
  },
  {
    accessorKey: "total_amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("total_amount");
      return amount ? `₹${amount}` : "-";
    },
  },
];