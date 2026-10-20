import React from 'react';
import { lineAmount, parseLineItems } from '@/lib/ndisPriceGuide';
import { getCompanyBranding } from '@/lib/companyBranding';
import financeDocumentDefaults from '@/components/invoicing/financeDocumentDefaults';

const money = (value) => `$${(Number(value) || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Multiline({ text }) {
  const parts = String(text || '').split('\n').filter(Boolean);
  if (!parts.length) return null;
  return <>{parts.map((p, i) => <div key={i}>{p}</div>)}</>;
}

export default function InvoicePreview({ invoice, business = {} }) {
  const branding = getCompanyBranding();
  const lines = parseLineItems(invoice.line_items);
  const subtotal = lines.length
    ? lines.reduce((sum, line) => sum + lineAmount(line), 0)
    : (Number(invoice.subtotal) || Number(invoice.amount) || 0);

  return (
    <div className="rounded-xl border border-border bg-white text-slate-900 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 p-6 text-white">
        <div className="min-w-0">
          {branding.logoDataUrl && <img src={branding.logoDataUrl} alt="Business logo" className="mb-2 h-12 w-auto rounded-lg bg-white/90 p-1" />}
          <div className="text-lg font-bold">{business.business_name || 'Business name'}</div>
          <div className="mt-1 text-[11px] leading-relaxed text-slate-300">
            {[business.address_line, business.suburb, business.state, business.postcode].filter(Boolean).join(', ') || 'Business address'}
          </div>
          <div className="text-[11px] text-slate-300">{[business.phone, business.email, business.website].filter(Boolean).join('  |  ')}</div>
          <div className="text-[11px] text-slate-300">{[business.abn && `ABN ${business.abn}`, business.ndis_provider_number && `NDIS Provider ${business.ndis_provider_number}`].filter(Boolean).join('  |  ')}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-2xl font-bold tracking-wide">INVOICE</div>
          <div className="text-xs text-slate-300">{invoice.status || 'Draft'}</div>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 border-b border-slate-200 p-5 text-xs sm:grid-cols-4">
        <div><div className="font-semibold text-slate-500">Invoice number</div><div className="font-medium">{invoice.invoice_number || '-'}</div></div>
        <div><div className="font-semibold text-slate-500">Issue date</div><div className="font-medium">{invoice.issue_date || '-'}</div></div>
        <div><div className="font-semibold text-slate-500">Due date</div><div className="font-medium">{invoice.due_date || '-'}</div></div>
        <div><div className="font-semibold text-slate-500">Biller</div><div className="font-medium">{invoice.biller_type || '-'}</div></div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-6 border-b border-slate-200 p-5 text-xs">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Billed to</div>
          <div className="font-semibold">{invoice.client_name || '-'}</div>
          {invoice.client_email && <div>{invoice.client_email}</div>}
          {invoice.client_address && <div className="whitespace-pre-line">{invoice.client_address}</div>}
        </div>
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Participant</div>
          <div className="font-semibold">{invoice.participant_name || '-'}</div>
          {invoice.ndis_number && <div>NDIS: {invoice.ndis_number}</div>}
          {invoice.participant_address && <div className="whitespace-pre-line">{invoice.participant_address}</div>}
        </div>
      </div>

      {/* Line items */}
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-violet-700 text-left text-white">
            <th className="px-3 py-2 font-semibold">Support item</th>
            <th className="px-3 py-2 font-semibold">Description</th>
            <th className="px-3 py-2 font-semibold">Unit</th>
            <th className="px-3 py-2 text-right font-semibold">Qty</th>
            <th className="px-3 py-2 text-right font-semibold">Rate</th>
            <th className="px-3 py-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 && (
            <tr className="border-b border-slate-100"><td className="px-3 py-3" colSpan={6}>{invoice.description || 'Supports delivered'}</td></tr>
          )}
          {lines.map((line, i) => (
            <tr key={i} className={i % 2 ? 'bg-slate-50' : ''}>
              <td className="border-b border-slate-100 px-3 py-2 align-top font-mono text-[10px]">{line.code || '-'}</td>
              <td className="border-b border-slate-100 px-3 py-2 align-top">{line.description}</td>
              <td className="border-b border-slate-100 px-3 py-2 align-top">{line.unit}</td>
              <td className="border-b border-slate-100 px-3 py-2 text-right align-top">{line.qty}</td>
              <td className="border-b border-slate-100 px-3 py-2 text-right align-top">{money(line.unit_price)}</td>
              <td className="border-b border-slate-100 px-3 py-2 text-right align-top font-medium">{money(lineAmount(line))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end border-b border-slate-200 p-5 text-xs">
        <div className="w-64 space-y-1.5">
          <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">{money(subtotal)}</span></div>
          <div className="flex justify-between text-slate-500"><span>GST</span><span>Included (GST-free)</span></div>
          <div className="flex justify-between border-t-2 border-violet-700 pt-1.5 text-sm font-bold text-violet-700"><span>TOTAL DUE</span><span>{money(subtotal)}</span></div>
        </div>
      </div>

      {/* Payment block */}
      <div className="space-y-3 bg-slate-50 p-5 text-xs">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Payment details</div>
          <Multiline text={invoice.payment_details ?? financeDocumentDefaults(business).payment_details} />
        </div>
        <div><div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Payment terms</div><Multiline text={invoice.payment_terms ?? financeDocumentDefaults(business).payment_terms} /></div>
        <div><div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Notes</div><Multiline text={invoice.notes} /></div>
      </div>
      <div className="border-t border-slate-200 p-3 text-center text-[10px] text-slate-400">
        {business.business_name ? `${business.business_name} | Invoice ${invoice.invoice_number || ''}` : `Invoice ${invoice.invoice_number || ''}`}
      </div>
    </div>
  );
}