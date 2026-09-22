import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gba' | 'nds' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#10b981] hover:bg-[#059669] text-white border-emerald-600 shadow-[0_2px_0_#064e3b]',
    secondary:
      'bg-[#18212e] hover:bg-[#202c3d] text-[#f1f5f9] border-[#2d3b4e] shadow-[0_2px_0_#0b0f15]',
    gba: 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-[0_2px_0_#064e3b]',
    nds: 'bg-[#0284c7] hover:bg-[#0369a1] text-white border-[#0284c7] shadow-[0_2px_0_#075985]',
    danger:
      'bg-[#e63946] hover:bg-[#d62828] text-white border-[#b71c1c] shadow-[0_2px_0_#7f1d1d]',
    ghost:
      'bg-transparent hover:bg-[#18212e] text-[#94a3b8] hover:text-[#f1f5f9] border-transparent shadow-none',
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-md border transition-all active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-y-0 cursor-pointer ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
