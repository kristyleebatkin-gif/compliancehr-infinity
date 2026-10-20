import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function DashboardTile({ icon: Icon, title, desc, to, color }) {
  return (
    <Link
      to={to}
      className="group relative flex min-h-32 flex-col items-start overflow-hidden rounded-xl border p-3 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/30"
      style={{ borderColor: `${color}40`, background: `linear-gradient(165deg, ${color}29 0%, ${color}12 46%, hsl(var(--card)) 82%)`, boxShadow: `0 10px 30px -18px ${color}77` }}
    >
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
      <div className="absolute inset-x-0 bottom-0 h-1 opacity-60" style={{ background: `linear-gradient(90deg, ${color}00, ${color}, ${color}00)` }} />
      <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-15 transition-transform group-hover:scale-125" style={{ backgroundColor: color }} />
      <div className="absolute -bottom-8 -left-6 h-20 w-20 rounded-full opacity-10 blur-lg" style={{ backgroundColor: color }} />
      <div className="relative mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground shadow-sm" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="relative text-sm font-bold text-foreground">{title}</div>
      <div className="relative mt-1 flex-1 text-xs leading-relaxed text-foreground/60">{desc}</div>
      <span className="relative mt-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors" style={{ color, backgroundColor: `${color}12` }}>View <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" /></span>
    </Link>
  );
}