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
  CreditCard,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Target,
  Clock,
  RefreshCw
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
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);

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

  const insights = useMemo(() => {
    const result = [];
    if (loading || expenses.length === 0) return result;

    const now = new Date();
    const thisMonthExpenses = expenses.filter(exp => {
      const date = new Date(exp.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const thisMonthTotal = thisMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const budget = user?.budget || 0;

    // 1. Budget Usage
    if (budget > 0) {
      const percent = Math.round((thisMonthTotal / budget) * 100);
      if (percent >= 100) {
        result.push({ text: `You've exceeded your monthly budget by $${(thisMonthTotal - budget).toLocaleString()}.`, icon: AlertCircle, color: 'text-red-500' });
      } else if (percent >= 80) {
        result.push({ text: `You've spent ${percent}% of your monthly budget.`, icon: AlertCircle, color: 'text-amber-500' });
      } else {
        result.push({ text: "Great job staying under budget this month!", icon: TrendingUp, color: 'text-emerald-500' });
      }
    }

    // 2. Top Category
    const categories = {};
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      result.push({ text: `${topCategory[0]} is your highest spending category at $${topCategory[1].toLocaleString()}.`, icon: PieChartIcon, color: 'text-primary-500' });
    }

    // 3. Subscriptions check
    if (categories['Subscriptions'] > 0) {
      result.push({ text: "Consider reviewing your subscription expenses to save more.", icon: DollarSign, color: 'text-indigo-500' });
    }

    // 4. Large Expense check
    const largest = expenses.length > 0 ? [...expenses].sort((a, b) => b.amount - a.amount)[0] : null;
    if (largest && largest.amount > 500) {
      result.push({ text: `Your largest expense was ${largest.title} ($${largest.amount.toLocaleString()}).`, icon: ArrowDownRight, color: 'text-rose-500' });
    }

    return result.slice(0, 5);
  }, [expenses, user, loading]);

  const suggestions = useMemo(() => {
    const list = [
      { text: "Consider reducing subscription expenses to save more.", icon: Zap },
      { text: "Set a weekly spending limit to keep your budget in check.", icon: Clock },
      { text: "Set a savings goal for your next big purchase.", icon: Target },
      { text: "Review recurring payments and cancel unused ones.", icon: RefreshCw },
      { text: "Try tracking groceries separately for better visibility.", icon: Sparkles }
    ];
    return list;
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
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Here's what's happening with your finances today.</p>
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
      {stats.budget > 0 && (
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
              {stats.remainingBudget < 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-200 rounded-lg border border-red-500/30 text-sm font-semibold">
                  <AlertCircle size={16} />
                  Budget Exceeded
                </div>
              )}
            </div>
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
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        {[
          { label: 'Total Spending', value: `$${stats.total.toLocaleString()}`, icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'This Month Spending', value: `$${stats.thisMonthTotal.toLocaleString()}`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
          { label: 'Remaining Budget', value: `$${Math.max(0, stats.remainingBudget).toLocaleString()}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Monthly Budget', value: `$${stats.budget.toLocaleString()}`, icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Largest Expense', value: stats.largestExpense ? `$${stats.largestExpense.amount.toLocaleString()}` : 'N/A', icon: ArrowDownRight, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Average Daily Spending', value: `$${stats.averageDaily.toFixed(2)}`, icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Top Spending Category', value: stats.topCategory, icon: PieChartIcon, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((item, i) => (
          <Card key={i} className="p-4 flex flex-col items-center text-center justify-center border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
            <div className={cn("p-3 rounded-2xl mb-3", item.bg, item.color)}>
              <item.icon size={22} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white truncate w-full px-2">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Financial Insights */}
        <Card className="lg:col-span-4 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-primary-500" />
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Financial Insights</h3>
          </div>
          <div className="flex-1 space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-sm">
                  <div className={cn("mt-0.5 p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-sm", insight.color)}>
                    <insight.icon size={16} />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    {insight.text}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3">
                  <PieChartIcon size={24} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                  Add more data to see personalized financial insights.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Smart Suggestions & Charts */}
        <div className="lg:col-span-8 space-y-8">
          {/* Smart Suggestions */}
          <Card className="p-0 overflow-hidden border-primary-100 dark:border-primary-900/30">
            <button
              onClick={() => setIsSuggestionsOpen(!isSuggestionsOpen)}
              className="w-full flex items-center justify-between p-6 bg-primary-50/30 dark:bg-primary-900/10 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
                  <Sparkles size={18} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">Smart Suggestions</h3>
              </div>
              {isSuggestionsOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>

            {isSuggestionsOpen && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
                {suggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 transition-all shadow-sm">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-primary-500">
                      <suggestion.icon size={16} />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-tight mt-0.5">
                      {suggestion.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Charts */}
          <Card>
            <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-slate-400" />
              <h3 className="font-bold text-slate-800 dark:text-white">Monthly Spending Trend</h3>
            </div>
          </div>
          <div className="h-72">
            {expenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Total Spending']}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#0ea5e9"
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#0ea5e9', strokeWidth: 3, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <EmptyState
                  title="No trend data"
                  description="Start logging expenses to see your spending trend."
                />
              </div>
            )}
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-5">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon size={20} className="text-slate-400" />
            <h3 className="font-bold text-slate-800 dark:text-white">Category Split</h3>
          </div>
          <div className="h-72">
            {expenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#fff', color: '#1e293b' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  title="No data"
                  description="Log expenses to see category breakdown."
                />
              </div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-7">
          <div className="flex items-center gap-2 mb-6">
            <List size={20} className="text-slate-400" />
            <h3 className="font-bold text-slate-800 dark:text-white">Category Comparison</h3>
          </div>
          <div className="h-72">
            {expenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.pieData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Total']}
                  />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  title="No data"
                  description="Add expenses to compare categories."
                />
              </div>
            )}
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
                className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm w-full md:w-72 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:text-white"
                placeholder="Search expenses, merchants, or notes..."
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
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-5">Expense Name</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Merchant</th>
                  <th className="px-6 py-5">Payment Method</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAndSortedExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{exp.title}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 italic">{exp.description || 'No notes'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-tight">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {exp.merchant ? (
                        <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-md">
                          {exp.merchant}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{exp.paymentMethod || 'Cash'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white text-base">
                        ${exp.amount.toLocaleString()}
                      </span>
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
