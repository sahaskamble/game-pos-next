'use client';

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    cell: ({ row }) => row.original.expand?.created_by?.username || '-',
  },
  {
    id: "closed_by",
    accessorKey: "expand.closed_by.username",
    header: "Closed By",
    cell: ({ row }) => row.original.expand?.closed_by?.username || '-',
  },
  {
    id: "closed_at",
    accessorKey: "closed_at",
    header: "Closed At",
    cell: ({ row }) => {
      const closedAt = row.getValue("closed_at");
      return closedAt ? format(new Date(closedAt), "PPpp") : '-';
    },
  },
  {
    id: "branch",
    accessorKey: "expand.branch_id.name",
    header: "Branch",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const booking = row.original;
      const isActive = booking.status === "Active";
      
      return (
        <Button
          variant="secondary"
          size="sm"
          disabled={!isActive}
          onClick={() => table.options.meta?.handleMarkAsClosed(booking.id)}
        >
          Mark as Closed
        </Button>
      );
    },
  },
];
