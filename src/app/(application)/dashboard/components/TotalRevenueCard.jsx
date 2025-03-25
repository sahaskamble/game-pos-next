import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function TotalRevenueCard({ sessions = [], memberships = [] }) {
  const [TotalRevenue, setTotalRevenue] = useState(0);
  useEffect(() => {
    const fetchData = () => {
      const sessions_total = sessions.reduce((acc, session) => acc + Number(session?.amount_paid) || 0, 0);
      const membership_total = memberships.reduce((acc, log) => acc + Number(log.expand.plan_id.selling_price) || 0, 0);
      setTotalRevenue(sessions_total + membership_total)
    }
    if (sessions && memberships) {
      fetchData();

    }
  }, [sessions, memberships]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-foreground/70 text-sm'> Revenue Generated </CardTitle>
        <CardDescription className='text-2xl font-semibold text-foreground'> ₹ {TotalRevenue.toLocaleString()} </CardDescription>
      </CardHeader>
    </Card>
  )
};
