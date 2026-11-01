import React from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function AuditorOnlyLayout() {
  return <div className="min-h-screen bg-background text-foreground">
    <header className="flex items-center justify-between border-b border-border bg-card p-4"><strong>Auditor Portal</strong><Button variant="outline" onClick={() => base44.auth.logout()}>Sign out</Button></header>
    <main className="mx-auto max-w-6xl p-4"><Outlet /></main>
  </div>;
}