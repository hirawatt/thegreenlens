
import React from 'react';
import { Icon } from './icons';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', label }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
      <Icon type="spinner" className={sizeClasses[size]} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
};

export default Spinner;
