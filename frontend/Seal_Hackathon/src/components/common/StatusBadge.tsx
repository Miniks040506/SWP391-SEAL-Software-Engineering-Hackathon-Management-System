import React from 'react';
import type { EventStatus } from '@/types/event.types';

const STATUS_STYLES: Record<EventStatus, string> = {
  Upcoming: 'text-blue-600 bg-blue-50 border border-blue-100',
  Ongoing: 'text-white bg-blue-500 border border-blue-600',
  Ended: 'text-gray-400 bg-gray-50 border border-gray-100',
};

interface StatusBadgeProps {
  status: EventStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`px-2.5 py-1 rounded text-xs font-bold tracking-tight shadow-sm ${STATUS_STYLES[status]}`}>
    {status.toUpperCase()}
  </span>
);