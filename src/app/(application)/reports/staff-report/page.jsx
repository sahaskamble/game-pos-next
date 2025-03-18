'use client';

import { useEffect, useState } from 'react';
import StaffTable from './components/Table';
import { AttendanceDistributionChart, RoleDistributionChart } from './components/Charts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { useCollection } from '@/lib/hooks/useCollection';
import DataFilter from "@/components/superAdmin/DataFilter";
import { format_Date } from "@/lib/utils/formatDates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DATE_RANGE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];

export default function StaffReport() {
  const [staffData, setStaffData] = useState([]);
  const [stats, setStats] = useState({
    totalStaff: 0,
    averageAttendance: 0,
    excellentAttendance: 0,
    poorAttendance: 0,
  });
  const [dateRangeType, setDateRangeType] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const { data: staff } = useCollection('users', {
    expand: 'branch_id',
  });
  const { data: loginRecords } = useCollection('staff_logins');

  // Update date range based on selected option
  const updateDateRange = (option) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (option) {
      case "today":
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(today.setHours(23, 59, 59, 999));
        break;
      case "yesterday":
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case "this_week":
        start = startOfWeek(today, { weekStartsOn: 1 });
        end = new Date(today);
        end.setHours(23, 59, 59, 999);
        break;
      case "this_month":
        start = startOfMonth(today);
        end = new Date(today);
        end.setHours(23, 59, 59, 999);
        break;
      case "this_year":
        start = startOfYear(today);
        end = new Date(today);
        end.setHours(23, 59, 59, 999);
        break;
      case "custom":
        return;
      default:
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(today.setHours(23, 59, 59, 999));
    }

    setStartDate(format_Date(start));
    setEndDate(format_Date(end));
  };

  const handleDateRangeTypeChange = (value) => {
    setDateRangeType(value);
    updateDateRange(value);
  };


  useEffect(() => {
    async function fetchData() {
      if (!dateRangeType) {
        handleDateRangeTypeChange('today');
      }

      if (!loginRecords || !staff) {
        return;
      }

      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0);
        end.setHours(23, 59, 59);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));


        const loginDatewise = loginRecords.filter((login_entry) => {
          const login_date = new Date(login_entry?.login_time);
          return login_date >= start && login_date <= end;
        });

        // Calculate attendance for each staff member
        const staffWithAttendance = staff.map(member => {
          const userLogins = loginDatewise.filter(log => log.user_id === member.id);
          // Get unique days when the user was present
          const uniqueDays = new Set(
            userLogins.map(log => new Date(log.created).toDateString())
          );
          const daysPresent = uniqueDays.size;
          return {
            ...member,
            daysPresent,
          };
        });

        // Calculate statistics
        const totalStaff = staffWithAttendance.length;
        const averageAttendance = staffWithAttendance.reduce((acc, staff) => acc + staff.daysPresent, 0) / totalStaff;
        const excellentAttendance = staffWithAttendance.filter(staff => staff.daysPresent >= totalDays).length;
        const poorAttendance = totalStaff - excellentAttendance;

        setStats({
          totalStaff,
          averageAttendance: Math.round(averageAttendance * 10) / 10,
          excellentAttendance,
          poorAttendance,
        });

        setStaffData(staffWithAttendance);
      } catch (error) {
        console.error('Error fetching staff data:', error);
      }
    }

    fetchData();
  }, [staff, loginRecords, startDate, endDate, dateRangeType]);

  return (
    <div className="container mx-auto p-10 space-y-8">
      <div className="flex items-center justify-between p-4 pb-6">
        <h1 className="text-2xl font-bold">Staff Report</h1>
        <div className="flex items-center gap-4">
          {dateRangeType && (
            <>
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
              {dateRangeType === "custom" && (
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance} days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excellent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.excellentAttendance}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Poor Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.poorAttendance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <AttendanceDistributionChart data={staffData} />
        <RoleDistributionChart data={staffData} />
      </div>

      {/* Table */}
      <StaffTable data={staffData} />
    </div>
  );
}
