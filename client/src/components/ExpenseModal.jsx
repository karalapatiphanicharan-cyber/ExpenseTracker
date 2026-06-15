import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

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
    }
  }, [expense]);

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
        await api.put(`expenses/${expense._id}`, formData);
        toast.success('Expense updated');
      } else {
        await api.post('expenses', formData);
        toast.success('Expense added');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Rent, Groceries, etc."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select
                className="input-field appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Utilities">Utilities</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                className="input-field"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                className="input-field min-h-[80px] resize-none"
                placeholder="Optional details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex justify-center items-center"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : (expense ? 'Update' : 'Add Expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
