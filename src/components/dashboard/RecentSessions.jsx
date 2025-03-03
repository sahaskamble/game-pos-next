import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistance } from 'date-fns';

export function RecentSessions({ sessions }) {
  console.log(sessions)
  return (
    <div className="space-y-4">
      <div className="text-xl font-bold">Recent Sessions</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>{session.expand?.customer_id?.customer_name || 'Guest'}</TableCell>
              <TableCell>
                {formatDistance(new Date(session.session_in),
                  session.session_out ? new Date(session.session_out) : new Date())}
              </TableCell>
              <TableCell>₹{session.amount_paid}</TableCell>
              <TableCell>{session.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
