'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function SessionsTable({ data, loading, onEdit, onDelete }) {
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Session In</TableHead>
          <TableHead>Session Out</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((session) => (
          <TableRow key={session.id}>
            <TableCell>{session.expand?.customer_id?.customer_name}</TableCell>
            <TableCell>
              {session.session_in ? format(new Date(session.session_in), 'PPp') : '-'}
            </TableCell>
            <TableCell>
              {session.session_out ? format(new Date(session.session_out), 'PPp') : '-'}
            </TableCell>
            <TableCell>{session.expand?.branch_id?.name}</TableCell>
            <TableCell>{session.status}</TableCell>
            <TableCell>₹{session.total_amount || 0}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(session)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(session.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
