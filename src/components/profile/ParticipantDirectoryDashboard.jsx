import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { preparePersonalProfileAccess, profileRecordScope } from '@/lib/personalProfileAccess';

const STATUSES = [
  { label: 'Active', tone: 'var(--safe)' },
  { label: 'On Hold', tone: 'var(--chart-5)' },
  { label: 'Inactive', tone: 'var(--warning)' },
];
export default function ParticipantDirectoryDashboard() {
  return null;
}