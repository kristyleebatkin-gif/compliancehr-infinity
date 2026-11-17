# Studio-to-main source integration — 17 November 2026 (Australia/Brisbane)

## Scope and provenance

User authorised bringing studio-save-to-app into main. Base44's connector has no native
branch-merge operation and disallows Git-history writes. Browser merge controls remained
behind declined secure sign-in requests. This session instead integrated the branch's
reviewed file changes through supported Base44 file edits. This is a SOURCE INTEGRATION,
not a Git merge commit or a change to the source branch's status.

App: 6ac9f91f0d82b1f80ec6a25f
Target: main
Source branch: studio-save-to-app / 6af3a071af0b91905fb3c952
Source head: bef743b5c01d1605d16cc1c683a730e24944174a
Source comparison base: f281b7c41c705e23c1c3e1603107cae0c4d0d99e
Target before source: 51412244a0cd251849ac4acc1f572b9f771f942e
Before checkpoint: 6afbb57a74dd9ff24fd6112d

All eight existing application files touched by the source branch matched its base on
main before integration. Three additional source files were absent. The source SDK
upgrade to ^0.8.62 was already present on main; no package or lockfile downgrade applied.
The combined 36-step master specification was checked unchanged byte-for-byte.

## Integrated

- Database-backed workbench designs, document drafts, meeting notes, assistant chats
  and personal CRM notes.
- Studio documents/filed designs panel inside existing Documents page.
- Existing Today/Team Leader workbench launch points and routes retained.
- Private PNG filing from Design Studio; existing private-file adapters retained.
- New StudioItem classified business-owned in identical frontend/backend catalogues.

## Adaptations required during integration

- Removed source administrator-wide access. RLS requires same created_by_id and tenant,
  active account and access approval. Hard deletion is service-only; UI removal archives.
- Queries and creates include explicit owner/business scope. Responses, malformed data,
  display caps and scope changes fail visibly rather than reporting successful empty data.
- Arbitrary extra fields cannot override owner, tenant or retention.
- Legacy unscoped browser content is NOT imported, deleted or marked migrated on opening.
  Existing browser saves remain untouched. Reviewed, identity-attributed legacy import
  remains open; cross-device access to those legacy copies is not claimed.
- Removed automatic seven-year retention promise. Retention requires organisation policy.
- Simple document HTML is allowlisted before saving and on reading. Active content,
  embedded resources, event handlers and attributes are stripped.
- Workbench/document panel state remounts when identity/business/access scope changes.
- Document/CRM pending saves flush on close; documents provide Save now and honest status.
  Removing designs/documents/meetings only updates the visible list after archive succeeds.

## Verification actually run

- npm run ci:verify PASSED: lint, complete JavaScript suite, 148 Deno tests, Vite build.
  Nine new JavaScript behavioural tests cover denial-before-read, query scoping,
  SDK response shapes, foreign/malformed results, late identity changes, scope stamping,
  override denial, owner validation, soft archive, display bounds and HTML safety.
- Targeted studio + tenant suite: 24 passed / 0 failed.
- npm run typecheck PASSED in existing configured scope.
- After pending-save UI fixes, lint, typecheck and build PASSED again.
- Tenant RLS checker: Would lock 0 entities.
- Frontend/backend tenant classifications identical.
- Combined controlling master preserved verbatim.
- git diff --check clean.

These are source/unit/build checks. Schema-rule evaluator tests do not prove hosted
Base44 access enforcement. No authenticated browser UAT, actual two-user/two-business
API test, file-upload test, browser recording test, device test, concurrent-edit stress
test or restore rehearsal was performed. No production data migration or publication.
The source branch remains intact and active; a future native merge must review these
already-integrated files rather than blindly reapply its older security/migration code.

## Remaining acceptance

1. Verify hosted StudioItem owner/tenant/approval denials with separate real test users.
2. Verify create/edit/archive/reopen, failure handling and private file access in signed-in UAT.
3. Verify iPhone/iPad/macOS workbench recording, editor and downloads.
4. Provide reviewed legacy import with trustworthy account/business attribution.
5. Apply approved retention/legal-hold policy; no fixed retention compliance claim.
6. Verify concurrent editing, interrupted/failed saves and browser-close recovery.
7. Review wider existing AI/transcription/upload authorisation and production release gates.

Final named checkpoint is created after this report and MASTER_TODO entry.
