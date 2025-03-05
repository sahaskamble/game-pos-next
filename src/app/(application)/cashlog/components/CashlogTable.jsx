"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditCashlogDialog } from "./EditCashlogDialog";
import { DeleteCashlogDialog } from "./DeleteCashlogDialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";

export function CashlogTable({ data, isAdmin, onSuccess }) {
  // Get the latest cash in drawer amount
  const latestCashInDrawer = data[0]?.expand?.drawer_id?.cash_in_drawer || 0;

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Current Cash in Drawer
          </CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{latestCashInDrawer.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Last updated: {data[0] ? format(new Date(data[0].created), "dd/MM/yyyy HH:mm") : 'N/A'}
          </p>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Added By</TableHead>
              <TableHead>Withdrawal Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Taken By</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((cashlog) => (
              <TableRow key={cashlog.id}>
                <TableCell>
                  {format(new Date(cashlog.created), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {cashlog.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {cashlog.expand?.branch_id?.name || '-'}
                  </Badge>
                </TableCell>
                <TableCell>{cashlog.expand?.user_id?.name}</TableCell>
                <TableCell>
                  {cashlog.withdraw_from_drawer?.amount ? (
                    <Badge variant="destructive" className="font-mono">
                      ₹{cashlog.withdraw_from_drawer.amount.toLocaleString()}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {cashlog.withdraw_from_drawer?.description || "-"}
                </TableCell>
                <TableCell>
                  {cashlog.withdraw_from_drawer?.taken_by ? (
                    <Badge variant="outline">
                      {cashlog.withdraw_from_drawer.taken_by}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right space-x-2">
                    <EditCashlogDialog cashlog={cashlog} onSuccess={onSuccess} />
                    <DeleteCashlogDialog cashlog={cashlog} onSuccess={onSuccess} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
