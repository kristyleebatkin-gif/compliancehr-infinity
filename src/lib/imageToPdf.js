import { jsPDF } from 'jspdf';

// Reads an image file into a JPEG data URL plus its pixel dimensions.
export const readImageDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => resolve({ dataUrl: reader.result, w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = reject;
    img.src = reader.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

// Converts an image file into a single-page A4 PDF File, fitted with margins.
export const imageFileToPdf = async (file, baseName) => {
  const { dataUrl, w, h } = await readImageDataUrl(file);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const scale = Math.min(200 / w, 277 / h);
  const pw = w * scale, ph = h * scale;
  doc.addImage(dataUrl, 'JPEG', (210 - pw) / 2, (297 - ph) / 2, pw, ph);
  const blob = doc.output('blob');
  const name = `${(baseName || file.name || 'Receipt').replace(/\.[^.]+$/, '').replace(/[^\w\s-]/g, '').trim() || 'Receipt'}.pdf`;
  return new File([blob], name, { type: 'application/pdf' });
};