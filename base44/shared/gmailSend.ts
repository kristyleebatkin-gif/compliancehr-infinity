// Sends an email through the app's connected Gmail account (gmail.send scope).
// Builds an RFC 2822 text/plain message with RFC 2047 subject encoding for
// non-ASCII text, base64url-encodes it, and posts it to the Gmail API.
export function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function encodeSubject(subject) {
  const text = String(subject || '');
  if (/^[\x20-\x7E]*$/.test(text)) return text;
  return `=?UTF-8?B?${btoa(String.fromCharCode(...new TextEncoder().encode(text)))}?=`;
}

export async function sendGmail(service, { to, subject, body }) {
  const { accessToken } = await service.connectors.getConnection('gmail');
  const message = [
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    String(body || ''),
  ].join('\n');
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: toBase64Url(new TextEncoder().encode(message)) }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gmail send failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  return res.json();
}