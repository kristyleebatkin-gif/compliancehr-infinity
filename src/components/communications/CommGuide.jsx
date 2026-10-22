import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { Ear, MessageCircleQuestion, Languages, PenLine, Repeat, Radio, Users, Handshake, HeartHandshake, Trophy, Clock, Lightbulb, Info, ShieldAlert, RefreshCcw, BookOpen, Share2, Copy, Check } from 'lucide-react';

const COLOUR = '#0891b2';

const TIPS = [
  { icon: Ear, colour: '#0891b2', title: 'Listen actively', text: 'Face the person, let them finish, and reflect back what you heard before you reply.' },
  { icon: MessageCircleQuestion, colour: '#7c3aed', title: 'Use plain language', text: 'Short sentences, no jargon or acronyms. If a participant or family member would not understand it, rewrite it.' },
  { icon: Repeat, colour: '#0d9488', title: 'Confirm understanding', text: 'Ask the person to play the key points back to you (teach-back) so nothing is lost in translation.' },
  { icon: Clock, colour: '#ea580c', title: 'Write it while it is fresh', text: 'Record shift notes during or straight after the shift: dated, factual and specific.' },
  { icon: Radio, colour: '#dc2626', title: 'Match the channel', text: 'Urgent? Call or raise an alert. Sensitive? In person. Everything else belongs in the diary, email or team feed.' },
  { icon: Ear, colour: '#16a34a', title: 'Watch non-verbal cues', text: 'Tone, body language and facial expressions often say more than words - notice changes and check in.' },
  { icon: Languages, colour: '#7e22ce', title: 'Respect culture and accessibility', text: 'Use interpreters, easy-read and visual supports so every person can take part fully.' },
  { icon: Lightbulb, colour: '#f97316', title: 'Close the loop', text: 'A message is only delivered when the receiver confirms it. Follow up on anything left unread or unanswered.' },
];

const TEAMWORK = [
  { icon: Users, colour: '#4338ca', title: 'One team, one plan', text: 'Every shift builds on the last. Read the handover and the plan before you start, and leave the next shift ready to go.' },
  { icon: Handshake, colour: '#0891b2', title: 'Clear roles', text: 'Know who is responsible for what so nothing falls between shifts. Share tasks on the shared to-do board with owners and due dates.' },
  { icon: ShieldAlert, colour: '#dc2626', title: 'Speak up early', text: 'Raise risks, concerns and ideas in huddles and alerts as soon as they appear - never leave a worry for the next person to find.' },
  { icon: HeartHandshake, colour: '#e11d48', title: 'Respect and inclusion', text: 'Value every voice: support workers, coordinators, participants and families all bring part of the picture.' },
  { icon: Trophy, colour: '#f472b6', title: 'Celebrate wins', text: 'Shoutouts and team banter keep morale high. Recognition is the cheapest performance tool you have.' },
  { icon: RefreshCcw, colour: '#22c55e', title: 'Debrief together', text: 'After incidents or hard shifts, talk it through as a team, then update the plan so the same issue does not repeat.' },
];

const INFO = [
  { icon: BookOpen, colour: '#0891b2', title: 'What communication is', text: 'Communication is a two-way exchange: sending a message, receiving it, and confirming it was understood. All three steps matter.' },
  { icon: Info, colour: '#7c3aed', title: 'Why it matters here', text: 'Safe, consistent NDIS supports depend on accurate, timely, recorded communication between every person in a participant\'s week.' },
  { icon: PenLine, colour: '#16a34a', title: 'The Communication Register', text: 'Every entry in this centre is recorded on the Communication Register and linked to the person\'s participant or staff record.' },
  { icon: ShieldAlert, colour: '#ea580c', title: 'Escalation', text: 'Safety concerns go straight to alerts and incidents - never only in a diary note. Escalate first, document straight after.' },
];

