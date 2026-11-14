// Single source for the business's local time zone.
// Choices NQ operates in Queensland (no daylight saving), so the default is Australia/Brisbane.
// When per-organisation settings are added, read Tenant.timezone and fall back to this value.
export const BUSINESS_TIME_ZONE = 'Australia/Brisbane';
export const BUSINESS_TIME_LABEL = 'Brisbane';
