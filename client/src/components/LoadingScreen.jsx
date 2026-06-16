import React from 'react';
import { Wallet } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950 z-[9999] transition-all duration-500">
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary-500/20 mb-6 animate-bounce">
          <Wallet size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">ExpenseTrack</h2>
        <div className="mt-4 flex gap-1">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
