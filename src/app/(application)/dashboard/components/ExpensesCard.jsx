import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function ExpensesCard({ sessions = [], cashlogs = [] }) {
  const [Discount, setDiscount] = useState(0);
  const [Expenses, setExpenses] = useState(0);

  useEffect(() => {
    const fetchData = () => {
      const expense_total = cashlogs?.reduce((acc, cashlog) => acc + Number(cashlog?.withdraw_from_drawer?.amount) || 0, 0);
      console.log(cashlogs);
      setExpenses(expense_total);
      const discount_total = sessions.reduce((acc, session) => acc + Number(session?.discount_amount.toFixed(0)) || 0, 0);
      setDiscount(discount_total)
    }
    fetchData();
  }, [sessions, cashlogs]);

  return (
    <div className="flex items-center gap-4 w-full h-full">
      <Card className='w-full h-full'>
        <CardHeader>
          <CardTitle className='text-foreground/70 text-sm'> Expenses </CardTitle>
          <CardDescription className='text-xl font-semibold text-foreground'>
            ₹ {Expenses.toLocaleString()}
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className='w-full h-full'>
        <CardHeader>
          <CardTitle className='text-foreground/70 text-sm'> Discount </CardTitle>
          <CardDescription className='text-xl font-semibold text-foreground'> ₹ {Discount.toLocaleString()} </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
