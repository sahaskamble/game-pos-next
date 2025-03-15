"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";
import { format } from "date-fns";

export function BranchCashStats({ cashlogs, branches }) {
  // Group latest cash drawer entries by branch
  const branchCashStats = branches?.reduce((acc, branch) => {
    const branchCashlogs = cashlogs?.filter(
      (log) => log.expand?.branch_id?.id === branch.id
    );
    
    // Get the latest cashlog for this branch
    const latestCashlog = branchCashlogs?.[0];
    
    acc[branch.id] = {
      name: branch.name,
      cashInDrawer: latestCashlog?.expand?.drawer_id?.cash_in_drawer || 0,
      lastUpdated: latestCashlog?.created || null
    };
    
    return acc;
  }, {});

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.values(branchCashStats || {}).map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.name} - Cash in Drawer
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stat.cashInDrawer.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {stat.lastUpdated ? format(new Date(stat.lastUpdated), "dd/MM/yyyy HH:mm") : 'N/A'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}