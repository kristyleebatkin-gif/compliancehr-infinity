import { jsPDF } from 'jspdf';
import { STANDARD_2026_PRINT_TEMPLATES } from './standard2026PrintableTemplatesData';

function hexToRgb(hex) {
  const clean = (hex || '#4f46e5').replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Renders a single 2026-Compliant Standard Printable Template onto the current A4 page of a jsPDF doc.
 */
function renderTemplatePage(doc, tpl, orgInfo, blankMode = false, pageIndex = 1, totalPages = 1) {
  const W = 210; // A4 width mm
  const H = 297; // A4 height mm
  const M = 10;  // 10mm margin
  const contentW = W - M * 2;
  const [r, g, b] = hexToRgb(tpl.accent);

  // Outer crisp border
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.rect(M - 2, M - 2, W - (M - 2) * 2, H - (M - 2) * 2, 'S');

  // Top Header Gradient-style Band (Blue -> Purple -> Pink blocks)
  doc.setFillColor(37, 99, 235);
  doc.rect(M, M, contentW * 0.45, 20, 'F');
  doc.setFillColor(124, 58, 237);
  doc.rect(M + contentW * 0.45, M, contentW * 0.15, 20, 'F');
  doc.setFillColor(236, 72, 153);
  doc.rect(M + contentW * 0.6, M, contentW * 0.4, 20, 'F');

  // Header Text (White)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(
    `${orgInfo.businessName || 'COMPLIANCEHR INFINITY'} · ABN: ${orgInfo.abn || '____________________'} · NDIS REG: ${orgInfo.ndisReg || '______________'}`,
    M + 3,
    M + 5
  );
  doc.setFontSize(11.5);
  doc.text(tpl.title.toUpperCase(), M + 3, M + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`${tpl.subtitle}  |  ${tpl.binder}`, M + 3, M + 16.8);

  // Right badge in header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`${tpl.code} (${tpl.version})`, W - M - 3, M + 6, { align: 'right' });
  doc.setFontSize(7);
  doc.text(blankMode ? 'BLANK OFFICE PRINT MASTER' : '2026 SMART-FILL MASTER', W - M - 3, M + 11.5, { align: 'right' });
  doc.text(`Retention: ${tpl.retention}`, W - M - 3, M + 16.8, { align: 'right' });

  let y = M + 22.5;

  // Document Control & NDIS Standard Strip
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.25);
  doc.rect(M, y, contentW, 11, 'FD');
  doc.setTextColor(30, 27, 75);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.text(`MANDATORY 2026 STANDARD: ${tpl.ndisStandard}`, M + 2.5, y + 4.2);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Review Cycle: ${tpl.reviewCycle}   |   Site/Branch: ${orgInfo.siteName || '______________________'}   |   Audit Consent: [ ] Received   [ ] Declined`,
    M + 2.5,
    y + 8.8
  );

  y += 13.5;

  // Section 1: Mandatory Audit Metadata Grid (2 columns x 3 rows)
  doc.setFillColor(r, g, b);
  doc.rect(M, y, contentW, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('SECTION 1 — MANDATORY 2026 AUDIT CONTROL & RECORD METADATA', M + 2.5, y + 3.9);
  y += 5.5;

  const colW = contentW / 2;
  const rowH = 10.5;
  tpl.metadataFields.forEach((field, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cellX = M + col * colW;
    const cellY = y + row * rowH;

    doc.setDrawColor(200, 195, 225);
    doc.setFillColor(255, 255, 255);
    doc.rect(cellX, cellY, colW, rowH, 'FD');

    doc.setTextColor(88, 28, 135);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.3);
    doc.text(field.label.toUpperCase(), cellX + 2, cellY + 3.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    if (blankMode) {
      doc.setDrawColor(180, 180, 200);
      doc.line(cellX + 2, cellY + 8.5, cellX + colW - 3, cellY + 8.5);
    } else {
      const val = String(field.value ?? field.sample ?? '');
      doc.text(val.slice(0, 58), cellX + 2, cellY + 8);
    }
  });

  y += Math.ceil(tpl.metadataFields.length / 2) * rowH + 3;

  // Section 2: 2026 Compliance Verification Checkpoints Table
  doc.setFillColor(r, g, b);
  doc.rect(M, y, contentW, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('SECTION 2 — 2026 COMPLIANCE VERIFICATION CHECKPOINTS & EVIDENCE TRAIL', M + 2.5, y + 3.9);
  y += 5.5;

  // Table subheader
  doc.setFillColor(240, 244, 255);
  doc.setDrawColor(190, 190, 220);
  doc.rect(M, y, contentW, 5, 'FD');
  doc.setTextColor(30, 27, 75);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.text('REF', M + 2, y + 3.5);
  doc.text('MANDATORY 2026 COMPLIANCE CHECKPOINT', M + 16, y + 3.5);
  doc.text('STATUS (TICK ONE)', M + 118, y + 3.5);
  doc.text('EVIDENCE / SERIAL REF', M + 152, y + 3.5);
  y += 5;

  const cpRowH = 7.8;
  tpl.auditCheckpoints.forEach((cp, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 249, 255);
    doc.setDrawColor(210, 210, 230);
    doc.rect(M, y, contentW, cpRowH, 'FD');

    doc.setTextColor(88, 28, 135);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(cp.ref, M + 2, y + 4.8);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.6);
    doc.text(cp.item.slice(0, 68), M + 16, y + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.text(
      blankMode ? '[  ] Yes   [  ] No   [  ] N/A' : '[X] Yes   [  ] No   [  ] N/A',
      M + 118,
      y + 4.8
    );

    doc.setFont('helvetica', 'normal');
    if (blankMode) {
      doc.line(M + 152, y + 5.8, M + contentW - 2, y + 5.8);
    } else {
      doc.text((cp.evidence || '').slice(0, 26), M + 152, y + 4.8);
    }
    y += cpRowH;
  });

  y += 3;

  // Section 3 & 4: Ruled Narrative / Evidence Sections
  tpl.narrativeSections.forEach((sec) => {
    doc.setFillColor(r, g, b);
    doc.rect(M, y, contentW, 5.2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.text(sec.heading.toUpperCase(), M + 2.5, y + 3.7);
    y += 5.2;

    const boxH = 26;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(195, 195, 220);
    doc.rect(M, y, contentW, boxH, 'FD');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.2);
    doc.text(sec.prompt, M + 2.5, y + 4);

    // Draw ruled lines for office pen completion
    doc.setDrawColor(220, 220, 238);
    for (let lineY = y + 9.5; lineY < y + boxH - 1; lineY += 5.2) {
      doc.line(M + 2.5, lineY, M + contentW - 2.5, lineY);
    }

    if (!blankMode && sec.sampleText) {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.1);
      const wrapped = doc.splitTextToSize(sec.sampleText, contentW - 6);
      doc.text(wrapped.slice(0, 3), M + 3, y + 8.8);
    }

    y += boxH + 3;
  });

  // Section 5: Mandatory Dual-Signature & Audit Verification Block
  doc.setFillColor(r, g, b);
  doc.rect(M, y, contentW, 5.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('MANDATORY DUAL-SIGNATURE, DECLARATION & AUDITOR VERIFICATION BLOCK', M + 2.5, y + 3.7);
  y += 5.2;

  const sigH = 24;
  tpl.signOffRoles.forEach((role, idx) => {
    const sx = M + idx * colW;
    doc.setFillColor(252, 251, 255);
    doc.setDrawColor(190, 190, 220);
    doc.rect(sx, y, colW, sigH, 'FD');

    doc.setTextColor(88, 28, 135);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(role.roleLabel.toUpperCase(), sx + 2.5, y + 4.2);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(
      `Printed Name: ${blankMode ? '____________________________________' : role.nameSample}`,
      sx + 2.5,
      y + 10
    );
    doc.text('Signature: ________________________________________', sx + 2.5, y + 16);
    doc.text(
      `Date: ${blankMode ? '____ / ____ / 2026' : new Date().toISOString().slice(0, 10)}     Time: ${blankMode ? '____:____ AM/PM' : '09:30 AM'}`,
      sx + 2.5,
      y + 21.5
    );
  });

  // Bottom Footer Strip
  doc.setTextColor(88, 28, 135);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.3);
  doc.text(
    `${tpl.code} · ${tpl.version} · ComplianceHR Infinity 2026 Master Printable Compliance Suite · File in ${tpl.binder}`,
    M,
    H - 5
  );
  doc.text(`Page ${pageIndex} of ${totalPages}`, W - M, H - 5, { align: 'right' });
}

/**
 * Download a single 2026 Printable Template as an A4 PDF
 */
export function downloadSingle2026TemplatePdf(tpl, orgInfo = {}, blankMode = false) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  renderTemplatePage(doc, tpl, orgInfo, blankMode, 1, 1);
  const suffix = blankMode ? 'Blank-Print-Form' : 'Smart-Filled-2026';
  doc.save(`${tpl.code}-${suffix}.pdf`);
}

/**
 * Download ALL 12 Standard 2026 Printable Templates as a single multi-page A4 Master Office Binder PDF
 */
export function downloadAll2026TemplatesPackPdf(orgInfo = {}, blankMode = false) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const total = STANDARD_2026_PRINT_TEMPLATES.length;
  STANDARD_2026_PRINT_TEMPLATES.forEach((tpl, idx) => {
    if (idx > 0) doc.addPage();
    renderTemplatePage(doc, tpl, orgInfo, blankMode, idx + 1, total);
  });
  const suffix = blankMode ? 'Blank-Office-Print-Set' : 'Smart-Filled-Master-Set';
  doc.save(`ComplianceHR-2026-12-Standard-Printable-Templates-${suffix}.pdf`);
}