import React from 'react';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StaffGoals from '@/components/goals/StaffGoals';
import EmployeeParticipantGoals from '@/components/employee/EmployeeParticipantGoals';

export default function EmployeeGoals({ embedded = false }) {
  return <section className="space-y-4">
    {!embedded && <PageHeader title="Goal Progress" subtitle="Your goals and goals for all approved participants." showCompliance={false} showAudit={false} showAlerts={false} />}
    <Tabs defaultValue="mine"><TabsList><TabsTrigger value="mine">My goals</TabsTrigger><TabsTrigger value="participants">Approved participant goals</TabsTrigger></TabsList>
      <TabsContent value="mine"><StaffGoals /></TabsContent>
      <TabsContent value="participants"><EmployeeParticipantGoals /></TabsContent>
    </Tabs>
  </section>;
}