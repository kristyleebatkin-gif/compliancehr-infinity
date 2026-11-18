import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeBlock, PanelNote, PmmEmpty } from './pmmKit';

const KIND_LABEL = {
  prisma: 'Prisma model',
  sql: 'SQL + RLS',
  openapi: 'OpenAPI',
  screen: 'Screen spec',
  test: 'Test spec',
};

/** @param {any} props */
export default function ArtefactPreview({ registers = [], entityKey = '', onEntityChange, reference = null, loading = false, error = '' } = {}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 sm:max-w-xs">
          <label htmlFor="pmm-register" className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">Register</label>
          <Select value={entityKey} onValueChange={onEntityChange}>
            <SelectTrigger id="pmm-register" className="mt-1">
              <SelectValue placeholder="Choose a register" />
            </SelectTrigger>
            <SelectContent>
              {registers.map((register) => (
                <SelectItem key={register.key} value={register.key}>
                  {register.key} · {register.domain}{register.source === 'planned' ? ' · planned' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {reference?.entity ? (
          <p className="text-[11px] leading-5 text-[#0A2B6D]/75">
            {reference.entity.key} lives in <span className="font-bold">{reference.entity.base44Entity || 'no live entity yet'}</span>
            {' '}and is {reference.entity.tenancy}.
          </p>
        ) : null}
      </div>

      <PanelNote>
        Everything below is reference output generated from the metadata. It has not been deployed, migrated or executed, and the live
        register remains authoritative.
      </PanelNote>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{error}</div> : null}
      {loading ? <PmmEmpty title="Generating reference output" body="The factory is compiling the artefacts for this register." /> : null}

      {!loading && reference?.artefacts?.length ? (
        <Tabs defaultValue="prisma">
          <TabsList className="flex flex-wrap">
            {reference.artefacts.map((artefact) => (
              <TabsTrigger key={artefact.kind} value={artefact.kind}>{KIND_LABEL[artefact.kind] || artefact.kind}</TabsTrigger>
            ))}
          </TabsList>
          {reference.artefacts.map((artefact) => (
            <TabsContent key={artefact.kind} value={artefact.kind} className="mt-2">
              <p className="mb-1 break-all font-mono text-[10px] text-[#0A2B6D]/60">{artefact.title}</p>
              <CodeBlock text={artefact.body} language={artefact.language} height="max-h-96" />
            </TabsContent>
          ))}
        </Tabs>
      ) : null}

      {!loading && !reference?.artefacts?.length && !error ? (
        <PmmEmpty title="Choose a register" body="Pick a register to see the database, API, screen and test output the factory would generate." />
      ) : null}
    </div>
  );
}