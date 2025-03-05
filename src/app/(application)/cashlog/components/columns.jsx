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
    accessorKey: "user",
    header: "Added By",
    cell: ({ row }) => row.original.expand?.user_id?.name
  },
  {
    accessorKey: "withdraw_from_drawer",
    header: "Withdrawals",
    cell: ({ row }) => {
      const withdrawals = row.original.withdraw_from_drawer;
      if (!withdrawals?.amount) return "-";

      return (
        <div className="flex gap-4">
          <Badge variant="default" className="font-mono">
            ₹{withdrawals.amount.toLocaleString()}
          </Badge>
          {withdrawals.description && (
            <Badge variant="default" className="font-mono">
              {withdrawals.description}
            </Badge>
          )}
          {withdrawals.taken_by && (
            <Badge variant="default" className="text-xs">
              By: {withdrawals.taken_by}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta;

      if (!meta?.isAdmin && !meta?.isSuperAdmin) return null;

      return (
        <div className="flex justify-end gap-2">
          <EditCashlogDialog
            cashlog={row.original}
            onSuccess={meta?.onSuccess}
          />
          <DeleteCashlogDialog
            cashlog={row.original}
            onSuccess={meta?.onSuccess}
          />
        </div>
      );
    },
  },
];
