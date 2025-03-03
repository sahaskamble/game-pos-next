'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollection } from "@/lib/hooks/useCollection";

export function SessionActions({ session, onUpdate }) {
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extensionHours, setExtensionHours] = useState(1);

  const { updateItem: updateSession } = useCollection("sessions");
  const { updateItem: updateDevice } = useCollection("devices");

  const handleExtendSession = async () => {
    try {
      // Update session duration
      const updatedSession = await updateSession(session.id, {
        duration: session.duration + extensionHours,
        total_amount: session.total_amount + (session.base_amount / session.duration * extensionHours)
      });

      // Update device status
      await updateDevice(session.device_id, {
        status: "Extended"
      });

      setShowExtendDialog(false);
      if (onUpdate) onUpdate(updatedSession);
    } catch (error) {
      console.error("Error extending session:", error);
    }
  };

  const handleCloseSession = async () => {
    try {
      // Update session status
      const updatedSession = await updateSession(session.id, {
        status: "Completed",
        session_out: new Date().toISOString()
      });

      // Update device status
      await updateDevice(session.device_id, {
        status: "Open",
        current_session: null
      });

      if (onUpdate) onUpdate(updatedSession);
    } catch (error) {
      console.error("Error closing session:", error);
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogTrigger asChild>
          <Button variant="outline">Extend Session</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={extensionHours.toString()}
              onValueChange={(value) => setExtensionHours(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Hours" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((hours) => (
                  <SelectItem key={hours} value={hours.toString()}>
                    {hours} Hour{hours > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExtendSession} className="w-full">
              Extend
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button variant="destructive" onClick={handleCloseSession}>
        Close Session
      </Button>
    </div>
  );
}