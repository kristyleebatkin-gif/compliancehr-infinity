import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import SectionCard from '@/components/SectionCard';
import { AlertTriangle, Phone, Plus, Users } from 'lucide-react';
import { recordSafetyEvent } from '@/lib/safetyEvent';

// Common risks for each group in an NDIS disability support business.
// "Add" writes the risk straight into the Risk Register so nothing is missed.
export const COMMON_RISK_GROUPS = [
  {
    group: 'Support Workers',
    icon: Users,
    tone: 'bg-brand/10 text-brand',
    risks: [
      { title: 'Manual handling injury during participant transfers', category: 'Workplace Health & Safety', likelihood: 'Possible', consequence: 'Moderate', description: 'Strains and back injuries from lifting or transferring participants.\nWhat to do: use mechanical aids, two-person assists where required, keep manual handling training current, and report any near miss.' },
      { title: 'Vehicle accident during participant transport', category: 'Workplace Health & Safety', likelihood: 'Possible', consequence: 'Severe', description: 'Collision while driving participants to community access or appointments.\nWhat to do: complete the daily vehicle check, drive to conditions, restrain mobility devices, and call 000 for any injury.' },
      { title: 'Exposure to infectious diseases', category: 'Clinical', likelihood: 'Likely', consequence: 'Minor', description: 'Contact with illness during personal care or shared environments.\nWhat to do: standard precautions, hand hygiene, PPE when indicated, stay home when unwell.' },
      { title: 'Aggression or violence from a participant or visitor', category: 'Participant', likelihood: 'Possible', consequence: 'Major', description: 'Physical or verbal aggression causing injury or psychological harm.\nWhat to do: follow de-escalation training, keep safe distances, remove triggers, call 000 if in danger, and report every incident.' },
      { title: 'Working alone in the community (lone worker risk)', category: 'Workplace Health & Safety', likelihood: 'Possible', consequence: 'Moderate', description: 'Injury or unsafe situation with no immediate support nearby.\nWhat to do: share shift location and times, check in with the office, keep phone charged, know the duress procedure.' },
      { title: 'Heat, sun and dehydration during outdoor activities', category: 'Workplace Health & Safety', likelihood: 'Likely', consequence: 'Minor', description: 'Heat exhaustion during community access in warm weather.\nWhat to do: shade, water breaks, hats and sunscreen, reschedule in extreme heat.' },
      { title: 'Medication administration error', category: 'Clinical', likelihood: 'Possible', consequence: 'Major', description: 'Wrong medication, dose, route or time given.\nWhat to do: independent double-check, follow the MAR exactly, call 13HEALTH or Poisons Info 13 11 26 for medication concerns, and report every error.' },
      { title: 'Fatigue from back-to-back or night shifts', category: 'Workplace Health & Safety', likelihood: 'Possible', consequence: 'Moderate', description: 'Reduced alertness leading to errors or accidents.\nWhat to do: follow rostered breaks, disclose fatigue to supervisors, and do not drive when severely fatigued.' },
    ],
  },
  {
    group: 'Office Team',
    icon: Users,
    tone: 'bg-teal/10 text-teal',
    risks: [
      { title: 'Repetitive strain from computer work', category: 'Workplace Health & Safety', likelihood: 'Likely', consequence: 'Minor', description: 'Neck, wrist and eye strain from prolonged screen use.\nWhat to do: ergonomic setup, regular breaks, and report discomfort early.' },
      { title: 'Slips, trips and falls in the office', category: 'Workplace Health & Safety', likelihood: 'Possible', consequence: 'Minor', description: 'Wet floors, cables, boxes and clutter causing falls.\nWhat to do: keep walkways clear, clean spills immediately, report hazards the same day.' },
      { title: 'Faulty electrical equipment', category: 'Workplace Health & Safety', likelihood: 'Unlikely', consequence: 'Major', description: 'Shock or fire from damaged cords, heaters or appliances.\nWhat to do: tag and test schedule, remove faulty equipment immediately, report to management.' },
      { title: 'Workplace stress and excessive workload', category: 'Workplace Health & Safety', likelihood: 'Likely', consequence: 'Moderate', description: 'Burnout from high demand or conflicting deadlines.\nWhat to do: speak with your supervisor early, use the employee referral procedure, and take planned leave.' },
      { title: 'Confidential data or privacy breach', category: 'Compliance', likelihood: 'Possible', consequence: 'Major', description: 'Loss or wrong disclosure of participant or staff information.\nWhat to do: lock screens, strong passwords, follow the privacy policy, and report suspected breaches immediately.' },
      { title: 'Manual handling when moving stores and supplies', category: 'Workplace Health & Safety', likelihood: 'Possible', consequence: 'Minor', description: 'Strains from lifting boxes and stock.\nWhat to do: lift correctly, use trolleys, ask for help with heavy items.' },
      { title: 'Aggressive or distressed visitor at reception', category: 'Workplace Health & Safety', likelihood: 'Possible', consequence: 'Moderate', description: 'Threatening behaviour at the front counter.\nWhat to do: stay calm, keep a barrier, use the duress alert, call 000 if unsafe.' },
    ],
  },
  {
    group: 'Participants',
    icon: Users,
    tone: 'bg-safe/10 text-safe',
    risks: [
      { title: 'Falls at home or in the community', category: 'Participant', likelihood: 'Possible', consequence: 'Major', description: 'Falls causing fractures or head injury.\nWhat to do: keep falls plans current, clear trip hazards, use mobility aids, supervise transfers. Serious falls - call 000.' },
      { title: 'Choking or mealtime difficulty', category: 'Clinical', likelihood: 'Possible', consequence: 'Severe', description: 'Airway obstruction during eating or drinking.\nWhat to do: follow mealtime support plans, texture-modified diets, supervised meals, current first aid. Call 000 for choking.' },
      { title: 'Medication misadventure or missed dose', category: 'Clinical', likelihood: 'Possible', consequence: 'Major', description: 'Harm from wrong, missed or doubled medication.\nWhat to do: call 13HEALTH or Poisons Info 13 11 26, and contact Choices NQ admin or management.' },
      { title: 'Wandering or absconding', category: 'Participant', likelihood: 'Possible', consequence: 'Major', description: 'Leaving a supported environment unnoticed.\nWhat to do: follow the absconding plan, maintain supervision levels, alert police and management early.' },
      { title: 'Seizure or sudden medical episode', category: 'Clinical', likelihood: 'Possible', consequence: 'Major', description: 'Seizures or acute illness requiring emergency response.\nWhat to do: follow the seizure/health plan, protect from injury, time the seizure, call 000 for serious or prolonged events.' },
      { title: 'Skin breakdown and pressure injuries', category: 'Clinical', likelihood: 'Possible', consequence: 'Moderate', description: 'Pressure damage for participants with limited mobility.\nWhat to do: repositioning schedules, pressure care equipment, skin checks each shift.' },
      { title: 'Hot water, burns and scalds', category: 'Participant', likelihood: 'Unlikely', consequence: 'Major', description: 'Burns from cooking, hot drinks or water systems.\nWhat to do: test water temperature, supervise cooking, thermostat controls, first aid immediately.' },
      { title: 'Social isolation and mental health decline', category: 'Participant', likelihood: 'Likely', consequence: 'Moderate', description: 'Loneliness affecting wellbeing.\nWhat to do: maintain community access routines, encourage friendships, monitor mood and report changes.' },
    ],
  },
  {
    group: 'Children',
    icon: Users,
    tone: 'bg-warning/10 text-warning',
    risks: [
      { title: 'Choking on food or small objects', category: 'Participant', likelihood: 'Possible', consequence: 'Severe', description: 'Young children explore with their mouths.\nWhat to do: age-appropriate food, keep small objects out of reach, supervise all meals, current first aid. Call 000 for choking.' },
      { title: 'Allergy and anaphylaxis', category: 'Clinical', likelihood: 'Possible', consequence: 'Severe', description: 'Severe allergic reaction to food, stings or medications.\nWhat to do: know the allergy plan, carry the adrenaline auto-injector, call 000 immediately for anaphylaxis.' },
      { title: 'Playground and play-equipment falls', category: 'Participant', likelihood: 'Likely', consequence: 'Minor', description: 'Falls from heights during play.\nWhat to do: supervise, soft-fall surfaces, age-appropriate equipment, first aid for injuries.' },
      { title: 'Driveway and road safety', category: 'Participant', likelihood: 'Possible', consequence: 'Severe', description: 'Children near vehicles at home or during outings.\nWhat to do: hold hands near roads, separate play from driveways, reverse-parking checks, child restraints always.' },
      { title: 'Drowning and water play', category: 'Participant', likelihood: 'Unlikely', consequence: 'Severe', description: 'Pools, baths, dams and buckets are a drowning risk for children.\nWhat to do: constant within-arm&apos;s-reach supervision, fenced pools, empty buckets, know CPR. Call 000 immediately.' },
      { title: 'Child-safe supervision gaps', category: 'Compliance', likelihood: 'Unlikely', consequence: 'Severe', description: 'A child left unsupervised or with an unscreened adult.\nWhat to do: follow the child-safe policy, verified worker screening, never leave a child alone, hand over to a documented adult only.' },
      { title: 'Sleep and nap safety', category: 'Participant', likelihood: 'Unlikely', consequence: 'Severe', description: 'Unsafe sleep environments increase risk for young children.\nWhat to do: follow safe sleep guidance, correct cot setup, regular checks, no soft bedding.' },
    ],
  },
];

