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
          receipt_url: item.receipt_url,
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

  const stats = expenses.reduce((acc, expense) => {
    // Total expenses
    acc.totalExpenses += expense.amount;

    // Category totals
    acc.categoryTotals[expense.category] = (acc.categoryTotals[expense.category] || 0) + expense.amount;

    // Monthly expenses
    const month = new Date(expense.created).toLocaleString('default', { month: 'short' });
    acc.monthlyExpenses[month] = (acc.monthlyExpenses[month] || 0) + expense.amount;

    return acc;
  }, {
    totalExpenses: 0,
    categoryTotals: {},
    monthlyExpenses: {},
  });

  // Get recent expenses (last 5)
  stats.recentExpenses = expenses
    .sort((a, b) => new Date(b.created) - new Date(a.created))
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
