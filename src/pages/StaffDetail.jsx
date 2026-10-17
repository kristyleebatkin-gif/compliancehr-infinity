import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ClipboardCheck, FileCheck2, FileSignature, GraduationCap, KeyRound, ListTodo, MessagesSquare, ShieldAlert, TrendingUp } from 'lucide-react';
import StaffCommPanel from '@/components/communications/StaffCommPanel';
import ProfileTodoList from '@/components/communications/ProfileTodoList';
import ProfileHeader from '@/components/profile/ProfileHeader';
import TeamSection from '@/components/profile/TeamSection';
import StaffSafetyTab from '@/components/staff/StaffSafetyTab';
import StaffDetailsTab from '@/components/staff/StaffDetailsTab';
import StaffFillableForms from '@/components/staff/StaffFillableForms';
import StaffRecordsTab from '@/components/staff/StaffRecordsTab';
import StaffFileChecklist from '@/components/staff/StaffFileChecklist';
import StaffAccessTab from '@/components/staff/StaffAccessTab';
import StaffPerformanceTab from '@/components/staff/StaffPerformanceTab';
import ProfileIntakeDocuments from '@/components/intake/ProfileIntakeDocuments';
import StaffBadgeCard from '@/components/staff/StaffBadgeCard';

export default function StaffDetail() {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    try {
      const record = await base44.entities.StaffProfile.get(id);
      if (!record) setNotFound(true);
      else setStaff(record);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  if (notFound) {
    return (
      <div className="space-y-4 text-center py-16">
        <p className="text-muted-foreground">Staff member not found.</p>
        <Button variant="outline" asChild><Link to="/staff"><ArrowLeft className="h-4 w-4" />Back to staff</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2"><Link to="/staff"><ArrowLeft className="h-4 w-4" />Staff</Link></Button>
      </div>

      <ProfileHeader profile={staff} kind="staff" onUpdated={load} />

      <TeamSection
        title={`${staff.full_name}'s participant team`}
        description="The participants this staff member supports, shown on their profile and used for rostering."
        values={staff.participant_team || []}
        kind="participants"
        onUpdate={async (next) => { await base44.entities.StaffProfile.update(staff.id, { participant_team: next }); await load(); }}
      />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details"><ClipboardCheck className="mr-1 inline h-3.5 w-3.5" />Details</TabsTrigger>
          <TabsTrigger value="forms"><FileSignature className="mr-1 inline h-3.5 w-3.5" />Fillable Forms</TabsTrigger>
          <TabsTrigger value="filechecklist"><FileCheck2 className="mr-1 inline h-3.5 w-3.5" />File Checklist</TabsTrigger>
          <TabsTrigger value="records"><GraduationCap className="mr-1 inline h-3.5 w-3.5" />Buddy Shifts &amp; Training</TabsTrigger>
          <TabsTrigger value="access"><KeyRound className="mr-1 inline h-3.5 w-3.5" />Access &amp; Permissions</TabsTrigger>
          <TabsTrigger value="performance"><TrendingUp className="mr-1 inline h-3.5 w-3.5" />Performance Reviews</TabsTrigger>
          <TabsTrigger value="safety"><ShieldAlert className="mr-1 inline h-3.5 w-3.5" />Safety Records</TabsTrigger>
          <TabsTrigger value="comm"><MessagesSquare className="mr-1 inline h-3.5 w-3.5" />Communication Log</TabsTrigger>
          <TabsTrigger value="todo"><ListTodo className="mr-1 inline h-3.5 w-3.5" />To-Do</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="space-y-6">
            <StaffBadgeCard staff={staff} />
            <StaffDetailsTab staff={staff} onUpdated={load} />
            <ProfileIntakeDocuments profileId={staff.id} />
          </div>
        </TabsContent>
        <TabsContent value="forms"><StaffFillableForms staff={staff} /></TabsContent>
        <TabsContent value="filechecklist"><StaffFileChecklist staff={staff} /></TabsContent>
        <TabsContent value="records"><StaffRecordsTab staff={staff} /></TabsContent>
        <TabsContent value="access"><StaffAccessTab staff={staff} onUpdated={load} /></TabsContent>
        <TabsContent value="performance"><StaffPerformanceTab staff={staff} /></TabsContent>
        <TabsContent value="safety"><StaffSafetyTab staff={staff} /></TabsContent>
        <TabsContent value="comm"><StaffCommPanel staff={staff} /></TabsContent>
        <TabsContent value="todo"><ProfileTodoList staff={staff} /></TabsContent>
      </Tabs>
    </div>
  );
}