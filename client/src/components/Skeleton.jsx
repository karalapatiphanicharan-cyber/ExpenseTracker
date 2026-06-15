import React from 'react';
import { cn } from '../utils/cn';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg',
        className
      )}
      {...props}
    />
  );
};

export default Skeleton;
