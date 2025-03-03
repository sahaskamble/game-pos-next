import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { format } from "date-fns";

export function InventoryTable({ data, loading, fields, onEdit, onDelete, canModify }) {
  if (loading) return <div>Loading...</div>;

  const renderCellValue = (item, field) => {
    if (field.name === "branch_id") {
      return item.expand?.branch_id?.name || "No Branch";
    }

    if (field.type === "date") {
      return item[field.name] ? format(new Date(item[field.name]), "PPP") : "-";
    }

    if (field.type === "file") {
      return item[field.name] ? "File uploaded" : "No file";
    }

    return item[field.name] || "-";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {fields.map((field) => (
            <TableHead key={field.name}>{field.label}</TableHead>
          ))}
          {canModify && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((item) => (
          <TableRow key={item.id}>
            {fields.map((field) => (
              <TableCell key={`${item.id}-${field.name}`}>
                {renderCellValue(item, field)}
              </TableCell>
            ))}
            {canModify && (
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
