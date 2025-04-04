import { getRecords } from "@/lib/PbUtilityFunctions";

export const getExpenses = async () => {
  try {
    const response = await getRecords('cashlog');
    let data = [];

    if (response?.success) {
      console.log(response)
      data = response.data.map((item) => {
        let formattedDate = formatDate(item.created);

        return {
          id: item.id,
          date: formattedDate,
          category: item.category,
          description: item.description,
          amount: item.withdraw_from_drawer.amount,
          created_by: item.withdraw_from_drawer.taken_by || 'Unknown',
          status: item.status || 'completed',
          branch_id: item.branch_id
        };
      });
    }

    return data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

export const getExpenseStats = (expenses) => {
  if (!expenses?.length) return {
    totalExpenses: 0,
    categoryTotals: {},
    monthlyExpenses: {},
    recentExpenses: []
  };

  const stats = expenses
    ?.filter((expense) => expense?.category !== 'Drawer')
    ?.reduce((acc, expense) => {
      // Total expenses
      acc.totalExpenses += Number(expense.amount) || 0;

      // Category totals
      acc.categoryTotals[expense.category] = (acc.categoryTotals[expense.category] || 0) + (Number(expense.amount) || 0);

      // Monthly expenses
      // Parse the date string (DD/MM/YYYY, HH:mm aa)
      const [datePart] = expense.date.split(',');
      const [day, month, year] = datePart.split('/');
      const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'short' });
      
      acc.monthlyExpenses[monthName] = (acc.monthlyExpenses[monthName] || 0) + (Number(expense.amount) || 0);

      return acc;
    }, {
      totalExpenses: 0,
      categoryTotals: {},
      monthlyExpenses: {},
    });

  // Get recent expenses (last 5)
  stats.recentExpenses = expenses
    .sort((a, b) => {
      const [aDatePart] = a.date.split(',');
      const [aDay, aMonth, aYear] = aDatePart.split('/');
      const aDate = new Date(aYear, aMonth - 1, aDay);

      const [bDatePart] = b.date.split(',');
      const [bDay, bMonth, bYear] = bDatePart.split('/');
      const bDate = new Date(bYear, bMonth - 1, bDay);

      return bDate - aDate;
    })
    .slice(0, 5);

  return stats;
};

const formatDate = (dateString) => {
  try {
    const isoDateString = dateString.includes('T') ? dateString : dateString.replace(' ', 'T');
    const date = new Date(isoDateString);

    if (isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date unavailable";
  }
};
