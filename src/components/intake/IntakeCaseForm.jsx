import React from 'react';
import { Field, TextArea, TextInput, Select, DateInput, Checkbox } from '@/components/Field';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileWarning, Loader2 } from 'lucide-react';
import IntakeReadinessExport from '@/components/intake/IntakeReadinessExport';
import IntakeResumeUpload from '@/components/intake/IntakeResumeUpload';

const EMPLOYEE_ROLES = [
  'Support Worker (JR)',
  'Support Worker (SR)',
  'Team Leader',
  'Compliance Manager',
  'Administration',
  'Management',
];

export const SUPPORT_OPTIONS = [
  'All supports',
  'Domestic assistance',
  'Yard Maintenance',
  'Community Access',
  'Respite',
  'Personal care',
  'Capacity Building',
];

const GROUP_CARD = 'rounded-xl border border-border bg-muted/30 p-3 sm:col-span-2';

/**
 * The full new-case intake form (new draft profile), shared by the
 * participant and employee intake workflows.
 */
export default function IntakeCaseForm({ intakeType, form, setValue, toggleSupport, busy, onCancel, onSubmit }) {
  return (
    <form
      onSubmit={(event) => { event.preventDefault(); onSubmit(); }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <Field label="Applicant full name *" className="sm:col-span-2">
        <TextInput required value={form.applicant_name} onChange={(e) => setValue('applicant_name', e.target.value)} />
      </Field>
      <Field label="Date of birth *"><DateInput required value={form.date_of_birth} onChange={(e) => setValue('date_of_birth', e.target.value)} /></Field>
      <Field label="Email"><TextInput type="email" value={form.email} onChange={(e) => setValue('email', e.target.value)} /></Field>
      <Field label="Phone"><TextInput type="tel" value={form.phone} onChange={(e) => setValue('phone', e.target.value)} /></Field>
      <Field label="Address"><TextInput value={form.address} onChange={(e) => setValue('address', e.target.value)} /></Field>
      {intakeType === 'Participant' ? (
        <>
          <Field label="NDIS number"><TextInput value={form.ndis_number} onChange={(e) => setValue('ndis_number', e.target.value)} /></Field>
          <Field label="NDIS reference number"><TextInput value={form.ndis_reference_number} onChange={(e) => setValue('ndis_reference_number', e.target.value)} /></Field>
          <Field label="Preferred name and pronouns"><TextInput value={form.preferred_name_pronouns} onChange={(e) => setValue('preferred_name_pronouns', e.target.value)} /></Field>
          <Field label="Preferred name"><TextInput value={form.preferred_name} onChange={(e) => setValue('preferred_name', e.target.value)} /></Field>
          <Field label="Likes"><TextArea value={form.likes} onChange={(e) => setValue('likes', e.target.value)} /></Field>
          <Field label="Dislikes"><TextArea value={form.dislikes} onChange={(e) => setValue('dislikes', e.target.value)} /></Field>
          <Field label="Gender"><TextInput value={form.gender} onChange={(e) => setValue('gender', e.target.value)} /></Field>
          <Field label="Language spoken"><TextInput value={form.language_spoken} onChange={(e) => setValue('language_spoken', e.target.value)} /></Field>
          <Checkbox checked={form.interpreter_required} onChange={(e) => setValue('interpreter_required', e.target.checked)} label="Interpreter required" />
          <Field label="Cultural background"><TextInput value={form.cultural_background} onChange={(e) => setValue('cultural_background', e.target.value)} /></Field>
          <Field label="Guardian / nominee name"><TextInput value={form.guardian_name} onChange={(e) => setValue('guardian_name', e.target.value)} /></Field>
          <Field label="Guardian / nominee contact"><TextInput value={form.guardian_contact} onChange={(e) => setValue('guardian_contact', e.target.value)} /></Field>
          <Checkbox checked={form.guardian_consent} onChange={(e) => setValue('guardian_consent', e.target.checked)} label="Guardian consent obtained" />
          <Field label="GP name"><TextInput value={form.gp_name} onChange={(e) => setValue('gp_name', e.target.value)} /></Field>
          <Field label="GP contact"><TextInput value={form.gp_contact} onChange={(e) => setValue('gp_contact', e.target.value)} /></Field>
          <Field label="Medicare card number"><TextInput value={form.medicare_card_number} onChange={(e) => setValue('medicare_card_number', e.target.value)} /></Field>
          <Field label="Medicare individual reference number (IRN)"><TextInput value={form.medicare_irn} onChange={(e) => setValue('medicare_irn', e.target.value)} /></Field>
          <Field label="Medicare expiry"><TextInput value={form.medicare_expiry} onChange={(e) => setValue('medicare_expiry', e.target.value)} /></Field>
          <Field label="Doctor name"><TextInput value={form.doctor_name} onChange={(e) => setValue('doctor_name', e.target.value)} /></Field>
          <Field label="Doctor phone"><TextInput type="tel" value={form.doctor_phone} onChange={(e) => setValue('doctor_phone', e.target.value)} /></Field>
          <Field label="Doctor email"><TextInput type="email" value={form.doctor_email} onChange={(e) => setValue('doctor_email', e.target.value)} /></Field>
          <Field label="Doctor address"><TextInput value={form.doctor_address} onChange={(e) => setValue('doctor_address', e.target.value)} /></Field>
          <Field label="Specialist name"><TextInput value={form.specialist_name} onChange={(e) => setValue('specialist_name', e.target.value)} /></Field>
          <Field label="Specialist phone"><TextInput type="tel" value={form.specialist_phone} onChange={(e) => setValue('specialist_phone', e.target.value)} /></Field>
          <Field label="Specialist email"><TextInput type="email" value={form.specialist_email} onChange={(e) => setValue('specialist_email', e.target.value)} /></Field>
          <Field label="Specialist address"><TextInput value={form.specialist_address} onChange={(e) => setValue('specialist_address', e.target.value)} /></Field>
          <Field label="NDIS funding categories"><TextInput value={form.funding_categories} onChange={(e) => setValue('funding_categories', e.target.value)} /></Field>
          <Field label="Support type requested"><TextInput value={form.support_type_requested} onChange={(e) => setValue('support_type_requested', e.target.value)} /></Field>
          <Field label="Shift dates requested"><TextInput value={form.shift_dates} onChange={(e) => setValue('shift_dates', e.target.value)} /></Field>
          <Field label="Shift times requested"><TextInput value={form.shift_times} onChange={(e) => setValue('shift_times', e.target.value)} /></Field>
          <Field label="Phone number for shifts requested"><TextInput type="tel" value={form.shift_contact_phone} onChange={(e) => setValue('shift_contact_phone', e.target.value)} /></Field>
          <Field label="Support coordinator"><TextInput value={form.support_coordinator} onChange={(e) => setValue('support_coordinator', e.target.value)} /></Field>
          <Field label="Support coordinator phone"><TextInput type="tel" value={form.support_coordinator_phone} onChange={(e) => setValue('support_coordinator_phone', e.target.value)} /></Field>
          <Field label="Support coordinator email"><TextInput type="email" value={form.support_coordinator_email} onChange={(e) => setValue('support_coordinator_email', e.target.value)} /></Field>
          <Field label="Occupational therapist (OT)"><TextInput value={form.occupational_therapist} onChange={(e) => setValue('occupational_therapist', e.target.value)} /></Field>
          <Field label="Plan manager"><TextInput value={form.plan_manager} onChange={(e) => setValue('plan_manager', e.target.value)} /></Field>
          <Field label="Plan manager phone"><TextInput type="tel" value={form.plan_manager_phone} onChange={(e) => setValue('plan_manager_phone', e.target.value)} /></Field>
          <Field label="Plan manager email"><TextInput type="email" value={form.plan_manager_email} onChange={(e) => setValue('plan_manager_email', e.target.value)} /></Field>
          <Field label="Speech therapist"><TextInput value={form.speech_therapist} onChange={(e) => setValue('speech_therapist', e.target.value)} /></Field>
          <Field label="Physiotherapist"><TextInput value={form.physiotherapist} onChange={(e) => setValue('physiotherapist', e.target.value)} /></Field>
          <Field label="Other services"><TextInput value={form.other_services} onChange={(e) => setValue('other_services', e.target.value)} /></Field>
          <Field label="Advocate name"><TextInput value={form.advocate_name} onChange={(e) => setValue('advocate_name', e.target.value)} /></Field>
          <Field label="Advocate relationship"><TextInput value={form.advocate_relationship} onChange={(e) => setValue('advocate_relationship', e.target.value)} /></Field>
          <Field label="Advocate phone"><TextInput type="tel" value={form.advocate_phone} onChange={(e) => setValue('advocate_phone', e.target.value)} /></Field>
          <Field label="Advocate email"><TextInput type="email" value={form.advocate_email} onChange={(e) => setValue('advocate_email', e.target.value)} /></Field>
          <Field label="Advocate contact details"><TextInput value={form.advocate_contact} onChange={(e) => setValue('advocate_contact', e.target.value)} /></Field>
          <Field label="Has representative / nominee">
            <Select value={form.has_representative} onChange={(e) => setValue('has_representative', e.target.value)}>
              <option>No</option>
              <option>Yes</option>
            </Select>
          </Field>
          <Field label="Representative name"><TextInput value={form.representative_name} onChange={(e) => setValue('representative_name', e.target.value)} /></Field>
          <Field label="Representative relationship"><TextInput value={form.representative_relationship} onChange={(e) => setValue('representative_relationship', e.target.value)} /></Field>
          <Field label="Representative phone"><TextInput type="tel" value={form.representative_phone} onChange={(e) => setValue('representative_phone', e.target.value)} /></Field>
          <Field label="Representative email"><TextInput type="email" value={form.representative_email} onChange={(e) => setValue('representative_email', e.target.value)} /></Field>
          <Field label="Names of any person for consent to share"><TextInput value={form.consent_to_share_persons} onChange={(e) => setValue('consent_to_share_persons', e.target.value)} /></Field>
          <Checkbox
            checked={form.information_sharing_consent === 'Consent provided'}
            onChange={(e) => setValue('information_sharing_consent', e.target.checked ? 'Consent provided' : 'Consent declined')}
            label="Consent to share information with providers, coordinators and nominees"
          />
          <Field label="Transport needs" className="sm:col-span-2"><TextArea value={form.transport_needs} onChange={(e) => setValue('transport_needs', e.target.value)} /></Field>
          <Field label="NDIS plan goals" className="sm:col-span-2"><TextArea value={form.ndis_plan_goals} onChange={(e) => setValue('ndis_plan_goals', e.target.value)} /></Field>
          <Field label="Preferred workers description" className="sm:col-span-2"><TextArea value={form.preferred_workers_description} onChange={(e) => setValue('preferred_workers_description', e.target.value)} /></Field>
          <Field label="Medical diagnosis"><TextArea value={form.medical_diagnosis} onChange={(e) => setValue('medical_diagnosis', e.target.value)} /></Field>
          <Field label="Medications"><TextArea value={form.medications_dosage} onChange={(e) => setValue('medications_dosage', e.target.value)} /></Field>
          <Field label="Any special meals or diets"><TextArea value={form.special_meals_diets} onChange={(e) => setValue('special_meals_diets', e.target.value)} /></Field>
          <Field label="Mealtime management plan" className="sm:col-span-2"><TextArea value={form.meal_plan_management_plan} onChange={(e) => setValue('meal_plan_management_plan', e.target.value)} /></Field>
          <Field label="Risks identified"><TextArea value={form.risks_identified} onChange={(e) => setValue('risks_identified', e.target.value)} /></Field>
          <Field label="Control measures"><TextArea value={form.control_measures} onChange={(e) => setValue('control_measures', e.target.value)} /></Field>
          <Field label="Primary contact / nominee"><TextInput value={form.primary_contact} onChange={(e) => setValue('primary_contact', e.target.value)} /></Field>
          <Field label="Representative / advocate"><TextInput value={form.representative_details} onChange={(e) => setValue('representative_details', e.target.value)} /></Field>
        </>
      ) : (
        <>
          <Field label="Employee role">
            <Select value={form.employee_role} onChange={(e) => setValue('employee_role', e.target.value)}>
              {EMPLOYEE_ROLES.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Preferred name"><TextInput value={form.preferred_name} onChange={(e) => setValue('preferred_name', e.target.value)} /></Field>
          <Field label="Qualifications and certificates" className="sm:col-span-2"><TextArea value={form.qualifications_certificates} onChange={(e) => setValue('qualifications_certificates', e.target.value)} /></Field>
          <Field label="Tax file number"><TextInput value={form.tax_file_number} onChange={(e) => setValue('tax_file_number', e.target.value)} /></Field>
          <Field label="Medical alerts or workplace adjustments" className="sm:col-span-2">
            <TextArea value={form.workplace_adjustments} onChange={(e) => setValue('workplace_adjustments', e.target.value)} />
          </Field>
          <Field label="Allergies"><TextArea value={form.allergies} onChange={(e) => setValue('allergies', e.target.value)} /></Field>
          <Field label="Medical conditions"><TextArea value={form.medical_conditions} onChange={(e) => setValue('medical_conditions', e.target.value)} /></Field>
          <Field label="Current employment status"><TextInput value={form.current_employment_status} onChange={(e) => setValue('current_employment_status', e.target.value)} /></Field>
          <Field label="Years of experience"><TextInput type="number" value={form.years_experience} onChange={(e) => setValue('years_experience', e.target.value)} /></Field>
          <Field label="Employment provider"><TextInput value={form.employment_provider} onChange={(e) => setValue('employment_provider', e.target.value)} /></Field>
          <Field label="Weekly hours goal"><TextInput value={form.weekly_hours_goal} onChange={(e) => setValue('weekly_hours_goal', e.target.value)} /></Field>
          <Field label="Hobbies and interests" className="sm:col-span-2"><TextArea value={form.hobbies_interests} onChange={(e) => setValue('hobbies_interests', e.target.value)} /></Field>
          <div className={GROUP_CARD}>
            <h4 className="mb-2 text-sm font-bold">Supports they want to provide</h4>
            <div className="grid gap-2 sm:grid-cols-3">
              {SUPPORT_OPTIONS.map((option) => (
                <Checkbox
                  key={option}
                  checked={(form.supports_to_provide || []).includes(option)}
                  onChange={() => toggleSupport(option)}
                  label={option}
                />
              ))}
            </div>
          </div>
          <div className={GROUP_CARD}>
            <h4 className="mb-1 text-sm font-bold sm:col-span-2">Pay details (wages)</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Banking details (BSB, account number, account name)"><TextInput value={form.banking_details} onChange={(e) => setValue('banking_details', e.target.value)} /></Field>
              <Field label="Superannuation details (fund and member number)"><TextInput value={form.superannuation_details} onChange={(e) => setValue('superannuation_details', e.target.value)} /></Field>
            </div>
          </div>
          <div className={GROUP_CARD}>
            <h4 className="mb-1 text-sm font-bold sm:col-span-2">Vehicle</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Current rego (state and expiry)"><TextInput value={form.current_rego} onChange={(e) => setValue('current_rego', e.target.value)} /></Field>
              <Field label="Rego number"><TextInput value={form.rego_number} onChange={(e) => setValue('rego_number', e.target.value)} /></Field>
            </div>
          </div>
          <Field label="Availability" className="sm:col-span-2"><TextArea value={form.availability} onChange={(e) => setValue('availability', e.target.value)} /></Field>
          <Field label="Why do you want this role?" className="sm:col-span-2"><TextArea value={form.why_apply} onChange={(e) => setValue('why_apply', e.target.value)} /></Field>
          <Field label="Previous employer"><TextInput value={form.previous_employer} onChange={(e) => setValue('previous_employer', e.target.value)} /></Field>
          <Field label="Previous employer phone"><TextInput type="tel" value={form.previous_employer_phone} onChange={(e) => setValue('previous_employer_phone', e.target.value)} /></Field>
          <Field label="Previous employer email"><TextInput type="email" value={form.previous_employer_email} onChange={(e) => setValue('previous_employer_email', e.target.value)} /></Field>
          {[1, 2].map((n) => (
            <div key={n} className={GROUP_CARD}>
              <h4 className="mb-3 text-sm font-bold">Referee {n}</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Full name"><TextInput value={form[`referee_${n}_name`]} onChange={(e) => setValue(`referee_${n}_name`, e.target.value)} /></Field>
                <Field label="Phone"><TextInput type="tel" value={form[`referee_${n}_phone`]} onChange={(e) => setValue(`referee_${n}_phone`, e.target.value)} /></Field>
                <Field label="Email"><TextInput type="email" value={form[`referee_${n}_email`]} onChange={(e) => setValue(`referee_${n}_email`, e.target.value)} /></Field>
              </div>
            </div>
          ))}
          <Field label="Office use only (notes, decisions and file checks)" className="sm:col-span-2">
            <TextArea value={form.office_use_notes} onChange={(e) => setValue('office_use_notes', e.target.value)} />
          </Field>
          <div className={GROUP_CARD}>
            <h4 className="mb-3 text-sm font-bold">Buddy shift (induction)</h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Buddy shift date"><DateInput value={form.buddy_shift_date} onChange={(e) => setValue('buddy_shift_date', e.target.value)} /></Field>
              <Field label="Buddy shift time"><TextInput value={form.buddy_shift_time} onChange={(e) => setValue('buddy_shift_time', e.target.value)} /></Field>
              <Field label="Other employee present"><TextInput value={form.buddy_shift_other_employee} onChange={(e) => setValue('buddy_shift_other_employee', e.target.value)} /></Field>
            </div>
          </div>
          <Field label="Working With Children Check number"><TextInput value={form.wwcc_number} onChange={(e) => setValue('wwcc_number', e.target.value)} /></Field>
          <Field label="NDIS Worker Screening Check number"><TextInput value={form.ndis_worker_screening_number} onChange={(e) => setValue('ndis_worker_screening_number', e.target.value)} /></Field>
          <div className="grid gap-2 rounded-lg border border-border p-3 sm:col-span-2 sm:grid-cols-2">
            <Checkbox checked={form.right_to_work} onChange={(e) => setValue('right_to_work', e.target.checked)} label="Right to work in Australia" />
            <Checkbox checked={form.drivers_licence} onChange={(e) => setValue('drivers_licence', e.target.checked)} label="Current driver licence" />
            <Checkbox checked={form.own_vehicle} onChange={(e) => setValue('own_vehicle', e.target.checked)} label="Own vehicle" />
            <Checkbox checked={form.first_aid_current} onChange={(e) => setValue('first_aid_current', e.target.checked)} label="First aid certificate current" />
          </div>
          <Field label="Employee recognition dashboard consent" className="sm:col-span-2">
            <Checkbox
              checked={form.recognition_dashboard_consent}
              onChange={(e) => setValue('recognition_dashboard_consent', e.target.checked)}
              label="Yes - the employee consents to being displayed on the recognition dashboard"
            />
          </Field>
        </>
      )}
      <div className={GROUP_CARD}>
        <h4 className="mb-3 text-sm font-bold">Emergency Contact 1</h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Full name"><TextInput value={form.emergency_contact_1_name} onChange={(e) => setValue('emergency_contact_1_name', e.target.value)} /></Field>
          <Field label="Relationship"><TextInput value={form.emergency_contact_1_relationship} onChange={(e) => setValue('emergency_contact_1_relationship', e.target.value)} /></Field>
          <Field label="Phone number"><TextInput type="tel" value={form.emergency_contact_1_phone} onChange={(e) => setValue('emergency_contact_1_phone', e.target.value)} /></Field>
        </div>
      </div>
      <div className={GROUP_CARD}>
        <h4 className="mb-3 text-sm font-bold">Emergency Contact 2</h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Full name"><TextInput value={form.emergency_contact_2_name} onChange={(e) => setValue('emergency_contact_2_name', e.target.value)} /></Field>
          <Field label="Relationship"><TextInput value={form.emergency_contact_2_relationship} onChange={(e) => setValue('emergency_contact_2_relationship', e.target.value)} /></Field>
          <Field label="Phone number"><TextInput type="tel" value={form.emergency_contact_2_phone} onChange={(e) => setValue('emergency_contact_2_phone', e.target.value)} /></Field>
        </div>
      </div>
      {intakeType === 'Participant' && (
        <>
          <Field label="Communication and accessibility needs" className="sm:col-span-2">
            <TextArea value={form.communication_needs} onChange={(e) => setValue('communication_needs', e.target.value)} />
          </Field>
          <Field label="Requested supports" className="sm:col-span-2">
            <TextArea value={form.requested_supports} onChange={(e) => setValue('requested_supports', e.target.value)} />
          </Field>
          <Field label="Reason for referral"><TextArea value={form.reason_for_referral} onChange={(e) => setValue('reason_for_referral', e.target.value)} /></Field>
          <Field label="Current supports and living arrangements"><TextArea value={form.current_supports} onChange={(e) => setValue('current_supports', e.target.value)} /></Field>
          <Field label="Strengths, preferences and goals"><TextArea value={form.goals_preferences} onChange={(e) => setValue('goals_preferences', e.target.value)} /></Field>
          <Field label="Health, medication and allergies"><TextArea value={form.health_summary} onChange={(e) => setValue('health_summary', e.target.value)} /></Field>
          <Field label="Risks and immediate safeguards" className="sm:col-span-2">
            <TextArea value={form.risk_summary} onChange={(e) => setValue('risk_summary', e.target.value)} />
          </Field>
          <Field label="Plan type">
            <Select value={form.plan_type} onChange={(e) => setValue('plan_type', e.target.value)}>
              <option>Plan Managed</option>
              <option>Self Managed</option>
              <option>NDIA Managed</option>
            </Select>
          </Field>
          <Field label="NDIS plan start"><DateInput value={form.plan_start_date} onChange={(e) => setValue('plan_start_date', e.target.value)} /></Field>
          <Field label="NDIS plan end"><DateInput value={form.plan_end_date} onChange={(e) => setValue('plan_end_date', e.target.value)} /></Field>
          <div className="grid gap-2 rounded-lg border border-border p-3 sm:col-span-2 sm:grid-cols-2">
            <Checkbox checked={form.medication_support_required} onChange={(e) => setValue('medication_support_required', e.target.checked)} label="Medication support required" />
            <Checkbox checked={form.mealtime_support_required} onChange={(e) => setValue('mealtime_support_required', e.target.checked)} label="Mealtime support required" />
            <Checkbox checked={form.behaviour_support_required} onChange={(e) => setValue('behaviour_support_required', e.target.checked)} label="Behaviour support required" />
            <Checkbox checked={form.restrictive_practice_identified} onChange={(e) => setValue('restrictive_practice_identified', e.target.checked)} label="Restrictive practice identified" />
            <Checkbox checked={form.travel_assistance_required} onChange={(e) => setValue('travel_assistance_required', e.target.checked)} label="Wants assistance with travel" />
            <Checkbox checked={form.pets_on_property} onChange={(e) => setValue('pets_on_property', e.target.checked)} label="Pets on property" />
          </div>
        </>
      )}
      <Field label="Referral source"><TextInput value={form.referral_source} onChange={(e) => setValue('referral_source', e.target.value)} /></Field>
      <Field label={intakeType === 'Participant' ? 'Target start date' : 'Proposed start date'}><DateInput value={form.target_start_date} onChange={(e) => setValue('target_start_date', e.target.value)} /></Field>
      <Field label="Eligibility / service fit">
        <Select value={form.service_fit} onChange={(e) => setValue('service_fit', e.target.value)}>
          <option>Pending</option>
          <option>Eligible</option>
          <option>Waitlist</option>
          <option>Not Suitable</option>
        </Select>
      </Field>
      <Field label="Notes"><TextArea value={form.notes} onChange={(e) => setValue('notes', e.target.value)} /></Field>
      <div className="space-y-2 sm:col-span-2">
        <Checkbox
          checked={form.privacy_consent}
          onChange={(e) => setValue('privacy_consent', e.target.checked)}
          label="Consent to collect and store intake information (required)"
        />
        <Checkbox
          checked={form.audit_consent_agreed}
          onChange={(e) => setValue('audit_consent_agreed', e.target.checked)}
          label="Consent to NDIS Audit - this profile may be included in NDIS audit records (declining is also recorded)"
        />
        <p className="text-xs text-muted-foreground">Either choice is recorded against the intake case with the date, time and the person who recorded it.</p>
      </div>
      <div className="flex items-center justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit intake
        </Button>
      </div>
    </form>
  );
}

export function IntakeReadinessPanel({ readiness, activeCase, resumeDocument, uploadingDoc, busy, onUpload, onView, allowResumeUpload = false }) {
  const done = readiness.checks.length - readiness.missing.length;
  return (
    <aside className="h-fit overflow-hidden rounded-xl border border-border/60 bg-card shadow-panel">
      <div className="gradient-brand px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">Intake readiness</span>
          <span className="text-xl font-extrabold">{readiness.score}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/30">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${readiness.score}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold">
          <span className="rounded-full bg-white/20 px-2 py-0.5">{done} of {readiness.checks.length} complete</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5">{readiness.missing.length} outstanding</span>
        </div>
      </div>
      <div className="p-4">
        {activeCase && <div className="mb-3 space-y-3">
          <IntakeReadinessExport activeCase={activeCase} readiness={readiness} />
          <IntakeResumeUpload activeCase={activeCase} document={resumeDocument} uploadingDoc={uploadingDoc} busy={busy} onUpload={onUpload} onView={onView} allowUpload={allowResumeUpload} />
        </div>}
        <p className="text-[10px] leading-relaxed text-foreground/45">
          Readiness supports NDIS onboarding controls and conditional safeguards. It does not replace provider-specific legal advice or an external certification audit.
        </p>
        {[
          ['Required information', readiness.informationChecks],
          ['Required documents', readiness.documentChecks],
        ].map(([heading, checks]) => (
          <div key={heading} className="mt-4 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wide text-foreground/45">{heading}</div>
            {checks.map((check) => (
              <div key={check.label} className="flex items-start gap-2 text-xs">
                {check.complete
                  ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  : <FileWarning className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />}
                <span className={check.complete ? 'text-foreground/65' : 'font-medium'}>{check.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}