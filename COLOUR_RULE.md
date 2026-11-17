# Historical colour rule — superseded 17 November 2026

The owner's ULTIMATE_MASTER_BUILD_SPECIFICATION_V2.md now controls the design system (continuing the v1.0 palette). See the latest-authority section of COMPLIANCEHR_INFINITY_MASTER_PROMPT.md for implementation boundaries. The following is retained as historical context; existing CSS is not changed by specification adoption.

## Previous instruction
Every screen, data item, chart and section may use ONLY:
1. Bright pastel colours,
2. The exact colours of the 45 dashboard module tiles (src/components/dashboard/dashboardModuleColours.js), or
3. White.
Use `moduleKeyColour(key)` for module colours. Stray greys/blacks are remapped in src/index.css.