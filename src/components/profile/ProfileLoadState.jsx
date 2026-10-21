import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileLoadError from '@/components/profile/ProfileLoadError';

export default function ProfileLoadState({ loading, error, backTo, label, message, onRetry }) {
  if (loading) return <div className="flex justify-center py-16" role="status" aria-label="Loading profile"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  return (
    <div className="space-y-4 py-16 text-center">
      {error && !message ? <ProfileLoadError error={error} onRetry={onRetry} /> : <p className="text-muted-foreground">{message || 'Profile not found.'}</p>}
      <Button variant="outline" asChild><Link to={backTo}><ArrowLeft className="h-4 w-4" />Back to {label}</Link></Button>
    </div>
  );
}