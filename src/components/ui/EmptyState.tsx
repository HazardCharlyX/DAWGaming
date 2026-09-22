import React from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { Gamepad2, ArrowLeft, RefreshCw } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  secondaryActionLabel?: string;
  onSecondaryActionClick?: () => void;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onActionClick,
  secondaryActionLabel,
  onSecondaryActionClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-lg border border-[#222d3d] bg-[#121822] max-w-lg mx-auto my-8">
      <div className="p-4 rounded-xl bg-[#18212e] border border-[#283547] text-[#94a3b8] mb-4">
        {icon || <Gamepad2 className="w-8 h-8 text-[#5c67f2]" />}
      </div>
      <h3 className="text-lg font-bold text-[#f1f5f9] mb-2">{title}</h3>
      <p className="text-sm text-[#94a3b8] mb-6 leading-relaxed max-w-md">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionHref && actionLabel && (
          <Link href={actionHref}>
            <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
              {actionLabel}
            </Button>
          </Link>
        )}

        {onActionClick && actionLabel && (
          <Button
            variant="primary"
            onClick={onActionClick}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            {actionLabel}
          </Button>
        )}

        {onSecondaryActionClick && secondaryActionLabel && (
          <Button variant="secondary" onClick={onSecondaryActionClick}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
