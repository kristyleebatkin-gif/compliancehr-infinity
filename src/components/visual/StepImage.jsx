import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';

// Renders a privately-uploaded routine picture via a short-lived signed URL.
export default function StepImage({ uri, className = 'h-14 w-14 rounded-lg' }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    let alive = true;
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri })
      .then(({ signed_url }) => { if (alive) setUrl(signed_url); })
      .catch(() => {});
    return () => { alive = false; };
  }, [uri]);

  if (!url) return <div className={`${className} animate-pulse bg-muted`} />;
  return <Image src={url} alt="Step picture" className={className} fittingType="fill" />;
}