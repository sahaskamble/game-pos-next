'use client';

import { useEffect, useState } from 'react';
import StaffTable from './components/Table';
import { AttendanceDistributionChart, RoleDistributionChart } from './components/Charts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import pb from '@/lib/pocketbase';

export default function StaffReport() {
  const [staffData, setStaffData] = useState([]);
  const [stats, setStats] = useState({
    totalStaff: 0,
    averageAttendance: 0,
    excellentAttendance: 0,
    poorAttendance: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch staff members with their branch information
        const staff = await pb.collection('users').getFullList({
          expand: 'branch_id',
        });

        // Fetch login records for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const loginRecords = await pb.collection('staff_logins').getFullList({
          filter: `created >= "${thirtyDaysAgo.toISOString()}"`,
        });

        // Calculate attendance for each staff member
        const staffWithAttendance = staff.map(member => {
          const userLogins = loginRecords.filter(log => log.user_id === member.id);
          
          // Get unique days when the user was present
          const uniqueDays = new Set(
            userLogins.map(log => new Date(log.created).toDateString())
          );
          
          const daysPresent = uniqueDays.size;
          const daysAbsent = 30 - daysPresent; // Assuming we're looking at 30 days

          return {
            ...member,
            daysPresent,
            daysAbsent,
          };
        });

        // Calculate statistics
        const totalStaff = staffWithAttendance.length;
        const averageAttendance = staffWithAttendance.reduce((acc, staff) => acc + staff.daysPresent, 0) / totalStaff;
        const excellentAttendance = staffWithAttendance.filter(staff => staff.daysPresent >= 25).length;
        const poorAttendance = staffWithAttendance.filter(staff => staff.daysPresent < 15).length;

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
  }, []);

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-2xl font-bold">Staff Report</h1>
      
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
