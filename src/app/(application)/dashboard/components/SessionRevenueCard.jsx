import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function SessionRevenueCard({ sessions = [] }) {
  const [TotalRevenue, setTotalRevenue] = useState(0);
  useEffect(() => {
    const fetchData = () => {
      const sessions_total = sessions.reduce((acc, session) => acc + Number(session?.amount_paid) || 0, 0);
      setTotalRevenue(sessions_total)
    }
    if (sessions) {
      fetchData();

    }
  }, [sessions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-foreground/70 text-sm'> Session Revenue </CardTitle>
        <CardDescription className='text-2xl font-semibold text-foreground'> ₹ {TotalRevenue.toLocaleString()} </CardDescription>
      </CardHeader>
    </Card>
  )
};
