import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, ShieldCheck, FolderCheck, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const pillars = [
  { icon: Users, title: 'People & operations', text: 'Bring staff, participant records, rostering and shift notes into a connected workspace.', points: ['Organised profiles and records', 'Clear schedules and handovers'] },
  { icon: FolderCheck, title: 'Documents & evidence', text: 'Keep your policies, forms and supporting evidence organised and easier to find.', points: ['Documents in one place', 'Evidence ready for internal review'] },
  { icon: ShieldCheck, title: 'Risk & improvement', text: 'Track incidents, risks and follow-up actions with a clearer view of what needs attention.', points: ['Visible actions and responsibilities', 'Support for ongoing quality improvement'] },
];

export default function LandingHero() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    let active = true;
    base44.auth.isAuthenticated().then(value => { if (active) setAuthed(value); }).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <section className="professional-hero" aria-labelledby="landing-title">
      <div className="professional-intro">
        <p className="professional-eyebrow">BUSINESS MANAGEMENT · DOCUMENTATION · COMPLIANCE</p>
        <h1 id="landing-title">Compliance management,<br /><span>simplified end to end.</span></h1>
        <p className="professional-lead">Bring your people, documents and day-to-day operations together. ComplianceHR Infinity helps your team stay organised, see what needs attention and work with greater confidence.</p>
        <div className="professional-actions">
          <Link className="professional-primary" to={authed ? '/dashboard' : '/register'}>{authed ? 'Open your dashboard' : 'Start your 14-day free trial'}<ArrowRight size={18} aria-hidden="true" /></Link>
          <a className="professional-secondary" href="#features">Explore the features <ArrowRight size={18} aria-hidden="true" /></a>
        </div>
        {!authed && <p className="professional-terms">Credit card required · View <a href="#pricing">pricing and plan details</a> before you start.</p>}
      </div>
      <div className="professional-pillars">
        {pillars.map(({icon: Icon, title, text, points}, index) => (
          <article className="professional-pillar" key={title}>
            <div className="professional-pillar-top"><span className={'professional-icon professional-icon-' + index}><Icon size={24} aria-hidden="true" /></span><span className="professional-number">0{index + 1}</span></div>
            <h2>{title}</h2>
            <p>{text}</p>
            <ul>{points.map(point => <li key={point}><CheckCircle2 size={16} aria-hidden="true" /><span>{point}</span></li>)}</ul>
          </article>
        ))}
      </div>
    </section>
  );
}
