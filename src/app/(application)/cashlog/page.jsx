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
import pb from "@/lib/pocketbase";

export default function CashlogPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [needsInitialCashDrawer, setNeedsInitialCashDrawer] = useState(false);

  const { data: cashlogs, loading, mutate } = useCollection("cashlog", {
    expand: "drawer_id,user_id,branch_id",
    sort: "-created",
  });

  // Get the latest cash in drawer amount
  const latestCashInDrawer = cashlogs?.[0]?.expand?.drawer_id?.cash_in_drawer || 0;

  useEffect(() => {
    if (user) {
      setIsSuperAdmin(user.role === "SuperAdmin");
      setIsAdmin(user.role === "Admin");
    }
  }, [user]);

  useEffect(() => {
    const checkInitialCashDrawer = async () => {
      if (!user) return;

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await pb.collection("cashIndrawer").getList(1, 1, {
          filter: `user_id = "${user.id}" && created >= "${today.toISOString()}"`,
        });

        setNeedsInitialCashDrawer(result.totalItems === 0);
      } catch (error) {
        console.error("Failed to check initial cash drawer:", error);
      }
    };

    checkInitialCashDrawer();
  }, [user]);

  return (
    <div className="container px-8 mx-auto py-10 space-y-8">
      {needsInitialCashDrawer && (
        <InitialCashDrawerDialog
          onSuccess={() => {
            setNeedsInitialCashDrawer(false);
            mutate();
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
            Last updated: {cashlogs?.[0] ? format(new Date(cashlogs[0].created), "dd/MM/yyyy HH:mm") : 'N/A'}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Cash Log</h2>
        {(isAdmin || isSuperAdmin) && <AddCashlogDialog onSuccess={() => mutate()} />}
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
