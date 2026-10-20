import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import SignaturePad from '@/components/documents/SignaturePad';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function BusinessContactSignature({ value = '', onChange, disabled }) {
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const legacy = value && !value.startsWith('data:image/') && !value.startsWith('private/');
  useEffect(() => {
    let alive = true;
    setError('');
    if (!value.startsWith('private/')) { setImage(value.startsWith('data:image/') ? value : ''); return; }
    setLoading(true);
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: value }).then(({ signed_url }) => {
      if (alive) setImage(signed_url);
    }).catch(() => { if (alive) setError('Could not load the saved signature. Please reload before replacing it.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [value]);
  return <div className="grid gap-1.5 sm:col-span-3">
    <Label>Business contact signature</Label>
    {legacy && <Input aria-label="Existing typed signature" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />}
    {loading ? <p className="text-xs text-muted-foreground">Loading signature...</p> : error ? <p role="alert" className="text-xs text-destructive">{error}</p> : <SignaturePad key={image ? 'saved' : 'blank'} value={image} onChange={onChange} disabled={disabled} />}
    <p className="text-xs text-muted-foreground">Use Save business details below to save the signature.</p>
  </div>;
}