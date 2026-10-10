import { jsPDF } from 'jspdf';

const money = (value) => `$${(Number(value) || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function safeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

export function businessAddressLine(business = {}) {
  return [business.address_line, business.suburb, business.state, business.postcode].filter(Boolean).join(', ');
}

function eventWhen(event) {
  const parts = [];
  if (event.date) {
    const start = new Date(`${event.date}T00:00:00`);
    let when = start.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (event.end_date && event.end_date !== event.date) {
      const end = new Date(`${event.end_date}T00:00:00`);
      when += ` to ${end.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
    }
    parts.push(when);
  }
  const times = [event.start_time, event.end_time].filter(Boolean).join(' - ');
  if (times) parts.push(times);
  return parts.join(', ');
}

export function inviteEmailBody(event, business = {}) {
  const when = eventWhen(event);
  return [
    `You're invited: ${event.title}`,
    '',
    `${event.type === 'Event' ? 'Event' : 'Program'} details:`,
    when && `When: ${when}`,
    event.location && `Where: ${event.location}`,
    event.organiser && `Organiser: ${event.organiser}`,
    event.cost_text && `Cost: ${event.cost_text}`,
    '',
    event.ad_body || event.description || '',
    '',
    event.ad_cta || 'To RSVP or find out more, simply reply to this email.',
    business.contact_person && business.email ? `Contact: ${business.contact_person} (${business.email})` : (business.email ? `Contact: ${business.email}` : ''),
  ].filter(Boolean).join('\n').slice(0, 5000);
}

export async function fetchImageDataUrl(url) {
  if (!url) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function buildEventAdPdf(event, business = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 0;
  const pad = 40;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 64, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(safeText(business.business_name || 'You are invited'), pad, 38, { maxWidth: pageW - pad * 2 - 120 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text((event.type === 'Event' ? 'EVENT' : 'PROGRAM'), pageW - pad, 38, { align: 'right' });

  let y = 88;

  const imageData = await fetchImageDataUrl(event.ad_image_url);
  if (imageData) {
    try {
      const props = doc.getImageProperties(imageData);
      const w = pageW - pad * 2;
      const h = Math.min(240, (props.height / props.width) * w);
      doc.addImage(imageData, 'JPEG', pad, y, w, h);
      y += h + 24;
    } catch { /* headline still renders */ }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(15, 23, 42);
  doc.text(safeText(event.ad_headline || event.title), pad, y, { maxWidth: pageW - pad * 2 });
  y += 34;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  const when = eventWhen(event);
  if (when) { doc.text(when, pad, y, { maxWidth: pageW - pad * 2 }); y += 16; }
  if (event.location) { doc.text(`Location: ${safeText(event.location)}`, pad, y, { maxWidth: pageW - pad * 2 }); y += 16; }
  if (event.cost_text) { doc.text(`Cost: ${safeText(event.cost_text)}`, pad, y, { maxWidth: pageW - pad * 2 }); y += 16; }
  y += 8;

  const bodyText = safeText(event.ad_body || event.description || '');
  if (bodyText) {
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    const bodyLines = doc.splitTextToSize(bodyText, pageW - pad * 2);
    doc.text(bodyLines, pad, y);
    y += bodyLines.length * 15 + 14;
  }

  if (y < pageH - 150) {
    const cta = safeText(event.ad_cta) || 'To RSVP or find out more, simply reply to this email.';
    doc.setFillColor(15, 23, 42);
    const ctaLines = doc.splitTextToSize(cta, pageW - pad * 2 - 32);
    const boxH = ctaLines.length * 14 + 28;
    doc.roundedRect(pad, y, pageW - pad * 2, boxH, 8, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(ctaLines, pad + 16, y + 26);
    y += boxH + 20;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const contactLines = [
    [business.contact_person && `Contact: ${business.contact_person}`, business.phone, business.email].filter(Boolean).join('  |  '),
    businessAddressLine(business),
    [business.website, business.abn && `ABN ${business.abn}`].filter(Boolean).join('  |  '),
  ].filter(Boolean);
  contactLines.forEach((line, i) => {
    if (y + i * 13 < pageH - 30) doc.text(line, pad, y + i * 13, { maxWidth: pageW - pad * 2 });
  });

  return doc;
}

export async function downloadEventAdPdf(event, business) {
  (await buildEventAdPdf(event, business)).save(`Ad-${(event.title || 'event').replace(/[^\w-]+/g, '-')}.pdf`);
}

export async function eventAdPdfBase64(event, business) {
  return (await buildEventAdPdf(event, business)).output('datauristring').split(',').pop();
}