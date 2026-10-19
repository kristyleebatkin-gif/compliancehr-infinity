import { jsPDF } from 'jspdf';
import {
  drawBlankBusinessBranding,
  drawCompanyBranding,
  drawDocumentFooter,
  getCompanyBranding,
  hasConfiguredCompanyBranding,
} from '@/lib/companyBranding';
import { downloadPdfDocument } from '@/lib/documentDownloads';
import { USER_GUIDES } from '@/lib/userGuidesContent';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';

const BRAND = [49, 46, 129];
const ACCENT = [37, 99, 235];
const INK = [15, 23, 42];
const MUTED = [100, 116, 139];
const BORDER = [203, 213, 225];

function newDoc() {
  return new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
}

function drawHeader(doc, guideTitle, sectionLabel) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  doc.setFillColor(...BRAND);
  doc.rect(margin, 28, pageW - margin * 2, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(guideTitle, margin, 44, { maxWidth: pageW - margin * 2 - 140 });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...ACCENT);
  doc.text(sectionLabel, pageW - margin, 44, { align: 'right' });
  doc.setDrawColor(...BORDER);
  doc.line(margin, 52, pageW - margin, 52);
}

function text(doc, content, x, y, width, maxWidth = null) {
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  const lines = doc.splitTextToSize(content, maxWidth || width);
  lines.forEach((line) => {
    if (y > pageH - 70) {
      doc.addPage();
      y = 70;
    }
    doc.text(line, x, y);
    y += 14;
  });
  return y;
}

function heading(doc, label, y) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  if (y > pageH - 110) {
    doc.addPage();
    drawHeader(doc, heading.guideTitle, heading.sectionLabel);
    y = 74;
  }
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(margin, y, pageW - margin * 2, 24, 3, 3, 'F');
  doc.setFillColor(...ACCENT);
  doc.rect(margin, y, 3, 24, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...BRAND);
  doc.text(label, margin + 12, y + 16);
  return y + 36;
}

function buildGuideBody(doc, guide, meta) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentW = pageW - margin * 2;
  let y = 96;

  heading.guideTitle = meta.title;
  heading.sectionLabel = meta.code;

  // Purpose
  y = heading(doc, 'Purpose of this module', y);
  y = text(doc, guide.purpose, margin, y, contentW);
  y += 8;

  // Features
  if (guide.features?.length) {
    y = heading(doc, `What\u2019s inside (${guide.features.length} features)`, y);
    guide.features.forEach((feature) => {
      const nameLines = doc.splitTextToSize(feature.name, contentW - 20);
      nameLines.forEach((line) => {
        if (y > doc.internal.pageSize.getHeight() - 70) {
          doc.addPage();
          y = 74;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...ACCENT);
        doc.text(line, margin, y);
        y += 14;
      });
      y = text(doc, feature.detail, margin + 4, y, contentW - 4, contentW - 16) + 4;
    });
    y += 4;
  }

  // Steps
  if (guide.steps?.length) {
    y = heading(doc, 'How it works \u2014 step by step', y);
    guide.steps.forEach((step, index) => {
      const numbered = `${index + 1}. ${step}`;
      const lines = doc.splitTextToSize(numbered, contentW - 24);
      lines.forEach((line, lineIndex) => {
        if (y > doc.internal.pageSize.getHeight() - 70) {
          doc.addPage();
          y = 74;
        }
        doc.setFont('helvetica', lineIndex === 0 ? 'bold' : 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...INK);
        doc.text(line, margin, y);
        y += 14;
      });
      y += 3;
    });
  }

  // Tools
  if (guide.tools?.length) {
    y = heading(doc, 'Tools & resources', y);
    guide.tools.forEach((tool) => {
      const combined = `${tool.name}: ${tool.detail}`;
      const lines = doc.splitTextToSize(combined, contentW - 18);
      lines.forEach((line, lineIndex) => {
        if (y > doc.internal.pageSize.getHeight() - 70) {
          doc.addPage();
          y = 74;
        }
        if (lineIndex === 0) {
          const nameWidth = doc.getTextWidth(`${tool.name}: `);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(...INK);
          doc.text(`${tool.name}: `, margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(line.replace(`${tool.name}: `, ''), margin + nameWidth, y);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(...INK);
          doc.text(line, margin, y);
        }
        y += 14;
      });
      y += 3;
    });
  }

  // Tips
  if (guide.tips?.length) {
    y = heading(doc, 'Pro tips & good practice', y);
    doc.setFillColor(240, 253, 250);
    doc.roundedRect(margin, y - 16, contentW, 6, 0, 0, 'F');
    guide.tips.forEach((tip) => {
      const lines = doc.splitTextToSize(tip, contentW - 24);
      lines.forEach((line) => {
        if (y > doc.internal.pageSize.getHeight() - 70) {
          doc.addPage();
          y = 74;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...INK);
        doc.text(line, margin + 14, y);
        y += 14;
      });
      y += 4;
    });
  }
}

