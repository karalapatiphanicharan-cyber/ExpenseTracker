import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Calendar, Tag, CreditCard, Store, FileText, DollarSign } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Button from './Button';
import Input from './Input';
import { cn } from '../utils/cn';

const categories = [
  { name: 'Food & Dining', icon: '🍴' },
  { name: 'Groceries', icon: '🛒' },
  { name: 'Transportation', icon: '🚗' },
  { name: 'Rent', icon: '🏠' },
  { name: 'Utilities', icon: '💡' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Education', icon: '🎓' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Salary', icon: '💰' },
  { name: 'Investment', icon: '📈' },
  { name: 'Insurance', icon: '🛡️' },
  { name: 'Subscriptions', icon: '📱' },
  { name: 'Other', icon: '📦' }
];

const paymentMethods = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Wallet'];

const ExpenseModal = ({ isOpen, onClose, expense, onSuccess }) => {
  const initialFormState = {
    title: '',
    amount: '',
    category: 'Food & Dining',
    paymentMethod: 'Cash',
    merchant: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        amount: expense.amount,
        category: expense.category || 'Food & Dining',
        paymentMethod: expense.paymentMethod || 'Cash',
        merchant: expense.merchant || '',
        description: expense.description || '',
        date: new Date(expense.date).toISOString().split('T')[0]
      });
    } else {
      setFormData(initialFormState);
    }

    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [expense, isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Expense Name is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount > 0 is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        merchant: formData.merchant.trim(),
        description: formData.description.trim()
      };

      if (expense) {
        await api.put(`/expenses/${expense._id}`, dataToSubmit);
        toast.success('Expense updated successfully');
      } else {
        await api.post('/expenses', dataToSubmit);
        toast.success('Expense added successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const setDateShortcut = (type) => {
    const date = new Date();
    if (type === 'yesterday') date.setDate(date.getDate() - 1);
    setFormData({ ...formData, date: date.toISOString().split('T')[0] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800"
        onKeyDown={(e) => e.key === 'Enter' && !loading && e.target.tagName !== 'TEXTAREA' && handleSubmit()}
      >
        <div className="flex items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {expense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Keep track of your spending habits</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all shadow-sm">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Expense Name</label>
            <Input
              ref={nameInputRef}
              placeholder="e.g. Grocery Shopping"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
              className="text-lg font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={cn(
                    "w-full h-11 pl-8 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-right font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all",
                    errors.amount && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  )}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
                {errors.amount && <p className="mt-1 text-xs text-red-500 ml-1">{errors.amount}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Category</label>
              <div className="relative group">
                <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary-500 transition-colors" />
                <select
                  className="w-full h-11 pl-11 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <X size={14} className="rotate-45" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Payment Method</label>
              <div className="relative group">
                <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary-500 transition-colors" />
                <select
                  className="w-full h-11 pl-11 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <X size={14} className="rotate-45" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Merchant <span className="text-slate-400 font-normal">(Optional)</span></label>
              <Input
                placeholder="e.g. Amazon, Starbucks"
                icon={Store}
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setDateShortcut('today')} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500 hover:text-primary-600 transition-colors">Today</button>
                <button type="button" onClick={() => setDateShortcut('yesterday')} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500 hover:text-primary-600 transition-colors">Yesterday</button>
              </div>
            </div>
            <Input
              type="date"
              icon={Calendar}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={errors.date}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
              <span className={cn("text-[10px] font-bold", (formData.description?.length || 0) > 450 ? "text-red-500" : "text-slate-400")}>
                {formData.description?.length || 0}/500
              </span>
            </div>
            <div className="relative group">
              <FileText size={18} className="absolute left-4 top-4 text-slate-400 pointer-events-none group-focus-within:text-primary-500 transition-colors" />
              <textarea
                maxLength={500}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all min-h-[120px] resize-none font-medium"
                placeholder="Optional details about this expense..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 h-12"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-200 dark:shadow-none font-bold"
              isLoading={loading}
            >
              {expense ? 'Save Changes' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
