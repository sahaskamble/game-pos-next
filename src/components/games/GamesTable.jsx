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
import Image from "next/image";
import { PB_URL } from "@/lib/constant/url";

export function GamesTable({ data, loading, fields, onEdit, onDelete }) {
  if (loading) return <div>Loading...</div>;

  const getFileUrl = (record, filename) => {
    if (!filename) return null;
    return `${PB_URL}/api/files/games/${record.id}/${filename}?thumb=100x100`;
  };

  const renderCellValue = (item, field) => {
    if (field.type === "file" && field.name === "game_avatar") {
      const imageUrl = getFileUrl(item, item[field.name]);
      return imageUrl ? (
        <div className="relative w-16 h-16">
          <Image
            src={imageUrl}
            alt="Game Avatar"
            fill
            className="rounded-md object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
          No Image
        </div>
      );
    }

    if (field.type === "date") {
      return item[field.name] ? format(new Date(item[field.name]), "PPP") : "-";
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
          <TableHead>Last Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            {fields.map((field) => (
              <TableCell key={`${item.id}-${field.name}`}>
                {renderCellValue(item, field)}
              </TableCell>
            ))}
            <TableCell>
              {item.updated ? format(new Date(item.updated), "PPP") : "-"}
            </TableCell>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}