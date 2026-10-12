// Curated national directory of support, crisis and technical services (Australia).
// Phone-first: every entry lists its number, hours and official website.
export const RESOURCE_CATEGORIES = [
  'Crisis & Mental Health',
  'Disability & NDIS',
  'Health & Medical',
  'Family & Safety',
  'Government & Legal',
  'Housing & Relief',
];

export const SUPPORT_RESOURCE_LIBRARY = [
  // Crisis & Mental Health
  { name: 'Emergency Services (Police, Fire, Ambulance)', category: 'Crisis & Mental Health', phone: '000', website: '', hours: '24/7', description: 'Immediate danger to life, fire, serious injury or crime in progress.' },
  { name: 'Lifeline Crisis Support', category: 'Crisis & Mental Health', phone: '13 11 14', website: 'https://www.lifeline.org.au', hours: '24/7', description: '24-hour telephone crisis support for anyone experiencing emotional distress.' },
  { name: 'Suicide Call Back Service', category: 'Crisis & Mental Health', phone: '1300 659 467', website: 'https://www.suicidecallbackservice.org.au', hours: '24/7', description: 'Professional telephone and online counselling for people affected by suicide.' },
  { name: 'Beyond Blue Support Service', category: 'Crisis & Mental Health', phone: '1300 224 636', website: 'https://www.beyondblue.org.au', hours: '24/7', description: 'Information and support for anxiety, depression and suicide prevention.' },
  { name: 'Kids Helpline', category: 'Crisis & Mental Health', phone: '1800 551 800', website: 'https://kidshelpline.com.au', hours: '24/7', description: 'Counselling for young people aged 5 to 25 and their parents or carers.' },
  { name: 'headspace (Youth Mental Health)', category: 'Crisis & Mental Health', phone: '1800 650 890', website: 'https://headspace.org.au', hours: '7am-10pm, 7 days', description: 'Early intervention mental health services for young people aged 12 to 25.' },
  { name: 'MensLine Australia', category: 'Crisis & Mental Health', phone: '1300 789 978', website: 'https://mensline.org.au', hours: '24/7', description: 'Telephone and online counselling for men with relationship or mental health concerns.' },

  // Disability & NDIS
  { name: 'NDIS (National Disability Insurance Agency)', category: 'Disability & NDIS', phone: '1800 800 110', website: 'https://www.ndis.gov.au', hours: 'Mon-Fri 8am-8pm', description: 'Plan enquiries, access requests, plan variations and payments.' },
  { name: 'NDIS Quality & Safeguards Commission', category: 'Disability & NDIS', phone: '1800 035 544', website: 'https://www.ndiscommission.gov.au', hours: 'Mon-Fri 9am-5pm', description: 'Complaints, reportable incidents, restrictive practices and provider registration.' },
  { name: 'Carer Gateway', category: 'Disability & NDIS', phone: '1800 422 737', website: 'https://www.carergateway.gov.au', hours: '24/7', description: 'Free support, respite and counselling services for unpaid carers.' },
  { name: 'Disability Advocacy Finder', category: 'Disability & NDIS', phone: '', website: 'https://disabilityadvocacyfinder.dss.gov.au', hours: 'Online', description: 'Find a funded disability advocacy organisation near the person you support.' },

  // Health & Medical
  { name: 'healthdirect Australia', category: 'Health & Medical', phone: '1800 022 222', website: 'https://www.healthdirect.gov.au', hours: '24/7', description: 'Free nurse triage, health advice and service finder for non-emergency concerns.' },
  { name: 'Poisons Information Line', category: 'Health & Medical', phone: '13 11 26', website: '', hours: '24/7', description: 'Urgent advice for poisoning, chemical exposure or suspected overdose (also in MSDS library).' },
  { name: '13HEALTH (Qld) / Nurse-on-call (state services)', category: 'Health & Medical', phone: '13 43 25 84', website: 'https://www.healthdirect.gov.au', hours: '24/7 (state dependent)', description: 'Qualified staff for health advice; each state has its own number, listed on healthdirect.' },

  // Family & Safety
  { name: '1800RESPECT (Family & Domestic Violence)', category: 'Family & Safety', phone: '1800 737 732', website: 'https://www.1800respect.org.au', hours: '24/7', description: 'National sexual assault, family and domestic violence counselling and safety planning.' },
  { name: 'Full Stop Australia', category: 'Family & Safety', phone: '1800 385 578', website: 'https://fullstop.org.au', hours: '24/7', description: 'Support for people affected by sexual, domestic or family violence.' },
  { name: 'Family Relationship Advice Line', category: 'Family & Safety', phone: '1800 050 321', website: 'https://www.familyrelationships.gov.au', hours: '8am-8pm Mon-Fri', description: 'Information about family relationship issues and referral to services.' },

  // Government & Legal
  { name: 'Services Australia (Centrelink)', category: 'Government & Legal', phone: '132 850', website: 'https://www.servicesaustralia.gov.au', hours: 'Mon-Fri 8am-5pm', description: 'Payments, Carer Allowance/Payment, NDIS related claims and concessions.' },
  { name: 'Fair Work Ombudsman', category: 'Government & Legal', phone: '13 13 94', website: 'https://www.fairwork.gov.au', hours: '8:30am-5:30pm Mon-Fri', description: 'Workplace rights, pay and conditions - useful for supported employees.' },
  { name: 'Australian Human Rights Commission', category: 'Government & Legal', phone: '1300 369 711', website: 'https://humanrights.gov.au', hours: 'Mon-Fri 9am-5pm', description: 'Disability discrimination complaints and rights information.' },
  { name: 'LawAccess / Community Legal Centres', category: 'Government & Legal', phone: '', website: 'https://www.communitylegalcentres.org.au', hours: 'Online directory', description: 'Find a free community legal centre in your state for the person you support.' },

  // Housing & Relief
  { name: 'My Aged Care', category: 'Housing & Relief', phone: '1800 200 400', website: 'https://www.myagedcare.gov.au', hours: '8am-8pm Mon-Fri, 10am-2pm Sat', description: 'Assessment and services for older people, including those not on the NDIS.' },
  { name: 'State Homelessness Services', category: 'Housing & Relief', phone: '', website: 'https://www.homelessnessaustralia.org.au', hours: 'Online directory', description: 'Find your state crisis accommodation line (e.g. Link2home NSW 1800 152 152, DVConnect Qld 1800 811 811).' },
  { name: 'Foodbank Australia', category: 'Housing & Relief', phone: '', website: 'https://www.foodbank.org.au', hours: 'Online directory', description: 'Emergency food relief locations for participants and families in hardship.' },
];