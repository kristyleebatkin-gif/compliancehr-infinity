import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Siren } from 'lucide-react';

const CRISIS_LINES = [
  { name: 'Emergency - Police, Fire, Ambulance', number: '000', desc: 'Immediate danger to life, safety or property. Call 000 first, always.' },
  { name: 'Lifeline', number: '13 11 14', desc: '24/7 crisis support and suicide prevention.' },
  { name: 'Suicide Call Back Service', number: '1300 659 467', desc: '24/7 counselling for people affected by suicide.' },
  { name: 'Kids Helpline', number: '1800 55 1800', desc: '24/7 support for young people aged 5 to 25.' },
  { name: '1800RESPECT', number: '1800 737 732', desc: '24/7 family and domestic violence support.' },
  { name: '13HEALTH', number: '13 43 25 84', desc: 'Qualified health advice, 24/7.' },
  { name: 'Poisons Information Line', number: '13 11 26', desc: '24/7 poisoning and exposure advice.' },
  { name: 'Beyond Blue', number: '1300 22 4636', desc: '24/7 mental health support.' },
  { name: 'NDIS Quality & Safeguards', number: '1800 800 110', desc: 'Reportable incidents and NDIS concerns.' },
];

export default function CrisisInformation() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-danger/30 bg-danger/10 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-danger p-2.5"><Siren className="h-6 w-6 text-white" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-danger">In a crisis or urgent situation, call 000 now</p>
            <p className="text-sm text-foreground/70">If a person is in immediate danger, seriously injured, or at immediate risk of harm, do not wait - call Triple Zero (000).</p>
          </div>
          <a href="tel:000" className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-5 py-2.5 text-base font-bold text-teal-foreground hover:bg-teal/90"><Phone className="h-5 w-5" />Call 000</a>
        </div>
      </div>

      <p className="text-sm font-semibold text-foreground/70">Crisis and 24/7 support lines - tap any number to call</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {CRISIS_LINES.filter((line) => line.number !== '000').map((line) => (
          <div key={line.number} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{line.name}</p>
              <p className="text-xs text-muted-foreground">{line.desc}</p>
            </div>
            <a href={`tel:${line.number.replace(/\s/g, '')}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal/10 px-3 py-2 text-sm font-bold text-teal hover:bg-teal/20">
              <Phone className="h-3.5 w-3.5" />{line.number}
            </a>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground">
        For workplace emergencies, drills, visitor logs and safety checks, see the <Link to="/emergency-response" className="font-semibold text-brand underline">Emergency Response</Link> module. For chemical or poison exposure guidance, see the <Link to="/msds" className="font-semibold text-brand underline">MSDS Chemical Library</Link>.
      </div>
    </div>
  );
}