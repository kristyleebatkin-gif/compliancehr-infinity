import React from 'react';
import { ExternalLink } from 'lucide-react';

const ACCENTS = ['ndis-accent-safe', 'ndis-accent-primary', 'ndis-accent-evidence', 'ndis-accent-warning', 'ndis-accent-pink'];
export default function NdisPortalCards({ portals }) {
  return <div className="grid gap-3 md:grid-cols-2">{portals.map((portal, index) => <section key={portal.url} className={`ndis-panel flex min-w-0 flex-col p-4 ${ACCENTS[index]}`}>
    <div className="flex items-start gap-3"><div className="ndis-panel-icon shrink-0"><portal.icon className="h-5 w-5" /></div><div className="min-w-0"><h2 className="font-heading text-sm font-bold leading-snug">{portal.name}</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{portal.desc}</p></div></div>
    <a href={portal.url} target="_blank" rel="noreferrer" className="ndis-portal-link mt-4 inline-flex min-h-8 items-center justify-between gap-2 self-start rounded-lg border px-3 py-2 text-xs font-bold"><span className="break-all">Open {new URL(portal.url).hostname}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" /></a>
  </section>)}</div>;
}