const AUDIT_TIPS = [
  { icon: PenLine, colour: '#0d9488', title: 'Record as you go', text: 'A shift note written during the shift is audit evidence; one reconstructed later is a compliance risk.' },
  { icon: Info, colour: '#0891b2', title: 'Stay factual and objective', text: 'Write what was seen, said and done - not opinions. Auditors look for factual, specific, dated records.' },
  { icon: Repeat, colour: '#4338ca', title: 'Link every entry', text: 'Use the right module, person and note type so each entry lands on the Communication Register against the person\'s record.' },
  { icon: RefreshCcw, colour: '#16a34a', title: 'Complete the loop', text: 'Log the emails sent, copies to management and outcomes so the record shows who received what, and when.' },
  { icon: Clock, colour: '#ea580c', title: 'Never backdate', text: 'If you forget to record something, enter it today with a note of the actual date - never alter history.' },
  { icon: Trophy, colour: '#f472b6', title: 'Keep it retrievable', text: 'Consistent titles and note types mean evidence is found in seconds at audit time, not hours.' },
  { icon: ShieldAlert, colour: '#dc2626', title: 'Route sensitive entries', text: 'Management-copy serious notes, incidents and risks so the governance trail is complete before the auditor asks.' },
  { icon: Users, colour: '#7c3aed', title: 'Review the register weekly', text: 'Check for gaps, unsigned entries and missing documents so evidence stays current, not a pre-audit scramble.' },
];

// Short, one-line hints the team can copy and share anywhere - the feed, an email, a huddle.
const SHAREABLE = [
  'Say the main point in your first sentence - clear is kind.',
  'Confirm every instruction by playing it back before acting on it.',
  'Write it while it is fresh: a note reconstructed later is evidence lost.',
  'Urgent? Call or raise an alert. Everything else belongs in the diary or feed.',
  'Read the handover before the shift starts; leave notes for the next shift.',
  'Praise in public on the feed, correct in private in a direct message.',
  'Check the shared to-do board before you plan your day: one team, one plan.',
  'No entry is too small: if it happened on shift, it belongs in the register.',
  'Listen to understand, not to reply - let the person finish first.',
  'Close every loop: a message is delivered only when it is confirmed.',
];

function ShareHint({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };
  return (
    <div className="flex items-start justify-between gap-2 rounded-xl border p-2.5" style={{ background: '#0891b20d' }}>
      <p className="text-xs font-medium leading-snug text-foreground/80">{text}</p>
      <button type="button" onClick={copy} aria-label="Copy hint" className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[#0891b21f]" style={{ color: copied ? '#16a34a' : '#0891b2' }}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function GuideSection({ title, intro, items, colour, columns = 'sm:grid-cols-2' }) {
  return (
    <Card className="shadow-panel" style={{ borderTop: `4px solid ${colour}` }}>
      <CardContent className="p-3">
        <h3 className="font-heading text-base font-bold" style={{ color: colour }}>{title}</h3>
        {intro && <p className="mt-0.5 text-xs text-muted-foreground">{intro}</p>}
        <div className={`mt-2 grid gap-2 ${columns}`}>
          {items.map(({ icon: Icon, colour: c, title: t, text }) => (
            <div key={t} className="flex items-start gap-2.5 rounded-xl border border-border/60 p-2.5" style={{ background: `${c}0d` }}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${c}1f`, color: c }}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold" style={{ color: c }}>{t}</p>
                <p className="mt-0.5 text-xs leading-snug text-foreground/70">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommGuide() {
  return (
    <div className="space-y-3">
      <GuideSection title="Hints & tips: communication effectiveness" intro="Small habits that make every message clearer and every shift smoother." items={TIPS} colour={COLOUR} columns="sm:grid-cols-2 lg:grid-cols-4" />
      <div className="rounded-2xl border border-border/60 p-3" style={{ background: `linear-gradient(110deg, ${COLOUR}14, #7c3aed14, #f472b614)` }}>
        <h2 className="font-heading text-lg font-bold text-[#0891b2]">Communicate well, work as one team</h2>
        <p className="text-xs text-muted-foreground">Practical hints, teamwork habits and the communication basics behind safe, high-quality supports.</p>
      </div>
      <GuideSection title="Teamwork" intro="How this team works together across shifts, modules and roles." items={TEAMWORK} colour="#4338ca" />
      <GuideSection title="About communication" intro="The fundamentals behind the Communication Centre." items={INFO} colour="#7c3aed" />
      <GuideSection title="Tips: communication compliance within audits" intro="Keep your communication records audit-ready every week, not just at audit time." items={AUDIT_TIPS} colour="#6d28d9" columns="sm:grid-cols-2 lg:grid-cols-4" />
      <Card className="shadow-panel" style={{ borderTop: '4px solid #0d9488' }}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: '#0d94881f', color: '#0d9488' }}><Share2 className="h-4 w-4" /></span>
            <h3 className="font-heading text-base font-bold" style={{ color: '#0d9488' }}>Hints to share</h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">One-line hints on effective communication and teamwork. Copy any hint and paste it into the team feed, an email or a huddle.</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SHAREABLE.map((h) => <ShareHint key={h} text={h} />)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}