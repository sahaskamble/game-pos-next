'use client';

import { useEffect, useState } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { startOfWeek, startOfMonth, startOfYear, subDays, endOfDay } from 'date-fns';
import { AdvanceBookingsTable } from "./components/AdvanceBookingsTable";
import { format_Date } from "@/lib/utils/formatDates";

const DATE_RANGE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];

export default function AdvanceBookings() {
  const [dateRangeType, setDateRangeType] = useState("");
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const { data: bookings, loading } = useCollection("advance_bookings", {
    expand: 'customer_id,branch_id,created_by,closed_by',
    sort: '-created',
  });

  // Update date range based on selected option
  const updateDateRange = (option) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();
    end.setHours(23, 59, 59, 999);

    switch (option) {
      case "today":
        start.setHours(0, 0, 0, 0);
        break;
      case "yesterday":
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "this_week":
        start = startOfWeek(today, { weekStartsOn: 1 });
        break;
      case "this_month":
        start = startOfMonth(today);
        break;
      case "this_year":
        start = startOfYear(today);
        break;
      case "custom":
        return;
    }

    setStartDate(format_Date(start));
    setEndDate(format_Date(end));
  };

  const handleDateRangeTypeChange = (value) => {
    setDateRangeType(value);
    updateDateRange(value);
  };

  const filteredBookings = bookings?.filter(booking => {
    const bookingDate = new Date(booking.visiting_time);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);
    return bookingDate >= start && bookingDate <= end;
  });

  useEffect(() => {
    handleDateRangeTypeChange('today');
  }, []);


  return (
    <div className="container px-8 mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Advance Bookings Logs</h2>
        <div className="mb-4 flex gap-4 items-center">
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
      </div>


      <AdvanceBookingsTable
        data={filteredBookings || []}
        loading={loading}
      />
    </div>
  );
}
