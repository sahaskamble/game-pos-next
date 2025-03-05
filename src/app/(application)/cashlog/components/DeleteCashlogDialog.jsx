"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { pb } from "@/lib/pocketbase";
import { Trash2 } from "lucide-react";

export function DeleteCashlogDialog({ cashlog, onSuccess }) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await pb.collection("cashlog").delete(cashlog.id);
      toast.success("Cash log entry deleted successfully");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to delete cash log entry");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Cash Log Entry</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this cash log entry? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
