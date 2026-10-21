# LOCKED HEADER RULES (owner's standing instruction — change only on explicit request)
Every page/module header (use `<PageHeader>`; never hand-build a banner):
1. Exactly 3cm tall.
2. App blue-purple-pink gradient background.
3. Black border around the outside.
4. White text with a black outline.
5. Standard body font (same as Key Personnel): bold, 1.5rem, tight letter-spacing title.
6. A short professional description under the title.
7. Directly beneath: live compliance tracker, Audit Checklist export and Audit Report button — always shown.
8. A modular icon tile (rounded square, translucent white with a soft ring) sits to the LEFT of the title and description in every header — always shown; pass the module's icon via `icon`.
9. Section/card headers follow the same gradient, 3cm, border and text rules.
Enforced in src/index.css (".app-page-header", ".dashboard-panel-header", ".app-section-card-header").
Colours follow COLOUR_RULE.md.