import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PhoneCall, Flame, HeartPulse, FlaskConical, CloudLightning } from 'lucide-react';

const QUICK_DIALS = [
  { label: 'Emergency Services', detail: 'Police, Fire, Ambulance', number: '000', icon: Flame, tone: 'bg-danger text-white' },
  { label: '13 HEALTH', detail: 'Medical & medication advice', number: '134325', display: '13 HEALTH', icon: HeartPulse, tone: 'bg-brand/10 text-brand' },
  { label: 'Poisons Info Line', detail: 'Poisoning & exposure', number: '131126', display: '13 11 26', icon: FlaskConical, tone: 'bg-warning/10 text-warning' },
  { label: 'SES Storm & Flood', detail: 'State Emergency Service', number: '132500', display: '132 500', icon: CloudLightning, tone: 'bg-teal/10 text-teal' },
];

export default function EmergencyQuickDial() {
  return (
    <Card className="border-danger/30 bg-gradient-to-r from-rose-50 to-red-50">
      <CardContent className="p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-danger"><PhoneCall className="h-4 w-4" />Emergency quick dial - call first, then record</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK_DIALS.map((d) => {
            const Icon = d.icon;
            return (
              <a
                key={d.number}
                href={`tel:${d.number}`}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-colors hover:border-danger/40 hover:shadow-sm"
              >
                <div className={`rounded-lg p-2 ${d.tone}`}><Icon className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-danger">{d.display || d.number}</p>
                  <p className="truncate text-xs text-muted-foreground">{d.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{d.detail}</p>
                </div>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}