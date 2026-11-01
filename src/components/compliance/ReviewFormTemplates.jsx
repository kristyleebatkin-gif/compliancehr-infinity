import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/ui/use-toast';
import { statusTone } from '@/lib/statusStyles';
import { base44 } from '@/api/base44Client';
import { Copy, FilePlus, Pencil, Plus, Trash2, Wand2 } from 'lucide-react';
import TemplateEditorDialog from '@/components/compliance/TemplateEditorDialog';
import TemplateGenerateDialog from '@/components/compliance/TemplateGenerateDialog';

const MANAGER_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'];

// Review form templates: a template library for compliance documents so
// standard review forms are generated in one click instead of from scratch.
export default function ReviewFormTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState(null);
  const [canManage, setCanManage] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [generating, setGenerating] = useState(null);

  const load = async () => {
    const page = await base44.entities.FormTemplate.filter({ status: { $ne: 'Archived' } }, { sort: '-created_date', limit: 100 });
    setTemplates(page.items || []);
  };

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        setCanManage(MANAGER_ROLES.includes(user?.role) || user?.role === 'admin');
      } catch { /* read-only visitors */ }
      await load();
    })();
  }, []);

  const duplicate = async (tpl) => {
    await base44.entities.FormTemplate.create({
      title: `${tpl.title} (copy)`,
      category: tpl.category,
      description: tpl.description || '',
      instructions: tpl.instructions || '',
      fields_schema: tpl.fields_schema || '[]',
      status: 'Draft',
      created_by: tpl.created_by || '',
    });
    toast({ title: 'Template duplicated', description: `${tpl.title} (copy)` });
    load();
  };

  const remove = async (tpl) => {
    if (!window.confirm(`Archive the "${tpl.title}" template? Generated forms already created are unaffected.`)) return;
    await base44.entities.FormTemplate.update(tpl.id, { status: 'Archived' });
    toast({ title: 'Template archived', description: tpl.title });
    load();
  };

  if (!templates) {
    return <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-muted/60" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Standard compliance review forms as reusable templates. Generate a branded blank or completed PDF in one click.
        </p>
        {canManage && (
          <Button onClick={() => { setEditing(null); setEditorOpen(true); }}>
            <Plus className="h-4 w-4" /> New template
          </Button>
        )}
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={Wand2}
          title="No review form templates yet"
          message="Create your first template, or duplicate a starter template, to generate standard review forms in one click."
          action={canManage ? { label: 'New template', onClick: () => { setEditing(null); setEditorOpen(true); } } : null}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((tpl) => {
            let count = 0;
            try { count = JSON.parse(tpl.fields_schema || '[]').length; } catch { count = 0; }
            return (
              <Card key={tpl.id} className="flex flex-col shadow-md">
                <CardContent className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-bold">{tpl.title}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{count} field{count === 1 ? '' : 's'} · v{tpl.version || '1.0'}</p>
                    </div>
                    <Badge className={statusTone(tpl.status)}>{tpl.status}</Badge>
                  </div>
                  {tpl.description && <p className="line-clamp-2 text-xs text-foreground/60">{tpl.description}</p>}
                  <Badge variant="secondary" className="w-fit text-[11px]">{tpl.category}</Badge>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <Button size="sm" onClick={() => setGenerating(tpl)}>
                      <FilePlus className="h-4 w-4" /> Generate form
                    </Button>
                    {canManage && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => { setEditing(tpl); setEditorOpen(true); }}>
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => duplicate(tpl)}>
                          <Copy className="h-4 w-4" /> Duplicate
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(tpl)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <TemplateEditorDialog open={editorOpen} onOpenChange={setEditorOpen} template={editing} onSaved={load} />
      <TemplateGenerateDialog template={generating} open={!!generating} onOpenChange={(o) => !o && setGenerating(null)} />
    </div>
  );
}