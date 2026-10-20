const TERM_FIELDS = [
  ['invoice_disputes', 'Invoice disputes'], ['gst_terms', 'Goods and services tax (GST)'],
  ['cancellation_refunds', 'Cancellation and refunds'], ['invoice_changes', 'Changes to invoices'],
  ['payment_confirmation', 'Payment confirmation'], ['outstanding_accounts', 'Outstanding accounts'],
  ['contact_information', 'Contact information'],
];

export default function financeDocumentDefaults(business = {}) {
  const days = Number(business.payment_terms_days) || 14;
  const payment_details = [
    business.payment_methods && `Payment methods: ${business.payment_methods}`,
    business.payment_details,
    business.bank_name && `Bank: ${business.bank_name}`,
    business.bsb && `BSB: ${business.bsb}`,
    business.account_number && `Account number: ${business.account_number}`,
    business.account_name && `Account name: ${business.account_name}`,
    `Payment reference: ${business.payment_reference || 'please quote the invoice number.'}`,
    business.payment_instructions,
  ].filter(Boolean).join('\n');
  const quoteTerms = business.quote_terms ?? 'This quotation is valid for 30 days from the date of issue. Prices are based on the current NDIS Pricing Schedule and may change if the schedule is updated. NDIS supports are GST free. A formal service agreement will be prepared once the quotation is accepted.';
  const payment_terms = [
    business.payment_terms_note ?? `Payment is due within ${days} days of the invoice date.`,
    ...TERM_FIELDS.map(([key, label]) => business[key] && `${label}: ${business[key]}`),
    quoteTerms && `Quote terms and conditions:\n${quoteTerms}`,
  ].filter(Boolean).join('\n\n');
  return {
    payment_terms,
    payment_details,
    terms_conditions: [payment_terms, payment_details && `Payment details:\n${payment_details}`].filter(Boolean).join('\n\n'),
    notes: business.default_invoice_notes ?? 'NDIS supports are GST free.',
  };
}