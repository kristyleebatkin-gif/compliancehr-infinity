import React from 'react';
import { Link } from 'react-router-dom';
import useAppUsers from '@/components/users/useAppUsers';

export default function PendingApprovalNotice() {
  const { data, enabled, isError } = useAppUsers();
  if (!enabled) return null;
  if (isError) return <Link to="/users" className="text-xs text-destructive">Check app user approvals</Link>;
  if (!data?.pending_count) return null;
  return <Link to="/users#pending-approvals" role="status" className="rounded-lg border border-warning/40 bg-warning/10 px-2 py-1 text-xs font-semibold text-foreground">App users: {data.pending_count} awaiting approval</Link>;
}