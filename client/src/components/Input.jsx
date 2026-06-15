import React from 'react';
import { cn } from '../utils/cn';

const Input = React.forwardRef(({ className, type, label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            'w-full h-11 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
            Icon && 'pl-11',
            error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 ml-1 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
