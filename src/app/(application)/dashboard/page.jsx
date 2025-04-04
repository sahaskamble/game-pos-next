'use client';

import { useState, useEffect } from 'react'
import { useCollection } from "@/lib/hooks/useCollection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataFilter from "@/components/superAdmin/DataFilter";
import { format_Date } from "@/lib/utils/formatDates";
import { startOfMonth, startOfWeek, startOfYear } from "date-fns";
import TotalRevenueCard from './components/TotalRevenueCard';
import { isArray } from 'lodash';
import SnacksRevenue from './components/SnacksRevenue';
import DeviceCard from './components/DeviceCard';
import MembershipCard from './components/MembershipCard';
import ExpensesCard from './components/ExpensesCard';
import Charts from './components/Charts';
import { SessionsTable } from '@/components/sessions/SessionsTable';
import SessionRevenueCard from './components/SessionRevenueCard';

const DATE_RANGE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];


export default function DashboardPage() {
  const { data: cashlogs } = useCollection("cashlog", {
    expand: "drawer_id,user_id,branch_id",
    sort: "-created",
  });
  const { data: sessions } = useCollection("sessions", {
    expand: 'customer_id,branch_id,device_id,game_id,session_snacks.snack_id,user_id,billed_by',
    sort: '-created',
  });
  const { data: membershipLogs } = useCollection("membershipLog", {
    expand: "plan_id,user_id,branch_id,customer",
    sort: "-created",
  });
  const { data: snacks_data } = useCollection("session_snack", {
    sort: '-created',
    expand: "snack_id,session_id"
  });
  const { data: devices } = useCollection("devices", {
    expand: "branch_id"
  });

  //<--- State Variables --->
  const [dateRangeType, setDateRangeType] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [FilteredSessions, setFilteredSessions] = useState([]);
  const [FilteredSnacks, setFilteredSnacks] = useState([]);
  const [FilteredDevices, setFilteredDevices] = useState([]);
  const [FilteredCashlogs, setFilteredCashlogs] = useState([]);
  const [FilteredMembershiplogs, setFilteredMembershiplogs] = useState([]);

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

  // Filter logs and calculate working hours
  useEffect(() => {
    if (isArray(sessions) && isArray(cashlogs)) {
      // Sessions
      let filteredSessions = sessions.filter(session => {
        const createdDate = new Date(session.created);
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0);
        end.setHours(23, 59, 59);
        return createdDate >= start && createdDate <= end;
      });
      if (selectedBranch) {
        filteredSessions = filteredSessions.filter(session => session.branch_id === selectedBranch);
      }
      setFilteredSessions(filteredSessions);

      // Cash Drawer Logs
      let filteredCashlogs = cashlogs.filter(cashlog => {
        const createdDate = new Date(cashlog.created);
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0);
        end.setHours(23, 59, 59);
        return createdDate >= start && createdDate <= end && cashlog.category !== 'Drawer';
      });
      if (selectedBranch) {
        filteredCashlogs = filteredCashlogs.filter(cashlog => cashlog.branch_id === selectedBranch);
      }
      setFilteredCashlogs(filteredCashlogs);

      // Membership Logs
      let filteredMemberslogs = membershipLogs.filter(log => {
        const createdDate = new Date(log.created);
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0);
        end.setHours(23, 59, 59);
        return createdDate >= start && createdDate <= end;
      });
      if (selectedBranch) {
        filteredMemberslogs = filteredMemberslogs.filter(log => log.branch_id === selectedBranch);
      }
      setFilteredMembershiplogs(filteredMemberslogs);

      // Snacks
      let filteredSnacks = snacks_data.filter(snack => {
        const createdDate = new Date(snack.created);
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0);
        end.setHours(23, 59, 59);
        return createdDate >= start && createdDate <= end;
      });
      if (selectedBranch) {
        filteredSnacks = filteredSnacks.filter(snack => snack?.expand?.session_id?.branch_id === selectedBranch);
      }
      setFilteredSnacks(filteredSnacks);

      // Devices
      let filteredDevices = devices;
      if (selectedBranch) {
        filteredDevices = filteredDevices.filter(device => device.branch_id === selectedBranch);
      }
      setFilteredDevices(filteredDevices);
    }
  }, [sessions, cashlogs, membershipLogs, snacks_data, devices, startDate, endDate, selectedBranch]);

  return (
    <section className='px-10 py-4 w-full'>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-4">
          <DataFilter
            onBranchChange={setSelectedBranch}
          />
          {
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
          }
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
        <div className='grid gap-4'>
          <SessionRevenueCard sessions={FilteredSessions} />
          <SnacksRevenue sessions={FilteredSessions} snacks={FilteredSnacks} />
        </div>
        <div className='grid gap-4'>
          <TotalRevenueCard sessions={FilteredSessions} memberships={FilteredMembershiplogs} />
          <DeviceCard sessions={FilteredSessions} devices={FilteredDevices} />
        </div>
        <div className='grid gap-4'>
          <MembershipCard memberships={FilteredMembershiplogs} />
          <ExpensesCard sessions={FilteredSessions} cashlogs={FilteredCashlogs} />
        </div>
      </div>

      {/* Chart */}
      <Charts dateRangeType={dateRangeType} sessions={FilteredSessions} expenses={FilteredCashlogs} />


      {/* Table */}
      <div className='mt-8'>
        <SessionsTable data={FilteredSessions.slice(0, 5)} displayEditDel={false} />
      </div>
    </section>
  )
};
