import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'compliancehr_company_branding';
export const COMPLIANCE_HR_FOOTER = 'ComplianceHR Infinity | Complete Control. Greater Confidence. Brighter Success.';
const DEFAULTS = {
  companyName: 'Choices North Queensland (Choices NQ)',
  slogan: 'Complete Control. Greater Confidence. Brighter Success.',
  logoUrl: 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/8f4f0ca87_generated_image.png',
  logoDataUrl: '',
  addressLine: 'U5/14 Keane Street, Currajong, QLD, 4812',
  abn: '11769681650',
  phone: '0402 165 668',
  email: 'kristyleebatkin@live.com.au',
};

const composeAddress = (business) => [
  business?.address_line,
  [business?.suburb, business?.state, business?.postcode].filter(Boolean).join(' '),
].filter(Boolean).join(', ');

const businessToBranding = (business) => ({
  companyName: business?.business_name || business?.trading_name || '',
  addressLine: composeAddress(business) || '',
  abn: business?.abn || '',
  phone: business?.phone || '',
  email: business?.email || '',
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
    const branding = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    // Older caches stored the slogan with the brand name prefixed; drop it so
    // documents never print the name twice.
    branding.slogan = String(branding.slogan || '')
      .replace(/^ComplianceHR (Infinity|Infinitely)\s*[|·]\s*/i, '')
      .trim() || DEFAULTS.slogan;
    return branding;
  } catch {
    return DEFAULTS;
  }
}

export function hasConfiguredCompanyBranding() {
  const companyName = String(getCompanyBranding().companyName || '').trim().toLowerCase();
  return Boolean(companyName && companyName !== 'compliancehr');
}

export function cacheCompanyBranding(branding) {
  const value = { ...getCompanyBranding(), ...branding };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  return value;
}

export async function loadCompanyBranding() {
  let providerPage = { items: [] };
  let businessPage = { items: [] };
  // Branding lookups must never fail an export: roles without Provider or
  // Business Details read access fall back to the cached branding.
  try {
    [providerPage, businessPage] = await Promise.all([
      base44.entities.Provider.filter({ document_branding_active: true }, { sort: '-created_date', limit: 1 }),
      base44.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 }),
    ]);
  } catch {
    return { ...getCompanyBranding(), providerId: '' };
  }
  let provider = providerPage.items?.[0] || null;
  if (!provider) {
    const fallback = await base44.entities.Provider.list({ sort: '-created_date', limit: 1 });
    provider = fallback.items?.[0] || null;
  }
  const business = businessPage.items?.[0] || null;
  const businessBranding = businessToBranding(business);
  if (!provider && !business) return { ...getCompanyBranding(), providerId: '' };
  let logoDataUrl = getCompanyBranding().logoDataUrl;
  if (provider?.logo_url && provider.logo_url !== getCompanyBranding().logoUrl) {
    try {
      logoDataUrl = await logoUrlToDataUrl(provider.logo_url);
    } catch {
      logoDataUrl = '';
    }
  }
  return {
    ...cacheCompanyBranding({
      companyName: businessBranding.companyName || provider?.provider_name || DEFAULTS.companyName,
      slogan: provider?.document_slogan || DEFAULTS.slogan,
      logoUrl: provider?.logo_url || getCompanyBranding().logoUrl || '',
      logoDataUrl,
      addressLine: businessBranding.addressLine,
      abn: businessBranding.abn,
      phone: businessBranding.phone,
      email: businessBranding.email,
    }),
    providerId: provider?.id || '',
  };
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
  window.dispatchEvent(new CustomEvent('company-identity-saved', { detail: { companyName: payload.provider_name } }));
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
  const availableWidth = Math.min(maxWidth, doc.internal.pageSize.getWidth() - textX - 40);
  const nameLines = doc.splitTextToSize(branding.companyName, availableWidth);
  doc.text(nameLines, textX, y, { lineHeightFactor: 1.2 });
  let bottomY = y + (nameLines.length - 1) * fontSize * 1.2 + 15;
  const sloganSize = Math.max(7.5, fontSize * 0.5);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(sloganSize); doc.setTextColor(71, 85, 105);
  const sloganLines = doc.splitTextToSize(branding.slogan, availableWidth);
  doc.text(sloganLines, textX, bottomY, { lineHeightFactor: 1.35 });
  bottomY += sloganLines.length * sloganSize * 1.35 + 4;
  if (branding.addressLine) {
    doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    const addressLines = doc.splitTextToSize(branding.addressLine, availableWidth);
    doc.text(addressLines, textX, bottomY, { lineHeightFactor: 1.35 });
    bottomY += addressLines.length * 9.5 + 5;
  }
  for (const [offset, color] of [[0, [37, 99, 235]], [18, [124, 58, 237]], [36, [236, 72, 153]]]) {
    doc.setFillColor(...color); doc.rect(textX + offset, bottomY, 18, 2.5, 'F');
  }
  return { ...branding, textX, bottomY: bottomY + 3 };
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
  docType = '',
  confidential = '',
  margin = 40,
} = {}) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const pages = doc.internal.getNumberOfPages();
  const descriptor = [confidential, docType && docType !== title && docType, title, code && `(${code})`].filter(Boolean).join(' | ');
  const branding = getCompanyBranding();
  const footerTextX = branding.logoDataUrl ? margin + 24 : margin;
  const slogan = branding.slogan || 'Complete Control. Greater Confidence. Brighter Success.';

  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    // Brand accent rule and a clean divider line to open the footer.
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, pageH - 48, 18, 2.5, 'F');
    doc.setFillColor(124, 58, 237);
    doc.rect(margin + 18, pageH - 48, 18, 2.5, 'F');
    doc.setFillColor(236, 72, 153);
    doc.rect(margin + 36, pageH - 48, 18, 2.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageH - 42, pageW - margin, pageH - 42);
    if (branding.logoDataUrl) {
      try {
        const properties = doc.getImageProperties(branding.logoDataUrl);
        const ratio = Math.min(14 / properties.width, 14 / properties.height);
        doc.addImage(
          branding.logoDataUrl,
          margin,
          pageH - 33,
          properties.width * ratio,
          properties.height * ratio,
        );
      } catch {
        // Preserve the text footer if the cached logo format is unsupported.
      }
    }
    // Separate columns keep the brand, document identifier and page number apart.
    const available = pageW - footerTextX - margin;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(30, 41, 59);
    doc.text('ComplianceHR Infinity', footerTextX, pageH - 30);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    if (descriptor) doc.text(descriptor, pageW - margin, pageH - 30, { align: 'right', maxWidth: Math.max(70, available - 150) });
    doc.setFont('helvetica', 'italic');
    doc.text(slogan, footerTextX, pageH - 17, { maxWidth: available - 75 });
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${page} of ${pages}`, pageW - margin, pageH - 17, { align: 'right' });
  }
}