import React from 'react';
import type { QuoteStatus, ProductStatus } from '../../Type';

interface BadgeProps {
  status: QuoteStatus | ProductStatus | 'Active' | 'Inactive' | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  let colorClasses = 'bg-gray-100 text-gray-700 border-gray-200';

  switch (status) {
    case 'Sent':
      colorClasses = 'bg-[#facc15]/20 text-[#6c5700] border-[#facc15]/40';
      break;
    case 'Draft':
      colorClasses = 'bg-[#ebe2d0] text-[#4d4632] border-[#d1c6ab]';
      break;
    case 'Accepted':
    case 'Paid':
    case 'Active':
      colorClasses = 'bg-teal-50 text-teal-800 border-teal-200';
      break;
    case 'Pending':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case 'Overdue':
    case 'Rejected':
    case 'Inactive':
      colorClasses = 'bg-red-50 text-red-700 border-red-200';
      break;
    case 'Low Stock':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${colorClasses} ${className}`}
    >
      {status}
    </span>
  );
};
