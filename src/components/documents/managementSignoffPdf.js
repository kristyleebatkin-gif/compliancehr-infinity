import { drawSectionHeading, drawFieldRows } from '@/lib/formDocumentStyles';

export function drawManagementSignoff(doc, y, signoff = {}, interactive = false) {
  y = drawSectionHeading(doc, y, 'Management sign-off');
  return drawFieldRows(doc, y, [
    { label: 'Manager name' },
    { label: 'Management signature' },
    { label: 'Sign-off date' },
  ], {
    'Manager name': signoff?.name || '',
    'Management signature': signoff?.signature || '',
    'Sign-off date': signoff?.date || '',
  }, { interactive });
}