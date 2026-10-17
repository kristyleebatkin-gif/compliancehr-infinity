import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'compliancehr_company_branding';
export const COMPLIANCE_HR_FOOTER = 'ComplianceHR Infinitely | Complete Control. Greater Confidence. Brighter Success.';
const DEFAULTS = {
  companyName: 'ComplianceHR',
  slogan: COMPLIANCE_HR_FOOTER,
  logoUrl: '',
  logoDataUrl: '',
};

const providerToBranding = (provider) => ({
  providerId: provider?.id || '',
  companyName: provider?.provider_name || DEFAULTS.companyName,
  slogan: provider?.document_slogan || DEFAULTS.slogan,
  logoUrl: provider?.logo_url || '',
  logoDataUrl: '',
  active: Boolean(provider?.document_branding_active),
});

async function logoUrlToDataUrl(url) {
  if (!url) return '';
  const blob = await fetch(url).then((response) => {
    if (!response.ok) throw new Error('The company logo could not be loaded.');
    return response.blob();
  });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function getCompanyBranding() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return DEFAULTS;
  }
}

export function hasConfiguredCompanyBranding() {
  const companyName = String(getCompanyBranding().companyName || '').trim().toLowerCase();
  return Boolean(companyName && companyName !== 'compliancehr' && companyName !== 'choices nq');
}

export function cacheCompanyBranding(branding) {
  const value = { ...getCompanyBranding(), ...branding };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  return value;
}

export async function loadCompanyBranding() {
  const page = await base44.entities.Provider.list({ sort: '-created_date', limit: 500 });
  const providers = page.items || [];
  const provider = providers.find((candidate) => candidate.document_branding_active) || providers[0];
  if (!provider) return { ...getCompanyBranding(), providerId: '' };
  let logoDataUrl = provider.logo_url ? getCompanyBranding().logoDataUrl : '';
  if (provider.logo_url && provider.logo_url !== getCompanyBranding().logoUrl) {
    try {
      logoDataUrl = await logoUrlToDataUrl(provider.logo_url);
    } catch {
      logoDataUrl = '';
    }
  }
  return {
    ...cacheCompanyBranding({
      companyName: provider.provider_name || DEFAULTS.companyName,
      slogan: provider.document_slogan || DEFAULTS.slogan,
      logoUrl: provider.logo_url || '',
      logoDataUrl,
    }),
    providerId: provider.id,
  };
}

export async function listCompanyBrandingProfiles() {
  const page = await base44.entities.Provider.list({ sort: '-created_date', limit: 500 });
  return (page.items || []).map(providerToBranding);
}

export async function saveCompanyBranding({
  providerId,
  companyName,
  slogan,
  logoUrl,
  logoDataUrl,
}) {
  const payload = { provider_name: companyName.trim() || DEFAULTS.companyName, logo_url: logoUrl || '' };
  const response = await base44.functions.invoke('updateCompanyBranding', {
    provider_id: providerId || '',
    company_name: payload.provider_name,
    company_slogan: slogan?.trim() || DEFAULTS.slogan,
    logo_url: payload.logo_url,
  });
  if (response.data?.error) throw new Error(response.data.error);
  let cachedLogoDataUrl = logoDataUrl || '';
  if (!cachedLogoDataUrl && payload.logo_url) {
    try {
      cachedLogoDataUrl = await logoUrlToDataUrl(payload.logo_url);
    } catch {
      cachedLogoDataUrl = '';
    }
  }
  return {
    ...cacheCompanyBranding({
      companyName: payload.provider_name,
      slogan: slogan?.trim() || DEFAULTS.slogan,
      logoUrl: payload.logo_url,
      logoDataUrl: cachedLogoDataUrl,
    }),
    providerId: response.data.provider_id || providerId,
    active: true,
  };
}

export function drawCompanyBranding(doc, x, y, { fontSize = 16, logoSize = 30, maxWidth = 240 } = {}) {
  const branding = getCompanyBranding();
  let textX = x;
  if (branding.logoDataUrl) {
    try {
      const properties = doc.getImageProperties(branding.logoDataUrl);
      const ratio = Math.min(logoSize / properties.width, logoSize / properties.height);
      const width = properties.width * ratio;
      const height = properties.height * ratio;
      const boxY = y - logoSize + 5;
      doc.setFillColor(255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, boxY, logoSize, logoSize, 3, 3, 'FD');
      doc.addImage(
        branding.logoDataUrl,
        x + (logoSize - width) / 2,
        boxY + (logoSize - height) / 2,
        width,
        height,
      );
      textX += logoSize + 12;
    } catch {
      // Keep the company name visible when an unsupported logo format is cached.
    }
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontSize);
  doc.setTextColor(15, 23, 42);
  doc.text(branding.companyName, textX, y, { maxWidth });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(Math.max(6.5, fontSize * 0.45));
  doc.setTextColor(71, 85, 105);
  doc.text(branding.slogan, textX, y + 13, { maxWidth });
  doc.setFillColor(37, 99, 235);
  doc.rect(textX, y + 20, 18, 2.5, 'F');
  doc.setFillColor(124, 58, 237);
  doc.rect(textX + 18, y + 20, 18, 2.5, 'F');
  doc.setFillColor(236, 72, 153);
  doc.rect(textX + 36, y + 20, 18, 2.5, 'F');
  return { ...branding, textX };
}

export function drawBlankBusinessBranding(doc, x, y) {
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(x, y - 27, 74, 34, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BUSINESS LOGO', x + 37, y - 7, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Business name', x + 88, y - 9);
  doc.setDrawColor(148, 163, 184);
  doc.line(x + 88, y + 3, x + 350, y + 3);
  doc.setFillColor(37, 99, 235);
  doc.rect(x + 88, y + 7, 42, 2, 'F');
}

export function drawDocumentFooter(doc, {
  title = '',
  code = '',
  companyName = getCompanyBranding().companyName,
  confidential = '',
  margin = 40,
} = {}) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const pages = doc.internal.getNumberOfPages();
  const descriptor = [confidential, title, code && `(${code})`].filter(Boolean).join(' | ');
  const branding = getCompanyBranding();
  const footerTextX = branding.logoDataUrl ? margin + 22 : margin;

  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, pageH - 42, pageW - margin, pageH - 42);
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, pageH - 46, 18, 2.5, 'F');
    doc.setFillColor(124, 58, 237);
    doc.rect(margin + 18, pageH - 46, 18, 2.5, 'F');
    doc.setFillColor(236, 72, 153);
    doc.rect(margin + 36, pageH - 46, 18, 2.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    if (branding.logoDataUrl) {
      try {
        const properties = doc.getImageProperties(branding.logoDataUrl);
        const ratio = Math.min(16 / properties.width, 16 / properties.height);
        doc.addImage(
          branding.logoDataUrl,
          margin,
          pageH - 36,
          properties.width * ratio,
          properties.height * ratio,
        );
      } catch {
        // Preserve the text footer if the cached logo format is unsupported.
      }
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(companyName, footerTextX, pageH - 29, { maxWidth: pageW - footerTextX - margin - 70 });
    if (descriptor) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(descriptor, footerTextX + doc.getTextWidth(companyName) + 10, pageH - 29, {
        maxWidth: pageW - footerTextX - margin - 70 - doc.getTextWidth(companyName) - 10,
      });
    }
    doc.text(`Page ${page} of ${pages}`, pageW - margin, pageH - 29, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(49, 46, 129);
    doc.text(branding.slogan || COMPLIANCE_HR_FOOTER, footerTextX, pageH - 16, {
      maxWidth: pageW - footerTextX - margin,
    });
  }
}