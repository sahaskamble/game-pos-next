"use client";

import { useEffect, useState } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { useAuth } from "@/lib/context/AuthContext";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns";
import { AddCashlogDialog } from "./components/AddCashlogDialog";
import { InitialCashDrawerDialog } from "./components/InitialCashDrawerDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";
import { format } from "date-fns";

export default function CashlogPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [needsInitialCashDrawer, setNeedsInitialCashDrawer] = useState(false);
  const [previousDayClosingBalance, setPreviousDayClosingBalance] = useState(0);
  const [latestCashInDrawer, setLatestCashInDrawer] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Collection hooks
  const { data: cashlogs, loading } = useCollection("cashlog", {
    expand: "drawer_id,user_id,branch_id",
    sort: "-created",
  });

  const { data: cashDrawerEntries, loading: drawerLoading } = useCollection("cashIndrawer", {
    expand: "user_id,branch_id",
    sort: "-created",
  });

  useEffect(() => {
    if (user) {
      setIsSuperAdmin(user.role === "SuperAdmin");
      setIsAdmin(user.role === "Admin");
    }
  }, [user]);

  useEffect(() => {
    if (cashDrawerEntries?.length && user) {
      // Get today's start timestamp
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find today's entry for the current user
      const todayEntry = cashDrawerEntries.find(entry =>
        entry.user_id === user.id &&
        new Date(entry.created) >= today
      );

      if (todayEntry) {
        // If we have today's entry, use it for the display
        setLatestCashInDrawer(todayEntry.cash_in_drawer);
        setLastUpdated(todayEntry.created);
      } else {
        // If no entry today, check for previous day's entry
        const previousEntry = cashDrawerEntries.find(entry =>
          entry.branch_id === user.branch_id &&
          new Date(entry.created) < today
        );

        if (previousEntry) {
          setPreviousDayClosingBalance(previousEntry.cash_in_drawer);
        }
        setNeedsInitialCashDrawer(true);
      }
    }
  }, [user, cashDrawerEntries]);

  if (loading || drawerLoading) {
    return <div>Loading...</div>; // Consider using a proper loading component
  }

  return (
    <div className="container px-8 mx-auto py-10 space-y-8">
      {needsInitialCashDrawer && (
        <InitialCashDrawerDialog
          previousBalance={previousDayClosingBalance}
          onSuccess={() => {
            setNeedsInitialCashDrawer(false);
          }}
        />
      )}

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Current Cash in Drawer
          </CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{latestCashInDrawer.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated ? format(new Date(lastUpdated), "dd/MM/yyyy HH:mm") : 'N/A'}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Cash Log</h2>
        {<AddCashlogDialog onSuccess={() => mutate()} />}
      </div>

      <DataTable
        columns={columns}
        data={cashlogs || []}
        loading={loading}
        searchKey="category"
        searchPlaceholder="Filter by category..."
        meta={{
          isAdmin: isAdmin || isSuperAdmin,  // Combined check for admin access
          isSuperAdmin,
          onSuccess: () => mutate(),
        }}
      />
    </div>
  );
}
