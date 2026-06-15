import React from 'react';
import { cn } from '../utils/cn';

const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
