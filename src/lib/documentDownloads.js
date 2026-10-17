function safeFilename(label, extension) {
  const safeLabel = label.replace(/[<>:"/\\|?*]+/g, '-').trim() || 'document';
  return extension && !safeLabel.toLowerCase().endsWith(extension.toLowerCase())
    ? `${safeLabel}${extension}`
    : safeLabel;
}

function extensionFromUrl(url) {
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    const sourceName = decodeURIComponent(pathname.slice(pathname.lastIndexOf('/') + 1));
    const match = sourceName.match(/\.[a-z0-9]{1,8}$/i);
    return match?.[0] || '';
  } catch {
    return '';
  }
}

function triggerDownload(href, filename, openInNewTab = false) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  if (openInNewTab) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function pickerTypes(filename) {
  const extension = filename.match(/\.[a-z0-9]{1,8}$/i)?.[0].toLowerCase() || '';
  const mimeTypes = {
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.pdf': 'application/pdf',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  const mimeType = mimeTypes[extension] || 'application/octet-stream';
  return [{
    description: extension ? `${extension.slice(1).toUpperCase()} document` : 'Document',
    accept: { [mimeType]: extension ? [extension] : [] },
  }];
}

async function writeWithSavePicker(blob, filename, fileHandle = null) {
  const handle = fileHandle || await window.showSaveFilePicker({
    suggestedName: filename,
    types: pickerTypes(filename),
  });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function downloadOriginalDocument(url, label) {
  const filename = safeFilename(label, extensionFromUrl(url));
  // Fetch the file first (CORS is allowed on the app's media files); if the
  // fetch is blocked the browser downloads the URL directly instead.
  let blob = null;
  try {
    const response = await fetch(url);
    if (response.ok) {
      const candidate = await response.blob();
      if (candidate.size) blob = candidate;
    }
  } catch { blob = null; }
  if (blob && typeof window.showSaveFilePicker === 'function') {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: pickerTypes(filename),
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return filename;
    } catch (error) {
      if (error?.name === 'AbortError') return filename; // user closed the save dialog
      // Save picker unavailable (e.g. embedded iframe): fall through to the
      // standard browser download below.
    }
  }
  if (blob) {
    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl, filename);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
    return filename;
  }
  triggerDownload(url, filename, true);
  return filename;
}

export function downloadPdfDocument(doc, filename) {
  const safePdfFilename = safeFilename(filename.replace(/\.pdf$/i, ''), '.pdf');
  if (typeof window.showSaveFilePicker === 'function') {
    const blob = doc.output('blob');
    return writeWithSavePicker(blob, safePdfFilename).catch((error) => {
      if (error?.name !== 'AbortError') {
        console.error('PDF save failed; using browser download fallback', error);
        doc.save(safePdfFilename);
      }
    });
  }
  doc.save(safePdfFilename);
  return Promise.resolve();
}