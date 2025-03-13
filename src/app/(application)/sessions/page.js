'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SessionsTable } from "@/components/sessions/SessionsTable";
import { AddSessionDialog } from "@/components/sessions/AddSessionDialog";
import { EditSessionDialog } from "@/components/sessions/EditSessionDialog";
import { AdvanceBookingsNotifications } from "@/components/sessions/AdvanceBookingsNotifications";
import { useCollection } from "@/lib/hooks/useCollection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { startOfWeek, startOfMonth, startOfYear, subDays, endOfDay } from 'date-fns';

const DATE_RANGE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];

export default function Sessions() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [dateRangeType, setDateRangeType] = useState("today");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, loading, updateItem: update, deleteItem: remove } = useCollection("sessions", {
    expand: 'customer_id,branch_id,device_id,game_id,session_snacks.snack_id,user_id,billed_by',
  });
  const { createItem: create } = useCollection('advance_bookings');

  // Update date range based on selected option
  const updateDateRange = (option) => {
    const today = new Date();
    let start = new Date();
    let end = endOfDay(today);

    switch (option) {
      case "today":
        start = new Date(today.setHours(0, 0, 0, 0));
        break;
      case "yesterday":
        start = subDays(today, 1);
        start.setHours(0, 0, 0, 0);
        end = subDays(today, 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "this_week":
        start = startOfWeek(today, { weekStartsOn: 1 }); // Week starts on Monday
        break;
      case "this_month":
        start = startOfMonth(today);
        break;
      case "this_year":
        start = startOfYear(today);
        break;
      case "custom":
        // Keep existing custom dates
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Handle date range type change
  const handleDateRangeTypeChange = (value) => {
    setDateRangeType(value);
    updateDateRange(value);
  };

  // Filter sessions based on date range
  const filteredSessions = data?.filter(session => {
    const sessionDate = new Date(session.created);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);
    return sessionDate >= start && sessionDate <= end;
  });

  return (
    <div className="container px-8 mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
        <div className="flex items-center gap-4">
          <Select value={dateRangeType} onValueChange={handleDateRangeTypeChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AdvanceBookingsNotifications />
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Advance Booking
          </Button>
        </div>
      </div>

      <div className="mb-4 flex gap-4 items-center">

        {dateRangeType === "custom" && (
          <div className="flex gap-2 items-center">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
            <span>to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
        )}
      </div>

      <SessionsTable
        data={filteredSessions || []}
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
        onOpenChange={() => setEditingSession(null)}
        session={editingSession}
        onSubmit={update}
      />
    </div>
  );
}



