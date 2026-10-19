import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, Download, Loader2, RefreshCw } from 'lucide-react';
import { downloadEventAdPdf } from '@/lib/eventAdPdf';

export function AdPreview({ event }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white text-slate-900 shadow-sm">
      {event.ad_image_url && <Image src={event.ad_image_url} alt="" fittingType="fill" className="h-40 w-full object-cover" />}
      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{event.type} Advertisement</p>
        <h3 className="mt-1 text-xl font-bold leading-tight">{event.ad_headline || event.title}</h3>
        <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{event.ad_body || event.description}</p>
        {event.ad_cta && (
          <div className="mt-4 inline-block rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white">{event.ad_cta}</div>
        )}
      </div>
    </div>
  );
}

export default function EventAdBuilder({ open, onOpenChange, event, business, onSaved }) {
  const { toast } = useToast();
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [cta, setCta] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !event) return;
    setHeadline(event.ad_headline || event.title || '');
    setBody(event.ad_body || event.description || '');
    setCta(event.ad_cta || 'To RSVP or find out more, reply to this email.');
    setImageUrl(event.ad_image_url || '');
  }, [open, event]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('generateEventAdImage', { title: event.title, headline, description: body || event.description });
      if (res.data?.error) toast({ title: 'Could not generate image', description: res.data.error, variant: 'destructive' });
      else if (res.data?.url) { setImageUrl(res.data.url); toast({ title: 'Advertisement image generated' }); }
    } catch (error) {
      toast({ title: 'Could not generate image', description: error.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Event.update(event.id, { ad_headline: headline, ad_body: body, ad_cta: cta, ad_image_url: imageUrl });
      onSaved();
      onOpenChange(false);
      toast({ title: 'Advertisement saved' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>Advertisement — {event?.title}</DialogTitle></DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid content-start gap-3">
            <div className="grid gap-1.5"><Label>Headline</Label><Input value={headline} onChange={(e) => setHeadline(e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Advertisement body</Label><Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Call to action</Label><Input value={cta} onChange={(e) => setCta(e.target.value)} /></div>
            <Button variant="outline" onClick={generate} disabled={generating}>
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-amber-500" />}
              {imageUrl ? 'Regenerate image with AI' : 'Generate image with AI'}
            </Button>
            {imageUrl && (
              <div className="flex items-center gap-2">
                <Image src={imageUrl} alt="" fittingType="fill" className="h-16 w-24 rounded-lg object-cover" />
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setImageUrl('')}><RefreshCw className="h-3 w-3" />Remove</Button>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving}>Save advertisement</Button>
              <Button variant="outline" onClick={() => downloadEventAdPdf({ ...event, ad_headline: headline, ad_body: body, ad_cta: cta, ad_image_url: imageUrl }, business)}>
                <Download className="mr-2 h-4 w-4" />Download ad PDF
              </Button>
            </div>
          </div>
          <AdPreview event={{ ...event, ad_headline: headline, ad_body: body, ad_cta: cta, ad_image_url: imageUrl }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}