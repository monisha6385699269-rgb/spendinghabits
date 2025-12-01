import { useState, useEffect } from 'react';
import { supabase, Expense, Category } from './lib/supabase';
import { AuthGuard } from './components/AuthGuard';
import { AddExpenseForm } from './components/AddExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { SpendingAnalysis } from './components/SpendingAnalysis';
import { SavingsTarget } from './components/SavingsTarget';
import { SmartTips } from './components/SmartTips';
import { User } from '@supabase/supabase-js';
import { Wallet, LogOut, Calendar } from 'lucide-react';

function App() {
  return (
    <AuthGuard>
      {(user) => <Dashboard user={user} />}
    </AuthGuard>
  );
}

function Dashboard({ user }: { user: User }) {
  const [expenses, setExpenses] = useState<(Expense & { categories: Category })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    loadExpenses();
  }, [selectedMonth]);

  async function loadExpenses() {
    setLoading(true);
    const startDate = `${selectedMonth}-01`;
    const endDate = new Date(
      parseInt(selectedMonth.split('-')[0]),
      parseInt(selectedMonth.split('-')[1]),
      0
    ).toISOString().split('T')[0];

    const { data } = await supabase
      .from('expenses')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (data) {
      setExpenses(data as any);
    }
    setLoading(false);
  }

  async function handleDeleteExpense(id: string) {
    await supabase.from('expenses').delete().eq('id', id);
    loadExpenses();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const currentMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    const [year, month] = selectedMonth.split('-').map(Number);
    return expDate.getMonth() === month - 1 && expDate.getFullYear() === year;
  });

  const totalSpent = currentMonthExpenses.reduce(
    (sum, exp) => sum + parseFloat(String(exp.amount)),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Finance Tracker</h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                ${totalSpent.toFixed(2)}
              </h2>
              <p className="text-gray-600">Total spent this period</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <SavingsTarget expenses={expenses} userId={user.id} />
          </div>
          <div className="lg:col-span-1">
            <SpendingAnalysis expenses={currentMonthExpenses} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <SmartTips expenses={expenses} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Expenses
          </h3>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : (
            <ExpenseList
              expenses={currentMonthExpenses}
              onDelete={handleDeleteExpense}
            />
          )}
        </div>
      </main>

      <AddExpenseForm onExpenseAdded={loadExpenses} />
    </div>
  );
}

export default App;
