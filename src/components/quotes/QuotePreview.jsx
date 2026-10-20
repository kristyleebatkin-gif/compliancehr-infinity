import React from 'react';
import { lineAmount, parseLineItems } from '@/lib/ndisPriceGuide';
import { businessAddressLine } from '@/lib/quotePdf';
import financeDocumentDefaults from '@/components/invoicing/financeDocumentDefaults';

const money = (value) => `$${(Number(value) || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Multiline({ text }) {
  const parts = String(text || '').split('\n').filter(Boolean);
  if (!parts.length) return null;
  return <>{parts.map((p, i) => <div key={i}>{p}</div>)}</>;
}

export default function QuotePreview({ quote, business = {} }) {
  const lines = parseLineItems(quote.line_items);
  const subtotal = lines.length
    ? lines.reduce((sum, line) => sum + lineAmount(line), 0)
    : (Number(quote.subtotal) || Number(quote.total) || 0);

  return (
    <div className="rounded-xl border border-border bg-white text-slate-900 shadow-sm">
      <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 p-6 text-white">
        <div className="min-w-0">
          <div className="text-lg font-bold">{business.business_name || 'Business name'}</div>
          <div className="mt-1 text-[11px] leading-relaxed text-slate-300">{businessAddressLine(business) || 'Business address'}</div>
          <div className="text-[11px] text-slate-300">{[business.phone, business.email, business.website].filter(Boolean).join('  |  ')}</div>
          <div className="text-[11px] text-slate-300">{[business.abn && `ABN ${business.abn}`, business.ndis_provider_number && `NDIS Provider ${business.ndis_provider_number}`, business.contact_person && `Contact: ${business.contact_person}`].filter(Boolean).join('  |  ')}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-2xl font-bold tracking-wide">QUOTE</div>
          <div className="text-xs text-slate-300">{quote.quote_number}</div>
          <div className="text-xs text-slate-300">{quote.status || 'Draft'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-b border-slate-200 p-5 text-xs sm:grid-cols-4">
        <div><div className="font-semibold text-slate-500">Quote number</div><div className="font-medium">{quote.quote_number || '-'}</div></div>
        <div><div className="font-semibold text-slate-500">Quote date</div><div className="font-medium">{quote.issue_date || '-'}</div></div>
        <div><div className="font-semibold text-slate-500">Valid until</div><div className="font-medium">{quote.expiry_date || '-'}</div></div>
        <div><div className="font-semibold text-slate-500">Biller</div><div className="font-medium">{quote.biller_type || '-'}</div></div>
      </div>

      <div className="grid grid-cols-2 gap-6 border-b border-slate-200 p-5 text-xs">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Quoted to</div>
          <div className="font-semibold">{quote.client_name || '-'}</div>
          {quote.client_email && <div>{quote.client_email}</div>}
          {quote.client_address && <div className="whitespace-pre-line">{quote.client_address}</div>}
        </div>
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Participant</div>
          <div className="font-semibold">{quote.participant_name || '-'}</div>
          {quote.ndis_number && <div>NDIS: {quote.ndis_number}</div>}
          {quote.participant_address && <div className="whitespace-pre-line">{quote.participant_address}</div>}
        </div>
      </div>

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
            <tr className="border-b border-slate-100"><td className="px-3 py-3" colSpan={6}>No line items yet</td></tr>
          )}
          {lines.map((line, i) => (
            <tr key={i} className={i % 2 ? 'bg-violet-50' : ''}>
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

      <div className="flex justify-end border-b border-slate-200 p-5 text-xs">
        <div className="w-64 space-y-1.5">
          <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">{money(subtotal)}</span></div>
          <div className="flex justify-between text-slate-500"><span>GST</span><span>Included (GST-free)</span></div>
          <div className="flex justify-between border-t-2 border-violet-700 pt-1.5 text-sm font-bold text-violet-700"><span>QUOTE TOTAL</span><span>{money(subtotal)}</span></div>
        </div>
      </div>

      <div className="space-y-3 bg-slate-50 p-5 text-xs">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Quote terms and conditions</div>
          <Multiline text={quote.terms_conditions ?? financeDocumentDefaults(business).terms_conditions} />
        </div>
        <div><div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Notes</div><Multiline text={quote.notes} /></div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Acceptance</div>
          <div className="mt-2 grid grid-cols-3 gap-3 text-[10px] text-slate-500 sm:gap-6">
            <div className="border-t border-slate-300 pt-1">Client signature</div>
            <div className="border-t border-slate-300 pt-1">Name</div>
            <div className="border-t border-slate-300 pt-1">Date</div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 p-3 text-center text-[10px] text-slate-400">
        {business.business_name ? `${business.business_name} | Quote ${quote.quote_number || ''}` : `Quote ${quote.quote_number || ''}`}
      </div>
    </div>
  );
}