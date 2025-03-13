"use client";

import * as React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

export function MessagesTable({ messages }) {
  const messageData = messages.filter(
    (message) =>
      message.eventType === "message"
  );

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={messageData}
        displayPdf={true}
      />
    </div>
  );
}
