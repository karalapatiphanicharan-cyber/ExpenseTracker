import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Button from './Button';
import Input from './Input';

const categories = [
  'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment',
  'Health', 'Education', 'Rent', 'Travel', 'Other'
];

const ExpenseModal = ({ isOpen, onClose, expense, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        description: expense.description || '',
        date: new Date(expense.date).toISOString().split('T')[0]
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.category) {
      return toast.error('Please fill in required fields');
    }
    if (parseFloat(formData.amount) <= 0) {
      return toast.error('Amount must be a positive number');
    }

    setLoading(true);
    try {
      if (expense) {
        await api.put(`/expenses/${expense._id}`, formData);
        toast.success('Expense updated successfully');
      } else {
        await api.post('/expenses', formData);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Input
            label="Title"
            placeholder="Rent, Groceries, etc."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              step="0.01"
              label="Amount ($)"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Category</label>
              <select
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <Input
            type="date"
            label="Date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Description</label>
            <textarea
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all min-h-[100px] resize-none"
              placeholder="Optional details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={loading}
            >
              {expense ? 'Update' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
