import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Delete Expense</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
            Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{itemName}"</span>? This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 py-3"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              className="flex-1 py-3 shadow-red-200 dark:shadow-none"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
