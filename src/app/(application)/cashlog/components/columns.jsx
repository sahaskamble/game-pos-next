"use client";

import { format } from "date-fns";
import { EditCashlogDialog } from "./EditCashlogDialog";
import { DeleteCashlogDialog } from "./DeleteCashlogDialog";
import { Badge } from "@/components/ui/badge";

export const columns = [
  {
    accessorKey: "created",
    header: "Date",
    cell: ({ row }) => format(new Date(row.getValue("created")), "dd/MM/yyyy HH:mm"),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.getValue("category")}
      </Badge>
    ),
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.expand?.branch_id?.name || '-'}
      </Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const withdrawals = row.original.withdraw_from_drawer;
      if (!withdrawals?.amount) return "-";

      return (
        <Badge variant="outline" className="font-mono">
          Rs.{withdrawals?.amount?.toLocaleString()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const withdrawals = row.original.withdraw_from_drawer;
      if (!withdrawals?.amount) return "-";

      return (
        <Badge variant="outline">
          {withdrawals?.description?.toLocaleString()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "author",
    header: "Taken By",
    cell: ({ row }) => {
      const withdrawals = row.original.withdraw_from_drawer;
      if (!withdrawals?.taken_by) return "-";

      return (
        <Badge variant="outline">
          {withdrawals?.taken_by?.toLocaleString()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "user",
    header: "Added By",
    cell: ({ row }) => row.original.expand?.user_id?.username
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta;
      
      if (!meta?.isAdmin) {
        return null;
      }

      return (
        <div className="flex justify-end gap-2">
          <EditCashlogDialog
            cashlog={row.original}
            onSuccess={meta.onSuccess}
          />
          <DeleteCashlogDialog
            cashlog={row.original}
            onSuccess={meta.onSuccess}
          />
        </div>
      );
    },
  },
];
