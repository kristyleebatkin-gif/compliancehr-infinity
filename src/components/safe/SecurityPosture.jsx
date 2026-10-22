import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, Users, FileClock, KeyRound, LifeBuoy, Loader2 } from 'lucide-react';

const GUARANTEES = [
  { icon: Lock, title: 'Encryption', detail: 'All data is encrypted in transit and at rest. Uploaded documents are stored privately, access-controlled by the app.' },
  { icon: KeyRound, title: 'Role-based access control', detail: 'Every register is governed by database-level rules per role. Each user only sees and changes what their role permits.' },
  { icon: FileClock, title: 'Immutable audit trail', detail: 'Status changes on compliance-grade records are logged with who, when and notes, and cannot be deleted by non-admins.' },
  { icon: Users, title: 'Secure authentication', detail: 'Login is by verified email with optional Google single sign-on. Sessions use signed tokens; password resets are verified.' },
  { icon: LifeBuoy, title: 'Incident response', detail: 'Data breaches are tracked in the dedicated register with an OAIC 30-day assessment workflow and notification escalation.' },
];

// Visible security posture (Drata/Vanta trust-centre pattern): the guarantees and
// the live evidence behind them, shown inside the app rather than hidden in settings.
export default function SecurityPosture() {
  return (
    <div className="space-y-3">
      <div
        className="comm-panel-bar flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5 text-white shadow-md"
        style={{ background: 'linear-gradient(120deg, #2563eb 0%, #7c3aed 52%, #ec4899 100%)' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/40">
            <ShieldCheck className="h-4 w-4 text-white" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-white">Security &amp; Trust Posture</p>
            <p className="text-xs font-bold text-white/90">The guarantees protecting this organisation, and the live evidence behind them.</p>
          </div>
        </div>
        <Badge className="bg-white/20 text-white border border-white/40">Verified in-app</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {GUARANTEES.map((g) => (
          <Card key={g.title} className="shadow-panel transition-transform hover:-translate-y-0.5">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-lg bg-brand/10 p-2"><g.icon className="h-4 w-4 text-brand" /></span>
                <p className="text-sm font-bold">{g.title}</p>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{g.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>


    </div>
  );
}