export default function CommonRiskLibrary({ onAdded }) {
  const { toast } = useToast();
  const [adding, setAdding] = useState('');

  const add = async (group, risk) => {
    const key = `${group}-${risk.title}`;
    setAdding(key);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const rec = await base44.entities.Risk.create({
        report_type: 'Risk',
        title: risk.title,
        description: risk.description,
        category: risk.category,
        likelihood: risk.likelihood,
        consequence: risk.consequence,
        rating: 'Medium',
        status: 'Identified',
        identified_date: today,
      });
      try { await recordSafetyEvent('Risk', rec.id, { notify: false }); } catch { /* notification is best-effort */ }
      toast({ title: 'Added to the Risk Register', description: risk.title });
      if (onAdded) await onAdded();
    } catch (error) {
      toast({ title: 'Add failed', description: error.message, variant: 'destructive' });
    } finally {
      setAdding('');
    }
  };

  return (
    <div className="space-y-4">
      {/* What to do guidance */}
      <div className="rounded-2xl border border-red-300 bg-red-50 p-5 dark:border-red-500/30 dark:bg-red-500/10">
        <p className="flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-300"><AlertTriangle className="h-4 w-4" />Risk management - what to do</p>
        <ul className="mt-2 space-y-1 text-sm text-red-700/90 dark:text-red-300/90">
          <li>Serious or emergency risk: call <a href="tel:000" className="inline-flex items-center gap-1 font-bold underline"><Phone className="inline h-3 w-3" />000</a> immediately, then contact Choices NQ admin or management.</li>
          <li>Every shift, do a quick hazard scan of the environment and the people you support - if a hazard or risk is missing from the register, report it the same day with the Report Hazard button above.</li>
          <li>Common risks for each group are listed below - add any that apply to your work so they are assessed, controlled and reviewed.</li>
          <li>Controlled risks are reviewed on their review date; anything High or Critical is escalated to management straight away.</li>
        </ul>
      </div>

      <SectionCard title="Common Risks &amp; Hazards Library" description="Pre-written risks for support workers, the office team, participants and children. Add any that apply - they land in the Risk Register ready for assessment and controls.">
        <div className="grid gap-4 md:grid-cols-2">
          {COMMON_RISK_GROUPS.map((group) => (
            <div key={group.group} className="rounded-xl border border-border/60 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Users className={`h-4 w-4 ${group.tone.split(' ')[1]}`} />{group.group}</p>
              <div className="space-y-2">
                {group.risks.map((risk) => (
                  <div key={risk.title} className="rounded-lg bg-muted/40 p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold">{risk.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{risk.description.split('\n')[0]}</p>
                      </div>
                      <button
                        onClick={() => add(group.group, risk)}
                        disabled={adding === `${group.group}-${risk.title}`}
                        className="flex shrink-0 items-center gap-1 rounded-lg bg-brand/10 px-2 py-1 text-[11px] font-semibold text-brand hover:bg-brand/20 disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3" />{adding === `${group.group}-${risk.title}` ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}