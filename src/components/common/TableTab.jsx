import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TableTab({ label, children }) {
  return (
    <Tabs defaultValue="table" className="min-w-0">
      <TabsList aria-label={`${label} views`}>
        <TabsTrigger value="table">{label}</TabsTrigger>
      </TabsList>
      <TabsContent value="table" className="mt-2 min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4">
        {children}
      </TabsContent>
    </Tabs>
  );
}