function finish(doc, title, code) {
  const useBranding = hasConfiguredCompanyBranding();
  drawDocumentFooter(doc, {
    title,
    code,
    companyName: useBranding ? getCompanyBranding().companyName : 'ComplianceHR Infinity',
    margin: 40,
  });
  return doc;
}

export function buildModuleGuidePdf(moduleKey) {
  const guide = USER_GUIDES[moduleKey];
  if (!guide) return null;
  const directoryEntry = MODULE_DIRECTORY.find((m) => m.key === moduleKey);
  const title = `${directoryEntry?.label || moduleKey} \u2014 User Guide`;
  const code = 'USER GUIDE';

  const doc = newDoc();
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentW = pageW - margin * 2;
  const useBranding = hasConfiguredCompanyBranding();

  // Cover top
  doc.setFillColor(...BRAND);
  doc.rect(margin, 28, contentW, 3, 'F');
  if (useBranding) drawCompanyBranding(doc, margin, 40);
  else drawBlankBusinessBranding(doc, margin, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text('COMPLIANCE MANAGEMENT PLATFORM \u2014 OFFICIAL USER GUIDE', margin, 92);

  let y = 130;
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(margin, y, contentW, 34, 4, 4, 'F');
  doc.setFillColor(...ACCENT);
  doc.rect(margin, y, 4, 34, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...BRAND);
  doc.text(directoryEntry?.label || moduleKey, margin + 16, y + 22);
  y += 52;

  if (guide.tagline) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...ACCENT);
    doc.text(guide.tagline, margin, y);
    y += 22;
  }
  doc.setDrawColor(...BORDER);
  doc.line(margin, y, pageW - margin, y);
  y += 20;

  buildGuideBody(doc, guide, { title, code });

  // Contents summary on cover would duplicate; keep single-flow document.
  return finish(doc, title, code);
}

export function downloadModuleGuidePdf(moduleKey) {
  const guide = USER_GUIDES[moduleKey];
  const directoryEntry = MODULE_DIRECTORY.find((m) => m.key === moduleKey);
  const doc = buildModuleGuidePdf(moduleKey);
  if (!doc) return;
  downloadPdfDocument(doc, `${(directoryEntry?.label || moduleKey).replace(/[^a-zA-Z0-9]+/g, '-')} User Guide.pdf`);
}

export function buildFullLibraryPdf() {
  const doc = newDoc();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentW = pageW - margin * 2;
  const useBranding = hasConfiguredCompanyBranding();

  // Library cover page
  doc.setFillColor(...BRAND);
  doc.rect(margin, 28, contentW, 3, 'F');
  if (useBranding) drawCompanyBranding(doc, margin, 40);
  else drawBlankBusinessBranding(doc, margin, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text('COMPLIANCE MANAGEMENT PLATFORM', margin, 92);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...INK);
  doc.text('Complete User Guide Library', margin, 140);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  const intro = 'Every module, every feature, every process \u2014 the complete operating manual for the platform, covering purpose, features, step-by-step workflows, tools and good-practice tips for each module.';
  doc.text(doc.splitTextToSize(intro, contentW), margin, 170);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND);
  doc.text(`Contents \u2014 ${MODULE_DIRECTORY.length} module guides`, margin, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  let y = 262;
  const moduleList = MODULE_DIRECTORY.filter((m) => USER_GUIDES[m.key]);
  moduleList.forEach((m, index) => {
    const numbered = `${index + 1}.  ${m.label}`;
    if (y > pageH - 90) {
      doc.addPage();
      y = 74;
    }
    doc.text(numbered, margin + 8, y);
    y += 16;
  });
  y += 12;
  if (y > pageH - 110) {
    doc.addPage();
    y = 74;
  }
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Generated ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, y);

  // Each guide as its own chapter, starting on a fresh page
  moduleList.forEach((m, index) => {
    doc.addPage();
    const guide = USER_GUIDES[m.key];
    doc.setFillColor(...BRAND);
    doc.rect(margin, 28, contentW, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...INK);
    doc.text(`${index + 1}. ${m.label}`, margin, 56);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...ACCENT);
    doc.text('USER GUIDE', pageW - margin, 56, { align: 'right' });
    doc.setDrawColor(...BORDER);
    doc.line(margin, 66, pageW - margin, 66);
    buildGuideBody(doc, guide, { title: `${m.label} \u2014 User Guide`, code: `Section ${index + 1}` });
  });

  return finish(doc, 'Complete User Guide Library', 'FULL LIBRARY');
}

export function downloadFullLibraryPdf() {
  const doc = buildFullLibraryPdf();
  downloadPdfDocument(doc, 'Complete User Guide Library.pdf');
}