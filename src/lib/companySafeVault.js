import { BUSINESS_PLANS } from '@/components/safe/BusinessPlanUploads';

// Plans already appear in Business Plans; badges are linked to Staff Documents.
// Read the original uploads in place so existing and future files stay in sync.
export const companySafeBusinessQuery = {
  library: 'company-safe',
  document_type: { $nin: [...BUSINESS_PLANS.map((plan) => plan.label), 'Staff Badge'] },
};