import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, AlertTriangle, HeartPulse, ClipboardList, FileText, PhoneCall, ShieldCheck } from 'lucide-react';

const POLICY_STEPS = [
  'Ensure everyone is safe first. Give first aid if trained, and call 000 immediately for any urgent or serious concern.',
  'Contact provider admin or management straight away by phone and update them on the incident. While on the phone, ask the provider if you need to contact anyone else, such as family, a guardian or an advocate.',
  'Complete an incident report note in ShiftCare in the participant profile. After you have submitted the incident report, write it down in Shift Notes in ShiftCare and add it to the participant diary: record who gave the information (for example the treating nurse), exactly what information was received, and follow their instructions.',
  'Log the incident in the Incident Log in the Incident Clinic (New Incident button). It is added to the Incident Register automatically, and you can download and keep a copy of the incident report from the register.',
  'Staff referral: the employee involved completes an incident report and gives it to their supervisor. The supervisor reviews it and refers it to management for support, further training, workers compensation or HR follow-up where there is injury, stress or misconduct. Staff are supported through the referral - it is about learning, not blame.',
  'Serious incidents are investigated and, where required, reported to the NDIS Commission within the required timeframes. Corrective actions are tracked to closure and the risk register is updated if a new risk was identified.',
];

export default function HealthMedicationResponse() {
  return (
    <div className="space-y-4">
      {/* Emergency banner */}
      <div className="flex flex-col gap-3 rounded-2xl border border-red-300 bg-red-50 p-5 dark:border-red-500/30 dark:bg-red-500/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
          <div>
            <p className="text-base font-bold text-red-700">Urgent or serious concerns - call 000 immediately</p>
            <p className="mt-0.5 text-sm text-red-700/80">Get the patient&apos;s medication list and medical details ready for the ambulance: medications and dosage, allergies, medical conditions and diagnosis, GP, NDIS number, and emergency contact.</p>
          </div>
        </div>
        <a href="tel:000" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"><Phone className="h-4 w-4" />Call 000</a>
      </div>

      {/* Mild concerns / health advice lines */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><HeartPulse className="h-4 w-4 text-brand" />Mild health concerns</div>
          <p className="text-xs text-muted-foreground">For mild concerns call 13HEALTH (13 43 25 84) for qualified health advice, or contact the participant&apos;s regular GP.</p>
          <a href="tel:13432584" className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand/20"><PhoneCall className="h-3.5 w-3.5" />13HEALTH - 13 43 25 84</a>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><HeartPulse className="h-4 w-4 text-warning" />Medication concerns</div>
          <p className="text-xs text-muted-foreground">For medication questions, reactions or exposures call 13HEALTH or the Poisons Information Line - available 24 hours, 7 days.</p>
          <a href="tel:131126" className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-warning/15 px-3 py-1.5 text-xs font-bold text-warning hover:bg-warning/25"><PhoneCall className="h-3.5 w-3.5" />Poisons Info - 13 11 26</a>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Phone className="h-4 w-4 text-safe" />Then contact management</div>
          <p className="text-xs text-muted-foreground">Contact provider admin or management and update them on the incident. While on the phone, ask if you need to contact anyone else, like family, a guardian or an advocate.</p>
        </div>
      </div>

      {/* Step-by-step response flow */}
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><ClipboardList className="h-4 w-4 text-brand" />Health &amp; Medication Incident Response - what to do, in order</p>
        <ol className="space-y-2.5 text-sm text-foreground/80">
          {[
            'Urgent or serious concerns: call 000 immediately. Get the patient medication list and medical details for the ambulance.',
            'Mild concerns: call 13HEALTH (13 43 25 84) or the regular GP. For medication you can call 13HEALTH or the Poisons Information Line 13 11 26.',
            'Contact provider admin or management and update them on the incident. Ask while on the phone if you need to contact anyone else like family.',
            'Complete an incident report note in ShiftCare in the participant profile.',
            'After you have submitted the incident report, write it down in Shift Notes in ShiftCare and add it to the participant diary: the treating nurse or who gave the information, what information was received, and follow their instructions.',
            'Log the incident in the Incident Log in the Incident Clinic - it is added to the register automatically, and keep a copy of the incident report.',
          ].map((step, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-[11px] font-bold text-brand">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/incidents/new" className="inline-flex items-center gap-1.5 rounded-lg bg-safe px-3.5 py-2 text-xs font-bold text-safe-foreground hover:bg-safe/90"><FileText className="h-3.5 w-3.5" />Log incident in Incident Clinic</Link>
          <button onClick={() => document.getElementById('incident-register')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold hover:bg-muted"><ClipboardList className="h-3.5 w-3.5" />Go to Incident Log &amp; Register</button>
        </div>
      </div>

      {/* Incident management policy & procedure - staff referral */}
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-safe" />Incident Management Policy &amp; Procedure (for staff referral)</p>
        <p className="mb-3 text-xs text-muted-foreground">The full policy is held in the Company Safe and the Forms Library. This is the procedure every staff member follows and refers to:</p>
        <ol className="space-y-2 text-sm text-foreground/80">
          {POLICY_STEPS.map((step, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-safe/15 text-[11px] font-bold text-safe">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}