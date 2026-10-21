import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Image } from '@/components/ui/image';
import { Camera, Loader2, UserRound } from 'lucide-react';
import { businessDateTime } from '@/lib/intakeCases';

export default function ProfilePhotoControl({ profile, kind, onUpdated }) {
  const { user } = useAuth();
  const [photo, setPhoto] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setPhoto('');
    if (profile.profile_photo_uri) base44.integrations.Core.CreateFileSignedUrl({ file_uri: profile.profile_photo_uri }).then(({ signed_url }) => { if (active) setPhoto(signed_url); }).catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [profile.profile_photo_uri]);
  const upload = async (file) => {
    if (!file) return;
    setUploading(true); setError('');
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { date, time } = businessDateTime();
      const changes = { profile_photo_uri: file_uri, change_log: [`${date} ${time} | Profile photo updated by ${user?.full_name || user?.email || 'Self-service'}`, profile.change_log].filter(Boolean).join('\n') };
      const updated = await base44.entities[kind === 'staff' ? 'StaffProfile' : 'ParticipantProfile'].update(profile.id, changes);
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri });
      setPhoto(signed_url);
      await onUpdated?.({ ...profile, ...changes, ...updated });
    } catch (failure) { setError(failure.message); }
    finally { setUploading(false); }
  };
  return <div className="w-24 shrink-0 text-center">
    <label className="relative mx-auto flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-primary-foreground/70 bg-primary-foreground/15">
      {photo ? <Image src={photo} alt={profile.full_name} className="h-full w-full" /> : <UserRound className="h-9 w-9" />}
      <span className="absolute inset-x-0 bottom-0 flex justify-center bg-foreground/70 py-1 text-background">{uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}</span>
      <input type="file" accept="image/*" aria-label={`Upload photo for ${profile.full_name}`} className="sr-only" disabled={uploading} onChange={(event) => { upload(event.target.files?.[0]); event.target.value = ''; }} />
    </label>
    <p className="mt-1 text-[10px]">{uploading ? 'Uploading...' : photo ? 'Change photo' : 'Add photo'}</p>
    {error && <p role="alert" className="mt-1 break-words text-[10px]">{error}</p>}
  </div>;
}