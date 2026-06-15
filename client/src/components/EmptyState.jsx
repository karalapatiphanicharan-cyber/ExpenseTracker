import React from 'react';
import { Wallet } from 'lucide-react';
import Button from './Button';

const EmptyState = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary-500/10 blur-3xl rounded-full scale-150" />
        <div className="relative p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-primary-600 dark:text-primary-400 rounded-[2rem] shadow-xl">
          <Wallet size={56} />
        </div>
      </div>
      <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-10 leading-relaxed font-medium">{description}</p>
      {actionLabel && (
        <Button
          onClick={onAction}
          className="h-12 px-8 font-bold text-base shadow-xl shadow-primary-200 dark:shadow-none"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
