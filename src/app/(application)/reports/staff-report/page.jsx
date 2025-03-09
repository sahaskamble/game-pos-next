'use client';

import React, { useState, useEffect } from 'react'
import { StatsCard } from './components/Stats';
import { ChartComponent } from './components/Chart';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StaffTable from './components/Table';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCollection } from "@/lib/hooks/useCollection";

function StaffReports() {
  const { data: users } = useCollection("users");
  const { data: staffLogins } = useCollection("staff_logins");
  const { data: branches } = useCollection("branches");

  const [staffStats, setStaffStats] = useState({
    total: 0,
    present: 0,
    onLeave: 0,
    attendance: 0
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [loginData, setLoginData] = useState([]);

  // Define all months
  const allMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  useEffect(() => {
    if (users && staffLogins) {
      // Filter only staff users (excluding SuperAdmin)
      const staffUsers = users.filter(user =>
        ['Staff', 'Admin', 'StoreManager'].includes(user.role)
      );

      // Get today's date in ISO format
      const today = new Date().toISOString().split('T')[0];

      // Get active logins for today
      const todayLogins = staffLogins.filter(login => {
        const loginDate = new Date(login.login_time).toISOString().split('T')[0];
        return loginDate === today && login.status === "active";
      });

      // Calculate stats
      const total = staffUsers.length;
      const present = todayLogins.length;

      setStaffStats({
        total,
        present,
        onLeave: 0, // Since we don't track leaves directly
        attendance: total ? Math.round((present / total) * 100) : 0
      });

      // Initialize data for all months with zero values
      const monthlyLoginCounts = {};
      const monthlyAttendanceRates = {};

      allMonths.forEach(month => {
        monthlyLoginCounts[month] = 0;
        monthlyAttendanceRates[month] = 0;
      });

      // Calculate monthly logins and attendance
      staffLogins.forEach(login => {
        const month = new Date(login.login_time).toLocaleString('default', { month: 'short' });
        monthlyLoginCounts[month] = (monthlyLoginCounts[month] || 0) + 1;

        if (login.status === 'active') {
          monthlyAttendanceRates[month] = (monthlyAttendanceRates[month] || 0) + 1;
        }
      });

      // Calculate attendance percentage and prepare chart data
      const attendanceChartData = allMonths.map(month => ({
        month,
        value: monthlyLoginCounts[month] > 0
          ? Math.round((monthlyAttendanceRates[month] / monthlyLoginCounts[month]) * 100)
          : 0
      }));

      const loginChartData = allMonths.map(month => ({
        month,
        value: monthlyLoginCounts[month]
      }));

      setAttendanceData(attendanceChartData);
      setLoginData(loginChartData);
    }
  }, [users, staffLogins]);

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <StatsCard stats={staffStats} />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <ChartComponent
          title="Monthly Attendance Rate"
          data={attendanceData}
          period="month"
          showDetails={true}
        />

        <ChartComponent
          title="Monthly Login Distribution"
          data={loginData}
          period="month"
          showDetails={true}
        />
      </div>

      {/* Staff Table Section */}
      <div className='p-4'>
        <StaffTable data={users?.filter(user =>
          ['Staff', 'Admin', 'StoreManager'].includes(user.role)
        )} />
      </div>
    </div>
  )
}

export default StaffReports;
