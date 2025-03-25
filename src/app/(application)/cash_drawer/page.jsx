'use client';

import React, { useEffect, useState } from 'react'
import InitialiseValues from './components/InitialiseValues';
import { useCollection } from "@/lib/hooks/useCollection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataFilter from "@/components/superAdmin/DataFilter";
import { format_Date } from "@/lib/utils/formatDates";
import { startOfMonth, startOfWeek, startOfYear } from "date-fns";
import { isArray } from 'lodash';
import StatsCard from './components/StatsCard';
import { SessionsTable } from '@/components/sessions/SessionsTable';
import { MembershipLogsTable } from '../logs/memberships/components/LogsTable';
import { CashLogsTable } from '../logs/cashlog/components/LogsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { columns } from '../logs/cashlog/components/columns';
import { DrawerLogsTable } from './components/Table';
import { StaffDrawerLogsTable } from './components/StaffLogs';

const DATE_RANGE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];

export default function CashDrawerPage() {
  const { data: cashlogs } = useCollection("cashlog", {
    expand: "drawer_id,user_id,branch_id",
    sort: "-created",
  });
  const { data: sessions } = useCollection("sessions", {
    expand: 'customer_id,branch_id,device_id,game_id,session_snacks.snack_id,user_id,billed_by',
    sort: '-created',
  });
  const { data: cash_drawer, mutate } = useCollection('cash_drawer', {
    expand: 'branch_id',
    sort: '-created',
  });
  const { data: membershipLogs } = useCollection("membershipLog", {
    expand: "plan_id,user_id,branch_id,customer",
    sort: "-created",
  });
  const { data: staffLogs } = useCollection("cashIndrawer", {
    expand: "user_id,branch_id",
    sort: "-created",
  });

  const [dateRangeType, setDateRangeType] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [filteredDrawer, setFilteredDrawer] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [filteredCashlogs, setFilteredCashlogs] = useState([]);
  const [filteredMembershiplogs, setFilteredMembershiplogs] = useState([]);
  const [filteredStafflogs, setFilteredStafflogs] = useState([]);

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

  // Filter logs and calculations
  useEffect(() => {
    if (cash_drawer && isArray(sessions) && isArray(cashlogs)) {
      // Cash Drawer Logs
      let FilteredLogs = cash_drawer.filter(log => {
        const logDate = new Date(log.created);
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0);
        end.setHours(23, 59, 59);
        return logDate >= start && logDate <= end;
      });
      if (selectedBranch) {
        FilteredLogs = FilteredLogs.filter(log => log.branch_id === selectedBranch);
      }
      setFilteredDrawer(FilteredLogs)

      // Sessions
      let FilteredSessions = sessions.filter(session => {
        const createdDate = new Date(session.created);
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0);
        end.setHours(23, 59, 59);
        return createdDate >= start && createdDate <= end;
      });
      if (selectedBranch) {
        FilteredSessions = FilteredSessions.filter(session => session.branch_id === selectedBranch);
      }
      setFilteredSessions(FilteredSessions);

      // Cash Drawer Logs
      let FilteredCashlogs = cashlogs.filter(cashlog => {
        const createdDate = new Date(cashlog.created);
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0);
        end.setHours(23, 59, 59);
        return createdDate >= start && createdDate <= end && cashlog.category !== 'Drawer';
      });
      if (selectedBranch) {
        FilteredCashlogs = FilteredCashlogs.filter(cashlog => cashlog.branch_id === selectedBranch);
      }
      setFilteredCashlogs(filteredCashlogs);

      // Membership Logs
      let FilteredMemberslogs = membershipLogs.filter(log => {
        const createdDate = new Date(log.created);
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0);
        end.setHours(23, 59, 59);
        return createdDate >= start && createdDate <= end;
      });
      if (selectedBranch) {
        FilteredMemberslogs = FilteredMemberslogs.filter(log => log.branch_id === selectedBranch);
      }
      setFilteredMembershiplogs(FilteredMemberslogs);

      // Staff Logs
      let FilteredStafflogs = staffLogs.filter(log => {
        const createdDate = new Date(log.created);
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0);
        end.setHours(23, 59, 59);
        return createdDate >= start && createdDate <= end;
      });
      if (selectedBranch) {
        FilteredStafflogs = FilteredStafflogs.filter(log => log.branch_id === selectedBranch);
      }
      setFilteredStafflogs(FilteredStafflogs);

    }
  }, [sessions, cashlogs, membershipLogs, cash_drawer, startDate, endDate, selectedBranch]);

  return (
    <section className='p-10 w-full'>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Cash Drawer</h2>
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
          <InitialiseValues
            cashlogs={filteredCashlogs}
            sessions={filteredSessions}
            drawer_log={filteredDrawer}
            membershipLogs={filteredMembershiplogs}
            selectedBranch={selectedBranch}
            range={dateRangeType}
            mutate={mutate}
          />
        </div>
      </div>
      <StatsCard logs={filteredDrawer} selected_branch={selectedBranch} />
      <Tabs defaultValue="drawer" className="w-full pt-8">
        <TabsList className='w-full p-4'>
          <TabsTrigger className='w-full' value="drawer">Drawer</TabsTrigger>
          <TabsTrigger className='w-full' value="staff">Staff</TabsTrigger>
          <TabsTrigger className='w-full' value="sessions">Sessions</TabsTrigger>
          <TabsTrigger className='w-full' value="memberships">Memberships</TabsTrigger>
          <TabsTrigger className='w-full' value="cashlog">Cashlog</TabsTrigger>
        </TabsList>
        <TabsContent value="drawer">
          <DrawerLogsTable logs={filteredDrawer} />
        </TabsContent>
        <TabsContent value="staff">
          <StaffDrawerLogsTable logs={filteredStafflogs} />
        </TabsContent>
        <TabsContent value="sessions">
          <SessionsTable data={filteredSessions} displayEditDel={false} />
        </TabsContent>
        <TabsContent value="memberships">
          <MembershipLogsTable logs={filteredMembershiplogs} />
        </TabsContent>
        <TabsContent value="cashlog">
          <CashLogsTable
            columns={columns}
            data={filteredCashlogs}
          />
        </TabsContent>
      </Tabs>
    </section>
  )
};
