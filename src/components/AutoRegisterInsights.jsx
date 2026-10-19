import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import RegisterInsights from '@/components/RegisterInsights';

// Path → AI insight module. Pages that render RegisterInsights inline are
// deliberately excluded, so no register ever shows two insight strips.
const PATH_MODULES = [
  ['/contacts', 'contacts'], ['/key-contacts', 'contacts'],
  ['/volunteering-placements', 'volunteers'], ['/volunteers', 'volunteers'],
  ['/programs', 'programs'],
  ['/certificates', 'certificates'],
  ['/procurement', 'suppliers'],
  ['/crm', 'leads'],
  ['/hr', 'hr'],
  ['/projects', 'projects'],
  ['/feedback', 'feedback'],
  ['/intake', 'intake'],
  ['/ndis-portal', 'ndis'],
  ['/referrals', 'referrals'],
  ['/equipment-manuals', 'equipment'],
  ['/community-council', 'community'],
];

export default function AutoRegisterInsights() {
  const { pathname } = useLocation();
  const mod = useMemo(() => {
    const hit = PATH_MODULES.find(([p]) => pathname === p || pathname.startsWith(p + '/'));
    return hit ? hit[1] : null;
  }, [pathname]);
  if (!mod) return null;
  return (
    <div className="mx-auto max-w-6xl px-3 pt-3 md:px-8">
      <RegisterInsights module={mod} />
    </div>
  );
}