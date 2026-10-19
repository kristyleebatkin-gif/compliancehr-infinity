import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image } from '@/components/ui/image';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Photo-annotated incident evidence: private photo uploads with captions,
// shown as thumbnails signed on demand.
export default function IncidentPhotos({ incident, editable, onChanged }) {
  const photos = Array.isArray(incident.photo_uris) ? incident.photo_uris : [];
  const captions = Array.isArray(incident.photo_captions) ? incident.photo_captions : [];
  const [busy, setBusy] = useState(false);
  const [signed, setSigned] = useState({});
  const { toast } = useToast();
  const photoKey = photos.join('|');

  useEffect(() => {
    let live = true;
    (async () => {
      const map = {};
      for (const uri of photos) {
        try {
          const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 });
          map[uri] = signed_url;
        } catch (error) { console.error(error); }
      }
      if (live) setSigned(map);
    })();
    return () => { live = false; };
  }, [photoKey]);

  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const uris = [];
      for (const file of files) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        uris.push(file_uri);
      }
      await base44.entities.Incident.update(incident.id, { photo_uris: [...photos, ...uris], photo_captions: [...captions, ...uris.map(() => '')] });
      toast({ title: 'Photos attached', description: `${uris.length} photo${uris.length === 1 ? '' : 's'} added to this incident` });
      await onChanged();
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  const removePhoto = async (index) => {
    await base44.entities.Incident.update(incident.id, {
      photo_uris: photos.filter((_, i) => i !== index),
      photo_captions: captions.filter((_, i) => i !== index),
    });
    await onChanged();
  };

  const saveCaption = async (index, value) => {
    const next = [...captions];
    while (next.length < photos.length) next.push('');
    next[index] = value;
    await base44.entities.Incident.update(incident.id, { photo_captions: next });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">Photo evidence</h3>
          <p className="text-sm text-muted-foreground">Scene and supporting photos attached to this incident (stored privately).</p>
        </div>
        {editable && (
          <Button variant="outline" size="sm" disabled={busy}>
            <label className="flex cursor-pointer items-center gap-1.5">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Add photos
              <input type="file" accept="image/*" multiple className="hidden" onChange={upload} />
            </label>
          </Button>
        )}
      </div>
      {photos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 py-6 text-center text-sm text-muted-foreground">No photos attached yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((uri, index) => (
            <div key={uri} className="space-y-1.5 rounded-xl border border-border/60 p-2">
              <div className="relative overflow-hidden rounded-lg">
                {signed[uri] ? (
                  <Image src={signed[uri]} alt={captions[index] || `Incident photo ${index + 1}`} className="h-36 w-full" fittingType="fill" />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-muted/40"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                )}
                {editable && (
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 shadow hover:bg-white"
                    title="Remove photo"
                  ><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                )}
              </div>
              {editable ? (
                <Input
                  className="h-8 text-xs"
                  placeholder="Caption"
                  defaultValue={captions[index] || ''}
                  onBlur={(e) => saveCaption(index, e.target.value)}
                />
              ) : (
                captions[index] && <p className="text-xs text-muted-foreground">{captions[index]}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}