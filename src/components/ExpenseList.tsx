import { Expense, Category } from '../lib/supabase';
import { Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface ExpenseListProps {
  expenses: (Expense & { categories: Category })[];
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName.split('-').map((word, i) =>
      i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')];
    return IconComponent || LucideIcons.Circle;
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No expenses recorded yet. Add your first expense to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => {
        const Icon = getIcon(expense.categories.icon);
        return (
          <div
            key={expense.id}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${expense.categories.color}20` }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: expense.categories.color }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{expense.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{expense.categories.name}</span>
                    <span>•</span>
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-semibold text-gray-900">
                  ${parseFloat(String(expense.amount)).toFixed(2)}
                </p>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
