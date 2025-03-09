'use client';

import React, { useState } from 'react';
import { calculateSessionValues } from '@/lib/utils/calculateSessionValues';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollection } from '@/lib/hooks/useCollection';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Timer } from 'lucide-react'
import { useRouter } from 'next/navigation';

export default function ExtendSession({ device, onSessionUpdated }) {
  const router = useRouter();
  const { data: settings } = useCollection("settings");
  const { data: sessions, updateItem: updateSession } = useCollection("sessions");

  const [formData, setformData] = useState({
    no_of_players: 1,
    duration_unit: "minutes",
    duration: 15,
    totalAmount: 0,
  });

  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Early return before html loads  
      if (!settings?.[0] || !formData.no_of_players) {
        toast.error('Error extending session, please try again later....')
        return;
      }

      // Find the session associated with this device
      const session = await sessions.find((session) => session.device_id === device.id && session.status === 'Active');

      if (!session) {
        toast.error('No active session found for this device');
        return;
      }

      console.log("Current session:", session);

      // Convert duration to hours for calculation
      const durationInHours = formData.duration_unit === "minutes"
        ? formData.duration / 60
        : formData.duration;

      // Calculate base price
      const sessionValues = calculateSessionValues(formData.no_of_players, settings[0]);
      const basePrice = sessionValues.totalAmount * durationInHours;

      // Create a new Date object from session_out string
      const sessionOut = new Date(session.session_out);

      // Add time based on form data
      if (formData.duration_unit === "minutes") {
        sessionOut.setMinutes(sessionOut.getMinutes() + parseInt(formData.duration));
      } else {
        sessionOut.setHours(sessionOut.getHours() + parseInt(formData.duration));
      }

      const sessionOutString = sessionOut.toISOString()

      // Calculate duration
      let duration = 0; let duration_unit = 'minutes';
      if (session.duration_unit === formData.duration_unit) {
        duration = session.duration + formData.duration;
        duration_unit = session.duration_unit;
      } else if (session.duration_unit === 'minutes' && formData.duration_unit === 'hours') {
        duration = (session.duration / 60) + formData.duration;
        duration_unit = 'hours';
      } else if (formData.duration_unit === 'minutes' && session.duration_unit === 'hours') {
        duration = session.duration + durationInHours;
        duration_unit = 'hours';
      }

      const updatePayload = {
        session_out: sessionOutString,
        duration,
        duration_unit,
        session_amount: session.session_amount + basePrice,
        total_amount: session.total_amount + basePrice,
        no_of_players: formData.no_of_players
      };

      const result = await updateSession(session.id, updatePayload);

      // If parent component provided a callback, notify it about the update
      if (typeof onSessionUpdated === 'function') {
        onSessionUpdated(result);
      }

      toast.success('Session extended successfully!');
      setOpen(false);
      router.refresh();

    } catch (error) {
      console.error("Error extending session:", error);
      toast.error('Error extending session, please try again later....');
    }
  }

  const handleDuration = (value) => {
    setformData({ ...formData, duration: parseInt(value) });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} className='w-full'>
      <DialogTrigger className="w-full px-2 py-2 bg-yellow-500 inline-flex justify-center items-center rounded-lg">
        <Timer className="h-4 w-4" color='#fff' />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Session</DialogTitle>
          <form className='grid gap-4' onSubmit={handleSubmit}>
            <div className='mt-6 grid gap-2'>
              <Label>No. of Players</Label>
              <Input
                type='number'
                value={formData.no_of_players}
                onChange={(e) => setformData({ ...formData, no_of_players: Number(e.target.value) })}
                min={1}
              />
            </div>
            <div className='grid gap-2'>
              <Label>Duration</Label>
              <div className='flex flex-row-reverse items-center gap-2'>
                <Select
                  value={formData.duration_unit}
                  onValueChange={(value) => {
                    // Reset duration when switching units
                    const newDuration = value === "minutes" ? 15 : 1;
                    setformData({ ...formData, duration_unit: value, duration: newDuration });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="duration"
                  type="number"
                  min={formData.duration_unit === "minutes" ? 15 : 1}
                  step={formData.duration_unit === "minutes" ? 15 : 1}
                  value={formData.duration}
                  onChange={(e) => handleDuration(e.target.value)}
                />
              </div>
            </div>
            <Button type='submit'>
              Extend Session
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
};
