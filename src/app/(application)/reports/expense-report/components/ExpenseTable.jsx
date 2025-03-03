import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ExpenseTable({ expenses }) {
  console.log(expenses)
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Taken By</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>{expense.date}</TableCell>
            <TableCell>{expense.category}</TableCell>
            <TableCell>{expense.description}</TableCell>
            <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
            <TableCell>{expense.created_by}</TableCell>
            <TableCell>{expense.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
