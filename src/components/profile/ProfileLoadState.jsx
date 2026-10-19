import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfileLoadState({ loading, error, backTo, label }) {
  if (loading) return <div className="flex justify-center py-16" role="status" aria-label="Loading profile"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  return (
    <div className="space-y-4 py-16 text-center">
      <p className="text-muted-foreground">{error ? 'This profile could not be loaded. Please try again or check your access.' : 'Profile not found.'}</p>
      <Button variant="outline" asChild><Link to={backTo}><ArrowLeft className="h-4 w-4" />Back to {label}</Link></Button>
    </div>
  );
}