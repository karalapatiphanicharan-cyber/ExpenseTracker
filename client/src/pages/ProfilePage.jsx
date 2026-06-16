import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import {
  User as UserIcon,
  Mail,
  Wallet,
  Calendar,
  TrendingUp,
  PieChart,
  DollarSign,
  List,
  Download,
  RefreshCw,
  Award,
  Edit3
} from 'lucide-react';
import { cn } from '../utils/cn';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    budget: user?.budget || 0,
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get('/expenses');
        setExpenses(res.data.data);
      } catch (error) {
        console.error('Failed to fetch expenses');
      }
    };
    fetchExpenses();
  }, []);

  const stats = useMemo(() => {
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const count = expenses.length;
    const categories = {};
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const largestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;

    const now = new Date();
    const thisMonthTotal = expenses.filter(exp => {
      const d = new Date(exp.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((acc, curr) => acc + curr.amount, 0);

    return { totalSpent, count, topCategory, largestExpense, thisMonthTotal };
  }, [expenses]);

  const achievements = useMemo(() => {
    const list = [];
    if (expenses.length > 0) list.push({ title: 'First Expense Added', icon: Award, color: 'text-amber-500' });
    if (user?.budget > 0) list.push({ title: 'Budget Configured', icon: Award, color: 'text-blue-500' });
    if (expenses.length >= 10) list.push({ title: '10 Transactions Logged', icon: Award, color: 'text-emerald-500' });
    return list;
  }, [expenses, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Hero Section */}
      <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-gradient-to-br from-primary-600 to-indigo-700">
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 text-white">
          <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-5xl font-black border-4 border-white/30 shadow-2xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-black tracking-tight">{user?.name}</h1>
            <p className="text-primary-100 font-medium mt-1 opacity-90">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 text-sm font-bold">
                <Calendar size={16} />
                Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 text-sm font-bold">
                <List size={16} />
                {expenses.length} Transactions
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Button onClick={() => setIsEditing(true)} className="bg-white text-primary-600 hover:bg-primary-50 border-none">
              <Edit3 size={18} className="mr-2" />
              Edit Profile
            </Button>
            <Button variant="secondary" onClick={handleExportCSV} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Download size={18} className="mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Account Details */}
        <div className="space-y-8 lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <UserIcon size={20} className="text-primary-500" />
              Account Information
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1 block ml-1">Full Name</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold">
                  {user?.name}
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1 block ml-1">Email Address</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1 block ml-1">Member Since</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold">
                  {new Date(user?.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Award size={20} className="text-amber-500" />
              Achievements
            </h3>
            <div className="space-y-4">
              {achievements.map((ach, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.02]">
                  <div className={cn("p-2 rounded-xl bg-white dark:bg-slate-700 shadow-sm", ach.color)}>
                    <ach.icon size={20} />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{ach.title}</span>
                </div>
              ))}
              {achievements.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-4 italic">No achievements yet. Keep tracking!</p>
              )}
            </div>
          </Card>
        </div>

        {/* Statistics & Budget */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 bg-slate-900 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Wallet size={120} />
              </div>
              <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6">Monthly Budget</h3>
              <div className="relative z-10">
                <div className="flex items-end justify-between mb-4">
                  <span className="text-4xl font-black">${user?.budget?.toLocaleString() || 0}</span>
                  <span className="text-slate-400 text-sm font-bold mb-1">per month</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000",
                      (stats.thisMonthTotal / (user?.budget || 1)) > 0.9 ? "bg-red-500" : "bg-primary-500"
                    )}
                    style={{ width: `${Math.min((stats.thisMonthTotal / (user?.budget || 1)) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>{Math.round((stats.thisMonthTotal / (user?.budget || 1)) * 100)}% Used</span>
                  <span>${Math.max(0, (user?.budget || 0) - stats.thisMonthTotal).toLocaleString()} Left</span>
                </div>
              </div>
              <button
                onClick={() => { setIsEditing(true); setTimeout(() => document.getElementById('budget-input')?.focus(), 100); }}
                className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all border border-white/10"
              >
                Adjust Budget
              </button>
            </Card>

            <Card className="p-6 relative overflow-hidden group border-slate-100 dark:border-slate-800">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-primary-500">
                <TrendingUp size={120} />
              </div>
              <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6">Quick Stats</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                      <DollarSign size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Total Spent</span>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">${stats.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                      <PieChart size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Top Category</span>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">{stats.topCategory}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600">
                      <TrendingUp size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Largest Expense</span>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">${stats.largestExpense.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                      <List size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Transactions</span>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">{stats.count}</span>
                </div>
              </div>
              <Button variant="secondary" className="mt-7 w-full border-slate-200 dark:border-slate-700" onClick={() => toast('Redirecting to dashboard...', { icon: '📊' })}>
                View Details
              </Button>
            </Card>
          </div>

          <Card className="p-8 border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Edit Profile</h3>
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 size={16} className="mr-2" />
                  Edit
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Display Name"
                  placeholder="John Doe"
                  icon={UserIcon}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing || loading}
                  required
                />
                <div className="opacity-60">
                  <Input
                    label="Email Address"
                    icon={Mail}
                    value={user?.email}
                    disabled
                  />
                  <p className="mt-1.5 text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-wider">Cannot change email</p>
                </div>
                <Input
                  id="budget-input"
                  type="number"
                  label="Monthly Budget ($)"
                  placeholder="0"
                  icon={Wallet}
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  disabled={!isEditing || loading}
                  required
                />
                <div className="flex flex-col justify-end">
                   <Button variant="secondary" type="button" onClick={() => setFormData({ ...formData, budget: 0 })} disabled={!isEditing || loading} className="h-11">
                     <RefreshCw size={16} className="mr-2" />
                     Reset Budget
                   </Button>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4 pt-4 animate-in slide-in-from-top-2 duration-300">
                  <Button variant="secondary" type="button" onClick={() => { setIsEditing(false); setFormData({ name: user?.name, budget: user?.budget }); }} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" isLoading={loading}>
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
