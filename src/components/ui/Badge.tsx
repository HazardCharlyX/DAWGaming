import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gba' | 'nds' | 'web' | 'psp' | 'n64' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  const variantStyles = {
    default: 'bg-[#18212e] text-[#94a3b8] border-[#253244]',
    gba: 'bg-[#5c67f2]/15 text-[#818cf8] border-[#5c67f2]/40',
    nds: 'bg-[#0284c7]/15 text-[#38bdf8] border-[#0284c7]/40',
    web: 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/40',
    psp: 'bg-[#d97706]/15 text-[#fbbf24] border-[#d97706]/40',
    n64: 'bg-[#dc2626]/15 text-[#f87171] border-[#dc2626]/40',
    success: 'bg-emerald-950/40 text-emerald-400 border-emerald-700/50',
    warning: 'bg-amber-950/40 text-amber-400 border-amber-700/50',
    danger: 'bg-rose-950/40 text-rose-400 border-rose-700/50',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider rounded border ${sizeClasses} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
