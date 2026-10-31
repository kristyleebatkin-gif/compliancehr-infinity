import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';

export default function AuditorOnlyLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <Link to="/auditor-portal" className="flex items-center gap-2.5">
          <Image
            src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
            alt="ComplianceHR Infinity"
            fittingType="fit"
            className="h-8 w-8 shrink-0 rounded-lg border border-slate-200 bg-white p-1"
          />
          <div>
            <div className="text-sm sm:text-base font-extrabold leading-none text-slate-900">
              Compliance<span className="text-indigo-600">HR Infinity</span> · Auditor Portal
            </div>
            <div className="mt-0.5 text-[10px] font-medium text-slate-500">
              Complete Control. Greater Confidence. Brighter Success.
            </div>
          </div>
        </Link>
        <Button variant="outline" size="sm" onClick={() => base44.auth.logout()}>
          Sign out
        </Button>
      </header>
      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}