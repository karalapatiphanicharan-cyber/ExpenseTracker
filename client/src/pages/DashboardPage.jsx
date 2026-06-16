import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';
import {
  TrendingUp,
  DollarSign,
  List,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  PieChart as PieChartIcon,
  Download,
  AlertCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Settings
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';
import ExpenseModal from '../components/ExpenseModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const stats = useMemo(() => {
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const count = expenses.length;
    const now = new Date();

    const thisMonthExpenses = expenses.filter(exp => {
      const date = new Date(exp.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const thisMonthTotal = thisMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    const budget = user?.budget || 0;
    const remainingBudget = budget - thisMonthTotal;

    const categories = {};
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const largestExpense = expenses.length > 0 ? [...expenses].sort((a, b) => b.amount - a.amount)[0] : null;

    // Average daily spending this month
    const daysInMonthSoFar = now.getDate();
    const averageDaily = thisMonthTotal / Math.max(daysInMonthSoFar, 1);

    return { total, count, thisMonthTotal, budget, remainingBudget, topCategory, largestExpense, averageDaily };
  }, [expenses, user]);

  const filteredAndSortedExpenses = useMemo(() => {
    let result = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();

      const matchesSearch =
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exp.merchant && exp.merchant.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;

      let matchesTime = true;
      if (timeFilter === 'Today') {
        matchesTime = expDate.toDateString() === now.toDateString();
      } else if (timeFilter === 'This Week') {
        const startOfWeek = new Date();
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0,0,0,0);
        matchesTime = expDate >= startOfWeek;
      } else if (timeFilter === 'This Month') {
        matchesTime = expDate.getMonth() === new Date().getMonth() && expDate.getFullYear() === new Date().getFullYear();
      }

      return matchesSearch && matchesCategory && matchesTime;
    });

    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [expenses, searchTerm, categoryFilter, timeFilter, sortConfig]);

  const chartData = useMemo(() => {
    const categories = {};
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    const pieData = Object.keys(categories).map(key => ({ name: key, value: categories[key] }));

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      trendData.push({
        month: months[d.getMonth()],
        year: d.getFullYear(),
        total: 0
      });
    }

    expenses.forEach(exp => {
      const d = new Date(exp.date);
      const m = months[d.getMonth()];
      const y = d.getFullYear();
      const match = trendData.find(item => item.month === m && item.year === y);
      if (match) match.total += exp.amount;
    });

    return { pieData, trendData };
  }, [expenses]);

  const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  const handleExportCSV = () => {
    try {
      const headers = ['Expense Name', 'Amount', 'Category', 'Payment Method', 'Merchant', 'Date', 'Notes'];
      const rows = expenses.map(exp => [
        `"${(exp.title || '').replace(/"/g, '""')}"`,
        exp.amount,
        `"${(exp.category || '').replace(/"/g, '""')}"`,
        `"${(exp.paymentMethod || 'Cash').replace(/"/g, '""')}"`,
        `"${(exp.merchant || '').replace(/"/g, '""')}"`,
        `"${new Date(exp.date).toLocaleDateString()}"`,
        `"${(exp.description || '').replace(/"/g, '""')}"`
      ].join(','));

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={18} className="mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => { setCurrentExpense(null); setIsModalOpen(true); }}>
            <Plus size={18} className="mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Budget Progress */}
      <Card className="border-none bg-slate-900 dark:bg-slate-800 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Wallet size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Monthly Budget</p>
              <h3 className="text-3xl font-bold">${stats.thisMonthTotal.toLocaleString()} / ${stats.budget.toLocaleString()}</h3>
            </div>
            <div className="flex items-center gap-3">
              {stats.budget > 0 && stats.remainingBudget < 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-200 rounded-lg border border-red-500/30 text-sm font-semibold">
                  <AlertCircle size={16} />
                  Budget Exceeded
                </div>
              )}
              <Link to="/profile" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                <Settings size={20} />
              </Link>
            </div>
          </div>
          {stats.budget > 0 ? (
            <>
              <div className="h-3 bg-slate-800 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                  className={cn(
                    "h-full transition-all duration-1000",
                    stats.thisMonthTotal / stats.budget > 0.9 ? "bg-red-500" : "bg-primary-500"
                  )}
                  style={{ width: `${Math.min((stats.thisMonthTotal / stats.budget) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">{((stats.thisMonthTotal / stats.budget) * 100).toFixed(1)}% spent</span>
                <span className={cn(stats.remainingBudget < 0 ? "text-red-400" : "text-slate-400")}>
                  ${Math.abs(stats.remainingBudget).toLocaleString()} {stats.remainingBudget < 0 ? 'over' : 'left'}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-start gap-4 mt-2">
              <p className="text-slate-400 text-sm italic">You haven't set a monthly budget yet.</p>
              <Button as={Link} to="/profile" size="sm" className="bg-white/10 hover:bg-white/20 border-none shadow-none">
                Set Budget
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {[
          { label: 'Total Spent', value: `$${stats.total.toLocaleString()}`, icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'This Month', value: `$${stats.thisMonthTotal.toLocaleString()}`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
          { label: 'Remaining', value: `$${Math.max(0, stats.remainingBudget).toLocaleString()}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Avg. Daily', value: `$${stats.averageDaily.toFixed(2)}`, icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Largest', value: stats.largestExpense ? `$${stats.largestExpense.amount.toLocaleString()}` : 'N/A', icon: ArrowDownRight, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Top Category', value: stats.topCategory, icon: PieChartIcon, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((item, i) => (
          <Card key={i} className="p-5 flex flex-col items-center text-center justify-center border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
            <div className={cn("p-3 rounded-2xl mb-3", item.bg, item.color)}>
              <item.icon size={22} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white truncate w-full px-2">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon size={20} className="text-slate-400" />
            <h3 className="font-bold text-slate-800 dark:text-white">Category Split</h3>
          </div>
          <div className="h-64">
            {expenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#fff', color: '#1e293b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No data</div>}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-slate-400" />
            <h3 className="font-bold text-slate-800 dark:text-white">Monthly Spending Trend</h3>
          </div>
          <div className="h-64">
            {expenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No data</div>}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-6">
            <List size={20} className="text-slate-400" />
            <h3 className="font-bold text-slate-800 dark:text-white">Category Comparison</h3>
          </div>
          <div className="h-64">
            {expenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.pieData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RechartsTooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No data</div>}
          </div>
        </Card>
      </div>

      {/* Expense List View */}
      <Card className="p-0 overflow-hidden border-slate-100 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Transaction History</h3>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {['All', 'Today', 'This Week', 'This Month'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    timeFilter === filter
                      ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 md:flex-none">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:text-white"
                placeholder="Search name, merchant, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {[
                'Food & Dining', 'Groceries', 'Transportation', 'Rent', 'Utilities',
                'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Travel',
                'Salary', 'Investment', 'EMI', 'Insurance', 'Subscriptions',
                'Personal Care', 'Gifts', 'Other'
              ].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white cursor-pointer"
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split('-');
                setSortConfig({ key, direction });
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredAndSortedExpenses.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAndSortedExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{exp.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {exp.merchant && <span className="text-[10px] bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded font-bold">{exp.merchant}</span>}
                        <p className="text-xs text-slate-400 line-clamp-1">{exp.description || 'No notes'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-0.5 w-fit rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {exp.category}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold px-1 uppercase tracking-tight">{exp.paymentMethod || 'Cash'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      ${exp.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setCurrentExpense(exp); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { setExpenseToDelete(exp); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              title="No transactions found"
              description={searchTerm || categoryFilter !== 'All' ? "Try adjusting your filters or search terms." : "You haven't recorded any expenses yet."}
              actionLabel={searchTerm || categoryFilter !== 'All' ? null : "Add your first expense"}
              onAction={() => setIsModalOpen(true)}
            />
          )}
        </div>
      </Card>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expense={currentExpense}
        onSuccess={fetchExpenses}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          try {
            await api.delete(`/expenses/${expenseToDelete._id}`);
            toast.success('Expense deleted successfully');
            fetchExpenses();
          } catch (error) {
            toast.error('Failed to delete expense');
          } finally {
            setIsDeleteModalOpen(false);
          }
        }}
        itemName={expenseToDelete?.title}
      />
    </div>
  );
};

export default DashboardPage;
