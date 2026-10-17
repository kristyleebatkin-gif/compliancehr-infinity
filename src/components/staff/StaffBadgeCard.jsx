import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, IdCard, Loader2 } from 'lucide-react';
import StaffBadgePreview from '@/components/safe/StaffBadgePreview';
import { getCompanyBranding } from '@/lib/companyBranding';

export default function StaffBadgeCard({ staff }) {
  const [stored, setStored] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const page = await base44.entities.FormsLibraryDocument.filter(
          { document_type: 'Staff Badge', person_name: staff?.full_name || '' },
          { sort: '-uploaded_date', limit: 1 },
        );
        if (!cancelled) setStored(page.items?.[0] || null);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [staff?.id, staff?.full_name]);

  const openBadge = async () => {
    if (!stored?.file_uri) return;
    setOpening(true);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: stored.file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      console.error(error);
    } finally {
      setOpening(false);
    }
  };

  const downloadBadge = async () => {
    if (!stored?.file_uri) return;
    setOpening(true);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: stored.file_uri });
      const a = document.createElement('a');
      a.href = signed_url;
      a.download = stored.file_name || `Staff Badge - ${staff.full_name}.pdf`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error(error);
    } finally {
      setOpening(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <IdCard className="h-4 w-4 text-primary" />Staff badge
          </div>
          {stored && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={openBadge} disabled={opening}>
                {opening ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <IdCard className="h-3.5 w-3.5" />}View badge
              </Button>
              <Button variant="outline" size="sm" onClick={downloadBadge} disabled={opening}>
                <Download className="h-3.5 w-3.5" />Download
              </Button>
            </div>
          )}
        </div>
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading…</p>
        ) : (
          <div className="flex flex-wrap items-start gap-4">
            <StaffBadgePreview branding={getCompanyBranding()} staff={staff} />
            <p className="max-w-xs text-xs text-muted-foreground">
              {stored
                ? <>This badge was created in the Company Safe on {stored.uploaded_date}. Use View or Download to open the stored PDF.</>
                : <>No badge has been created for this staff member yet. Create one from Company Safe &gt; Staff Badge Creator.</>}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}