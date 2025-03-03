'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { SessionsTable } from "@/components/sessions/SessionsTable";
import { AddSessionDialog } from "@/components/sessions/AddSessionDialog";
import { EditSessionDialog } from "@/components/sessions/EditSessionDialog";
import { useCollection } from "@/lib/hooks/useCollection";

export default function Sessions() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const { user } = useAuth();
  
  const { data, loading, create, update, remove } = useCollection("sessions", {
    expand: 'customer_id,branch_id',
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Session
        </Button>
      </div>

      <SessionsTable
        data={data}
        loading={loading}
        onEdit={setEditingSession}
        onDelete={remove}
      />

      <AddSessionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={create}
      />

      <EditSessionDialog
        open={!!editingSession}
        onOpenChange={(open) => !open && setEditingSession(null)}
        onSubmit={update}
        initialData={editingSession}
      />
    </div>
  );
}



