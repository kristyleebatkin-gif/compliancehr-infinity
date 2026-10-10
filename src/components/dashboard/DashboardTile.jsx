import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function DashboardTile({ icon: Icon, title, desc, to, color }) {
  return (
    <Link
      to={to}
      className="group relative flex min-h-48 flex-col items-center overflow-hidden rounded-2xl border p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
      style={{ borderColor: `${color}35`, background: `linear-gradient(160deg, ${color}1f 0%, ${color}0b 42%, hsl(var(--card)) 78%)` }}
    >
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
      <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-10 transition-transform group-hover:scale-125" style={{ backgroundColor: color }} />
      <div className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md transition-transform group-hover:rotate-3 group-hover:scale-105" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="relative text-sm font-bold text-foreground">{title}</div>
      <div className="relative mt-1 flex-1 text-xs leading-relaxed text-foreground/60">{desc}</div>
      <span className="relative mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-colors" style={{ color, backgroundColor: `${color}12` }}>View <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" /></span>
    </Link>
  );
}