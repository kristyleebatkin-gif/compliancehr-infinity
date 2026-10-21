import React from 'react';
import OurEmployeeDetail from '@/pages/OurEmployeeDetail';

export default function StaffDetail() {
  return <OurEmployeeDetail backTo="/staff" backLabel="Staff Profiles" scoped={false} />;
}