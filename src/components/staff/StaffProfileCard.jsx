import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, UserRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { statusTone } from '@/lib/statusStyles';
import StaffBadgePreview from '@/components/safe/StaffBadgePreview';

export default function StaffProfileCard({ staff, branding, selected, onToggle, onRemove }) {
  return (
    <Card className="min-w-0 overflow-hidden rounded-xl border-border/70 shadow-sm">
      <CardContent className="flex h-full flex-col gap-2 p-2.5 sm:flex-row sm:items-start lg:flex-col lg:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col gap-2 self-stretch">
          <div className="flex items-start gap-2.5">
            <Checkbox aria-label={`Select ${staff.full_name}`} checked={selected} onCheckedChange={onToggle} className="mt-1 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-bold leading-5">{staff.full_name}</p>
              <p className="mt-0.5 break-words text-xs leading-5 text-muted-foreground">{staff.position || staff.role}{staff.employee_number ? ` · ${staff.employee_number}` : ''}</p>
            </div>
            <Badge className={`${statusTone(staff.status)} shrink-0 text-[10px]`}>{staff.status}</Badge>
          </div>
          <div className="space-y-1 border-t border-border/60 pt-2 text-xs leading-5 text-muted-foreground">
            {staff.email && <p className="break-all">{staff.email}</p>}
            {staff.phone && <p>{staff.phone}</p>}
            <p>Role: {staff.role}</p>
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-end gap-1 border-t border-border/60 pt-2">
            <Button variant="outline" size="sm" asChild><Link to={`/staff/${staff.id}`}><UserRound className="h-4 w-4" />Open profile</Link></Button>
            <Button aria-label={`Delete ${staff.full_name}`} variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        </div>
        <div className="min-w-0 w-full sm:w-56 sm:shrink-0 lg:w-full"><StaffBadgePreview branding={branding} staff={staff} compact /></div>
      </CardContent>
    </Card>
  );
}