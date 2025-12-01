import { useState, useEffect } from 'react';
import { supabase, Expense } from '../lib/supabase';
import { Target, TrendingUp, Edit2, Check } from 'lucide-react';

interface SavingsTargetProps {
  expenses: Expense[];
  userId: string;
}

export function SavingsTarget({ expenses, userId }: SavingsTargetProps) {
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

  useEffect(() => {
    loadSavingsTarget();
  }, [userId]);

  async function loadSavingsTarget() {
    const { data } = await supabase
      .from('savings_targets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .maybeSingle();

    if (data) {
      setTargetAmount(parseFloat(String(data.target_amount)));
      setInputValue(String(data.target_amount));
    } else {
      const suggestedTarget = calculateSuggestedTarget();
      setTargetAmount(suggestedTarget);
      setInputValue(String(suggestedTarget));
    }
  }

  function calculateSuggestedTarget() {
    const currentMonthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return (
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear()
      );
    });

    const totalSpent = currentMonthExpenses.reduce(
      (sum, exp) => sum + parseFloat(String(exp.amount)),
      0
    );

    return Math.round(totalSpent * 0.2);
  }

  async function handleSaveTarget() {
    setLoading(true);
    const amount = parseFloat(inputValue);

    const { error } = await supabase
      .from('savings_targets')
      .upsert({
        user_id: userId,
        month: currentMonth,
        target_amount: amount,
      }, {
        onConflict: 'user_id,month'
      });

    if (!error) {
      setTargetAmount(amount);
      setIsEditing(false);
    }
    setLoading(false);
  }

  const currentMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    const now = new Date();
    return (
      expDate.getMonth() === now.getMonth() &&
      expDate.getFullYear() === now.getFullYear()
    );
  });

  const totalSpent = currentMonthExpenses.reduce(
    (sum, exp) => sum + parseFloat(String(exp.amount)),
    0
  );

  const remainingBudget = targetAmount > 0 ? targetAmount - totalSpent : 0;
  const progressPercentage = targetAmount > 0 ? (totalSpent / targetAmount) * 100 : 0;
  const isOverBudget = progressPercentage > 100;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 shadow-sm border border-green-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Monthly Savings Target
          </h3>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-600 hover:text-green-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            step="0.01"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Set your target"
          />
          <button
            onClick={handleSaveTarget}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm text-gray-600">Target Amount</span>
            <span className="text-2xl font-bold text-green-600">
              ${targetAmount.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Spent this month</span>
            <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
              ${totalSpent.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                isOverBudget ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-green-200">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${isOverBudget ? 'text-red-600' : 'text-green-600'}`} />
            <span className="text-sm text-gray-600">
              {isOverBudget ? 'Over budget' : 'Remaining budget'}
            </span>
          </div>
          <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
            ${isOverBudget ? (totalSpent - targetAmount).toFixed(2) : remainingBudget.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
