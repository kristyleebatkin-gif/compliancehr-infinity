import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ClipboardCheck, FileSignature, GraduationCap, KeyRound, TrendingUp, Users } from 'lucide-react';
import StaffDetailsTab from '@/components/staff/StaffDetailsTab';
import StaffFillableForms from '@/components/staff/StaffFillableForms';
import StaffRecordsTab from '@/components/staff/StaffRecordsTab';
import StaffAccessTab from '@/components/staff/StaffAccessTab';
import StaffPerformanceTab from '@/components/staff/StaffPerformanceTab';

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
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Users className="h-6 w-6" />{staff.full_name}</h1>
          <Badge className={statusTone(staff.status)}>{staff.status}</Badge>
          {staff.employee_number && <Badge variant="outline">Employee {staff.employee_number}</Badge>}
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details"><ClipboardCheck className="mr-1 inline h-3.5 w-3.5" />Details</TabsTrigger>
          <TabsTrigger value="forms"><FileSignature className="mr-1 inline h-3.5 w-3.5" />Fillable Forms</TabsTrigger>
          <TabsTrigger value="records"><GraduationCap className="mr-1 inline h-3.5 w-3.5" />Buddy Shifts &amp; Training</TabsTrigger>
          <TabsTrigger value="access"><KeyRound className="mr-1 inline h-3.5 w-3.5" />Access &amp; Permissions</TabsTrigger>
          <TabsTrigger value="performance"><TrendingUp className="mr-1 inline h-3.5 w-3.5" />Performance Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="details"><StaffDetailsTab staff={staff} onUpdated={load} /></TabsContent>
        <TabsContent value="forms"><StaffFillableForms staff={staff} /></TabsContent>
        <TabsContent value="records"><StaffRecordsTab staff={staff} /></TabsContent>
        <TabsContent value="access"><StaffAccessTab staff={staff} onUpdated={load} /></TabsContent>
        <TabsContent value="performance"><StaffPerformanceTab staff={staff} /></TabsContent>
      </Tabs>
    </div>
  );
}