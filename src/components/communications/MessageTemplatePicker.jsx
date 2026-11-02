import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search } from 'lucide-react';
import { MESSAGE_TEMPLATES, TEMPLATE_TOKEN_LABELS, extractTemplateTokens, fillTemplate } from '@/lib/messageTemplates';
import { loadCompanyBranding } from '@/lib/companyBranding';

export default function MessageTemplatePicker({ open, onOpenChange, onSelect, initialTemplate }) {
  const [search, setSearch] = useState('');
  const [template, setTemplate] = useState(null);
  const [values, setValues] = useState({});

  const templates = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return MESSAGE_TEMPLATES;
    return MESSAGE_TEMPLATES.filter((t) => `${t.name} ${t.subject} ${t.category}`.toLowerCase().includes(term));
  }, [search]);

  useEffect(() => {
    if (!open) return;
    if (initialTemplate) {
      openTemplate(initialTemplate);
    } else {
      setTemplate(null);
    }
    // Prefill name/company tokens once when the picker opens.
    (async () => {
      const defaults = {};
      try {
        const me = await base44.auth.me();
        if (me?.full_name) defaults.sender_name = me.full_name;
      } catch { /* not critical */ }
      try {
        const branding = await loadCompanyBranding();
        if (branding?.companyName) defaults.company_name = branding.companyName;
      } catch { /* not critical */ }
      setValues((v) => ({ ...defaults, ...v }));
    })();
  }, [open, initialTemplate]);

  const openTemplate = (t) => {
    const tokens = extractTemplateTokens(`${t.subject}\n${t.body}`);
    const defaults = {};
    tokens.forEach((token) => {
      if (token === 'sender_name' || token === 'company_name') defaults[token] = values[token] || '';
    });
    setTemplate(t);
    setValues(defaults);
  };

  const tokens = template ? extractTemplateTokens(`${template.subject}\n${template.body}`) : [];
  const filledSubject = template ? fillTemplate(template.subject, values) : '';
  const filledBody = template ? fillTemplate(template.body, values) : '';

  const apply = () => {
    onSelect({ ...template, subject: filledSubject, body: filledBody });
    onOpenChange(false);
    setTemplate(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {template && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setTemplate(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {template ? 'Fill in details' : 'Message template library'}
          </DialogTitle>
        </DialogHeader>

        {!template && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates" className="pl-8" />
            </div>
            <div className="space-y-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => openTemplate(t)}
                  className="w-full rounded-xl border border-border/60 bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{t.name}</span>
                    <Badge variant="secondary" className="shrink-0">{t.category}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.body.split('\n')[0]}</p>
                </button>
              ))}
              {templates.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No templates match your search.</p>}
            </div>
          </div>
        )}

        {template && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
              <p className="text-sm font-semibold">{template.name}</p>
            </div>
            {tokens.map((token) => (
              <div key={token} className="grid gap-1.5">
                <Label>{TEMPLATE_TOKEN_LABELS[token] || token}</Label>
                <Input value={values[token] || ''} onChange={(e) => setValues((v) => ({ ...v, [token]: e.target.value }))} />
              </div>
            ))}
            <div className="grid gap-1.5 rounded-xl border border-border/60 bg-card p-3">
              <p className="text-xs font-semibold text-muted-foreground">Preview</p>
              <p className="text-sm font-medium">{filledSubject || '(empty subject)'}</p>
              <p className="whitespace-pre-wrap text-xs text-muted-foreground">{filledBody}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={apply}>Use this message</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}