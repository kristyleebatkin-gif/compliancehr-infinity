export const PARTICIPANT_PROFILE_SECTIONS = [
  { title: 'Participant identity & personal details', fields: [
    { key: 'full_name', label: 'Participant full name', readOnly: true },
    { key: 'status', label: 'Participant status', options: ['Active', 'On Hold', 'Inactive'] },
    { key: 'date_of_birth', label: 'Date of birth', type: 'date' },
    { key: 'address', label: 'Address' },
  ] },
  { title: 'Contacts & emergency', fields: [
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'emergency_contact', label: 'Emergency contact name' },
    { key: 'emergency_contact_phone', label: 'Emergency contact phone', type: 'tel' },
    { key: 'advocate_representative', label: 'Advocate / representative' },
  ] },
  { title: 'NDIS & coordination', fields: [
    { key: 'ndis_number', label: 'NDIS number' },
    { key: 'ndis_reference_number', label: 'NDIS reference number' },
    { key: 'support_coordinator', label: 'Support coordination' },
    { key: 'plan_manager', label: 'Plan manager' },
    { key: 'plan_manager_email', label: 'Plan manager email', type: 'email' },
    { key: 'support_type', label: 'Type of support being provided', multiline: true },
  ] },
  { title: 'Health & support', fields: [
    { key: 'medical_diagnosis', label: 'Medical diagnosis', multiline: true },
    { key: 'occupational_therapist', label: 'Occupational therapist' },
    { key: 'medications_dosage', label: 'Medications and dosage', multiline: true },
    { key: 'support_shifts', label: 'Support shifts', multiline: true },
    { key: 'support_staff', label: 'Support staff', multiline: true },
  ] },
  { title: 'Preferences & safeguards', fields: [
    ...['likes', 'dislikes', 'routine', 'triggers', 'risks', 'control_measures', 'fire_drill'].map((key) => ({ key, label: ({ likes: 'Likes', dislikes: 'Dislikes', routine: 'Routine', triggers: 'Triggers', risks: 'Risks', control_measures: 'Control measures', fire_drill: 'Fire drill' })[key], multiline: true })),
    { key: 'notes', label: 'Participant notes', multiline: true },
  ] },
  { title: 'Progress note history', fields: [
    { key: 'progress_notes_due_date', label: 'Progress notes due (3 monthly)', type: 'date', readOnly: true },
    { key: 'last_progress_copy_date', label: 'Last progress copy sent', type: 'date', readOnly: true },
    { key: 'progress_email_log', label: 'Progress email log', multiline: true, readOnly: true },
  ] },
];