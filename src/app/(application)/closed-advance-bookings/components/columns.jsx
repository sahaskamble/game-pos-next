'use client';

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const columns = [
  {
    id: "customer_name",
    accessorKey: "expand.customer_id.customer_name",
    header: "Customer Name",
  },
  {
    id: "visiting_time",
    accessorKey: "visiting_time",
    header: "Visiting Time",
    cell: ({ row }) => {
      return format(new Date(row.getValue("visiting_time")), "PPpp");
    },
  },
  {
    id: "no_of_players",
    accessorKey: "no_of_players",
    header: "Players",
  },
  {
    id: "note",
    accessorKey: "note",
    header: "Note",
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <Badge variant={row.getValue("status") === "Closed" ? "secondary" : "default"}>
          {row.getValue("status")}
        </Badge>
      );
    },
  },
  {
    id: "created_by",
    accessorKey: "expand.created_by.username",
    header: "Created By",
  },
  {
    id: "closed_by",
    accessorKey: "expand.closed_by.username",
    header: "Closed By",
  },
  {
    id: "branch",
    accessorKey: "expand.branch_id.name",
    header: "Branch",
  },
  {
    id: "created",
    accessorKey: "created",
    header: "Created At",
    cell: ({ row }) => {
      return format(new Date(row.getValue("created")), "PPpp");
    },
  },
];
