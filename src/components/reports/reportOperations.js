import { base44 } from '@/api/base44Client';
import { fetchAllRecords } from '@/lib/csvExport';

export async function loadReportRecords(source) {
  if (!source.serviceView) return fetchAllRecords(base44.entities[source.entity], source.query || {}, '-created_date');
  const records = [];
  let cursor;
  const seen = new Set();
  do {
    const { data } = await base44.functions.invoke('employeeCommunications', { action: 'list', view: source.serviceView, ...(cursor ? { cursor } : {}) });
    if (data?.error || !Array.isArray(data?.items)) throw new Error(data?.error || 'Could not load communication records.');
    records.push(...data.items);
    if (data.has_more && !data.next_cursor) throw new Error('The next report page could not be loaded.');
    cursor = data.has_more ? data.next_cursor : null;
    if (cursor && seen.has(cursor)) throw new Error('The next report page could not be loaded.');
    if (cursor) seen.add(cursor);
  } while (cursor);
  return records;
}

const printCss = 'body{font-family:Arial,sans-serif;color:#0A2B6D;margin:28px}h1{font-size:22px}p{font-size:12px}table{border-collapse:collapse;width:100%;table-layout:fixed}th,td{border:1px solid #b9c9dc;padding:7px;text-align:left;vertical-align:top;overflow-wrap:anywhere;white-space:pre-wrap;font-size:11px}th{background:#eaf3ff}thead{display:table-header-group}tr{break-inside:avoid}@page{margin:16mm}';

function createReportDocument(node, title) {
  const doc = document.implementation.createHTMLDocument(title);
  const style = doc.createElement('style');
  style.textContent = printCss;
  doc.head.appendChild(style);
  doc.body.appendChild(doc.importNode(node, true));
  return doc;
}

export function downloadReport(node, title) {
  const report = createReportDocument(node, title);
  const url = URL.createObjectURL(new Blob(['<!doctype html>\n', report.documentElement.outerHTML], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'report'}.html`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printReport(node, title) {
  const frame = document.createElement('iframe');
  frame.setAttribute('title', 'Print report');
  frame.style.cssText = 'position:fixed;width:1px;height:1px;left:-10000px;top:0;border:0';
  document.body.appendChild(frame);
  const target = frame.contentDocument;
  const report = createReportDocument(node, title);
  target.replaceChild(target.importNode(report.documentElement, true), target.documentElement);
  frame.contentWindow.onafterprint = () => frame.remove();
  frame.contentWindow.focus();
  frame.contentWindow.print();
  setTimeout(() => frame.remove(), 60000);
}