import { useMemo } from 'react';
import { Expense, Category } from '../lib/supabase';
import * as LucideIcons from 'lucide-react';

interface SpendingAnalysisProps {
  expenses: (Expense & { categories: Category })[];
}

export function SpendingAnalysis({ expenses }: SpendingAnalysisProps) {
  const analysis = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const catId = expense.category_id;
      if (!acc[catId]) {
        acc[catId] = {
          total: 0,
          count: 0,
          category: expense.categories,
        };
      }
      acc[catId].total += parseFloat(String(expense.amount));
      acc[catId].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number; category: Category }>);

    const totalSpent = Object.values(categoryTotals).reduce(
      (sum, cat) => sum + cat.total,
      0
    );

    const categoriesArray = Object.values(categoryTotals)
      .map((cat) => ({
        ...cat,
        percentage: (cat.total / totalSpent) * 100,
      }))
      .sort((a, b) => b.total - a.total);

    return { categoryTotals: categoriesArray, totalSpent };
  }, [expenses]);

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName.split('-').map((word, i) =>
      i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')];
    return IconComponent || LucideIcons.Circle;
  };

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Spending by Category
      </h3>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Total Spent</span>
          <span className="text-2xl font-bold text-gray-900">
            ${analysis.totalSpent.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {analysis.categoryTotals.map((item) => {
          const Icon = getIcon(item.category.icon);
          return (
            <div key={item.category.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${item.category.color}20` }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: item.category.color }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.category.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ${item.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.category.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
