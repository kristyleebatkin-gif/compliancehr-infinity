import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Ear, MessageCircleQuestion, Languages, PenLine, Repeat, Radio, Users, Handshake, HeartHandshake, Trophy, Clock, Lightbulb, Info, ShieldAlert, RefreshCcw, BookOpen } from 'lucide-react';

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
      <div className="rounded-2xl border border-border/60 p-3" style={{ background: `linear-gradient(110deg, ${COLOUR}14, #7c3aed14, #f472b614)` }}>
        <h2 className="font-heading text-lg font-bold text-[#0891b2]">Communicate well, work as one team</h2>
        <p className="text-xs text-muted-foreground">Practical hints, teamwork habits and the communication basics behind safe, high-quality supports.</p>
      </div>
      <GuideSection title="Hints & tips: communication effectiveness" intro="Small habits that make every message clearer and every shift smoother." items={TIPS} colour={COLOUR} columns="sm:grid-cols-2 lg:grid-cols-4" />
      <GuideSection title="Teamwork" intro="How this team works together across shifts, modules and roles." items={TEAMWORK} colour="#4338ca" />
      <GuideSection title="About communication" intro="The fundamentals behind the Communication Centre." items={INFO} colour="#7c3aed" />
    </div>
  );
}