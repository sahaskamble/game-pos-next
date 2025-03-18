'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, IndianRupee, Wallet, CreditCard } from "lucide-react";
import { SessionsTable } from "@/components/sessions/SessionsTable";
import { AddSessionDialog } from "@/components/sessions/AddSessionDialog";
import { EditSessionDialog } from "@/components/sessions/EditSessionDialog";
import { AdvanceBookingsNotifications } from "@/components/sessions/AdvanceBookingsNotifications";
import { useCollection } from "@/lib/hooks/useCollection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { startOfWeek, startOfMonth, startOfYear, } from 'date-fns';
import DataFilter from "@/components/superAdmin/DataFilter";
import { useAuth } from "@/lib/context/AuthContext";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { format_Date } from "@/lib/utils/formatDates";

const DATE_RANGE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];

export default function Sessions() {

  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [dateRangeType, setDateRangeType] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 0,
    cashPayments: 0,
    upiPayments: 0
  });
  const { data, loading, updateItem: update, deleteItem: remove } = useCollection("sessions", {
    expand: 'customer_id,branch_id,device_id,game_id,session_snacks.snack_id,user_id,billed_by',
    sort: '-created',
  });
  const { createItem: create } = useCollection('advance_bookings');

  useEffect(() => {
    const today = new Date();
    setDateRangeType("today");
    setStartDate(format_Date(today));
    setEndDate(format_Date(today));
  }, []);

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

  // Filter sessions based on date range and branch
  useEffect(() => {
    if (data) {
      let filtered = data.filter(session => {
        const sessionDate = new Date(session.created);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        return sessionDate >= start && sessionDate <= end;
      });

      // Apply branch filter if selected
      if (selectedBranch) {
        filtered = filtered.filter(session => session.branch_id === selectedBranch);
      }

      setFilteredSessions(filtered);
    }
  }, [data, startDate, endDate, selectedBranch]);

  useEffect(() => {
    if (filteredSessions?.length) {
      const stats = filteredSessions.reduce((acc, session) => {
        const totalAmount = session.amount_paid || 0;
        acc.totalRevenue += totalAmount;

        // Assuming payment_mode field exists in your session data
        if (session.payment_mode === 'Cash') {
          acc.cashPayments += totalAmount;
        } else if (session.payment_mode === 'Upi') {
          acc.upiPayments += totalAmount;
        } else {
          acc.cashPayments += session.Cash;
          acc.upiPayments += session.Upi;
        }

        return acc;
      }, {
        totalRevenue: 0,
        cashPayments: 0,
        upiPayments: 0
      });

      setPaymentStats(stats);
    }
  }, [filteredSessions]);

  return (
    <div className="container px-8 mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
        <div className="flex items-center gap-4">
          <DataFilter
            onBranchChange={setSelectedBranch}
          />
          {
            user?.role === "SuperAdmin" && (
              dateRangeType && (
                <Select value={dateRangeType} onValueChange={handleDateRangeTypeChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_RANGE_OPTIONS?.map((option) => (
                      <SelectItem key={option?.value} value={option?.value}>
                        {option?.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            )
          }
          <AdvanceBookingsNotifications />
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Advance Booking
          </Button>
        </div>
      </div>

      {/* Add Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatsCard
          title="Total Revenue"
          value={`₹${paymentStats.totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
          className="lg:col-span-1"
        />
        <StatsCard
          title="Cash Payments"
          value={`₹${paymentStats.cashPayments.toLocaleString()}`}
          icon={Wallet}
          className="lg:col-span-1"
        />
        <StatsCard
          title="UPI Payments"
          value={`₹${paymentStats.upiPayments.toLocaleString()}`}
          icon={CreditCard}
          className="lg:col-span-1"
        />
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
        data={filteredSessions}
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
