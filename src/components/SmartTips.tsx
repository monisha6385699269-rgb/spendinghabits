import { useMemo } from 'react';
import { Expense, Category } from '../lib/supabase';
import { Lightbulb, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface SmartTipsProps {
  expenses: (Expense & { categories: Category })[];
}

export function SmartTips({ expenses }: SmartTipsProps) {
  const tips = useMemo(() => {
    const tipsList: Array<{ type: 'warning' | 'success' | 'info'; message: string }> = [];

    const currentMonthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return (
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear()
      );
    });

    const lastMonthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return (
        expDate.getMonth() === lastMonth.getMonth() &&
        expDate.getFullYear() === lastMonth.getFullYear()
      );
    });

    const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
      const catName = expense.categories.name;
      acc[catName] = (acc[catName] || 0) + parseFloat(String(expense.amount));
      return acc;
    }, {} as Record<string, number>);

    const lastMonthCategoryTotals = lastMonthExpenses.reduce((acc, expense) => {
      const catName = expense.categories.name;
      acc[catName] = (acc[catName] || 0) + parseFloat(String(expense.amount));
      return acc;
    }, {} as Record<string, number>);

    const totalCurrentMonth = currentMonthExpenses.reduce(
      (sum, exp) => sum + parseFloat(String(exp.amount)),
      0
    );
    const totalLastMonth = lastMonthExpenses.reduce(
      (sum, exp) => sum + parseFloat(String(exp.amount)),
      0
    );

    if (totalLastMonth > 0) {
      const percentageChange = ((totalCurrentMonth - totalLastMonth) / totalLastMonth) * 100;
      if (percentageChange > 20) {
        tipsList.push({
          type: 'warning',
          message: `Your spending is ${percentageChange.toFixed(1)}% higher than last month. Consider reviewing your budget.`,
        });
      } else if (percentageChange < -10) {
        tipsList.push({
          type: 'success',
          message: `Great job! You've reduced spending by ${Math.abs(percentageChange).toFixed(1)}% compared to last month.`,
        });
      }
    }

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      const percentage = (topAmount / totalCurrentMonth) * 100;
      if (percentage > 40) {
        tipsList.push({
          type: 'warning',
          message: `${topCategory} accounts for ${percentage.toFixed(1)}% of your spending. Look for ways to reduce costs in this category.`,
        });
      }
    }

    for (const [category, currentAmount] of Object.entries(categoryTotals)) {
      const lastAmount = lastMonthCategoryTotals[category] || 0;
      if (lastAmount > 0) {
        const change = ((currentAmount - lastAmount) / lastAmount) * 100;
        if (change > 50) {
          tipsList.push({
            type: 'warning',
            message: `Your ${category} spending has increased by ${change.toFixed(1)}% this month.`,
          });
        }
      }
    }

    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();
    const currentDay = new Date().getDate();
    const dailyAverage = totalCurrentMonth / currentDay;
    const projectedTotal = dailyAverage * daysInMonth;

    if (currentDay > 7 && projectedTotal > totalLastMonth * 1.2) {
      tipsList.push({
        type: 'warning',
        message: `At your current pace, you're projected to spend $${projectedTotal.toFixed(2)} this month. Consider slowing down.`,
      });
    }

    if (categoryTotals['Food & Dining']) {
      const foodSpending = categoryTotals['Food & Dining'];
      if (foodSpending > totalCurrentMonth * 0.3) {
        tipsList.push({
          type: 'info',
          message: 'Meal planning and cooking at home can significantly reduce food expenses.',
        });
      }
    }

    if (categoryTotals['Entertainment']) {
      const entertainment = categoryTotals['Entertainment'];
      if (entertainment > totalCurrentMonth * 0.2) {
        tipsList.push({
          type: 'info',
          message: 'Look for free or low-cost entertainment alternatives like community events or parks.',
        });
      }
    }

    if (currentMonthExpenses.length >= 10 && tipsList.length === 0) {
      tipsList.push({
        type: 'success',
        message: 'Your spending patterns look healthy! Keep tracking your expenses to maintain good financial habits.',
      });
    }

    if (tipsList.length === 0) {
      tipsList.push({
        type: 'info',
        message: 'Add more expenses to receive personalized insights and recommendations.',
      });
    }

    return tipsList;
  }, [expenses]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Smart Finance Tips
      </h3>
      <div className="space-y-3">
        {tips.map((tip, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getBgColor(tip.type)} transition-all hover:shadow-sm`}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">{getIcon(tip.type)}</div>
              <p className="text-sm text-gray-700 leading-relaxed">{tip.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
