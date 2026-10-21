import React from 'react';
import { useRole } from '@/lib/useRole';

export default function withEmployeeView(Original, EmployeeView) {
  return function EmployeeScopedView(props) {
    const { user } = useRole();
    return user?.role === 'Employee' ? <EmployeeView {...props} /> : <Original {...props} />;
  };
}