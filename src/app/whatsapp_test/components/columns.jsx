"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const columns = [
  {
    accessorKey: "created",
    header: "Time",
    cell: ({ row }) => format(new Date(row.getValue("created")), "dd/MM/yyyy HH:mm"),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue("type")}
      </Badge>
    ),
  },
  {
    id: "sender",
    header: "Sender",
    cell: ({ row }) => {
      const isOwner = row.original.owner;
      const operatorName = row.original.operatorName;
      const avatarUrl = row.original.avatarUrl;

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt="Avatar" />
            <AvatarFallback>{isOwner ? "B" : "U"}</AvatarFallback>
          </Avatar>
          <span>{isOwner ? operatorName || "Bot" : "User"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "text",
    header: "Message",
    cell: ({ row }) => {
      const message = row.getValue("text");
      const type = row.getValue("type");
      const data = row.original.data;

      if (type === "video") {
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Video Message</Badge>
            <span className="text-sm text-muted-foreground">{data}</span>
          </div>
        );
      }

      return <div className="max-w-[400px] truncate">{message}</div>;
    },
  },
  {
    accessorKey: "statusString",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.getValue("statusString")?.toLowerCase() || "N/A"}
      </Badge>
    ),
  },
  {
    accessorKey: "eventType",
    header: "Event",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue("eventType")}
      </Badge>
    ),
  },
];