# ComplianceHR Infinity — Canonical Master Design Template Specification

Saved per owner specification (3 Nov 2026). The **Navigator Router Remote (`ObsidianSidebarRemote` / `ObsidianSmartRemote`)** and **Quick App Bar (`QuickAppBar`)** serve as the canonical design samples for modular navigation and remote surfaces.

---

## 1. Brand Logo Lockup & Top Header Area (`BrandLogoLockup.jsx` & `AppLayout.jsx`)
- **Logo Placement & Count**:
  - Displayed at the **very top only** (1 logo per page across the app, **except Dashboard and Landing Page**, which each have **2 logos**: 1 in the top header and 1 matching in the footer).
  - Never duplicate the logo inside sub-bars, tabs, or inner module cards on standard pages.
- **3-Line Centred Stack inside ONE App-Design Gradient Border**:
  1. **Line 1 (Top — Logo)**: Approx. **3 cm** tall (`~3cm` height, `object-contain`), centred on its own line.
  2. **Line 2 (Middle — Business Name)**: Single line (`whitespace-nowrap`), centred, sized proportionally to the logo (`ComplianceHR Infinity`), starting in **Dark Blue (`#0A2B6D`)** and transitioning smoothly into the **App Design Colours (`#0072FF → #5A00D6 → #A100FF → #FF2E9A`)** towards the end.
  3. **Line 3 (Bottom — Slogan)**: Single line (`whitespace-nowrap`), centred, slightly smaller than the business name and **almost lining up on each end with `ComplianceHR Infinity` (just slightly longer)**, coloured in:
     - Medium Blue (`#0072FF`): `Complete Control.`
     - Purple (`#5A00D6`): `Greater Confidence.`
     - Pink (`#FF2E9A`): `Brighter Success.`
- **Border & Backgrounds**:
  - All three lines are enclosed inside **one single border** in the **App Design Gradient Colours** (`#00C6FF → #0072FF → #5A00D6 → #FF2E9A`).
  - Inside the border behind the writing: **White (`#FFFFFF`)**.
  - **Outside the border to the side of the page (in the Top Logo Area ONLY)**: **White (`#FFFFFF`)**.

---

## 2. Page & Section Header Area (`PageHeader.jsx`)
- **Outer Border & Surround**:
  - Separated by an **App Design Coloured Gradient Border**.
  - **Outside the header border to the side of the page**: **Dark Navy (`#0A2B6D`)**.
  - **Inside the header / topic section (outside the small tiles up to the header border)**: **White (`#FFFFFF`)**.
- **Main Header Title & Small Header Tiles**:
  - Main header title uses **Dark Blue (`#0A2B6D`) writing changing into App Design Colours**, with an **App Design Coloured Symbol** and **App Design Coloured Border** on a **White background**.
  - Every small title / control pill in the header section is neatly sized in 1–2 rows with an **App Design Coloured Border**, **Dark Blue (`#0A2B6D`) writing**, and **App Design Coloured Symbols** on a **White background** (with special primary/highlight pills using an **App Design Coloured Gradient background**).

---

## 3. Quick App Bar, Navigation Router Remote & Modular Visual Tiles
- **Remote Control + Command Centre + Glassmorphism Aesthetic**:
  - Combines **Netflix elegance + Apple polish + Enterprise professionalism + Touch-screen usability**.
  - **Quick App Bar Vertical Height**: Must not exceed **5 cm** (`max-height: 5cm` in its resting bar state), with all tiles in the same area sharing a consistent compact size.
  - **Surround & Chassis**: Dark Navy background (`#0A2B6D` / `linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)`) between the tiles and to the side of the page.
  - **Modular Tile Anatomy**:
    - **Border**: Rounded remote button border in **Blue → Purple → Pink gradient** (`#0072FF → #5A00D6 → #FF2E9A`).
    - **Illumination**: LED active glow + live status indicator dot (`LIVE` / `ACTIVE` / `ON`) on every module.
    - **Top Title Strip**: Framed with an app-design border on white, **App Design Coloured Symbol**, and **Dark Blue (`#0A2B6D`) heading changing into App Design Colours** — sized **slightly larger** than the white writing below.
    - **Bottom Body**: Dark Navy glassmorphic surface with crisp **White writing (`#FFFFFF`)** where every word fits cleanly inside its border.

---

## 4. Module Sections, Subject Cards & Small Data Tiles (`SectionCard.jsx`)
- **Section Ordering**:
  - Top of workspace: **Quick App Bar → Section Name & Header → Dashboard & Most Relatable Subjects/Dashboards**.
- **Section Background & Surround**:
  - Most content sections (except the Remote Router, Quick App Bar, and illuminated modular tile matrices) have a **White background (`#FFFFFF`)** inside up to their **App Design Coloured Border**, and **Dark Navy (`#0A2B6D`)** outside the border to the wall/side of the page.
  - Every module sub-section has a **unique subject/title pill** with **White writing (`#FFFFFF`)** and **App Design Coloured background and border**.
  - **Small Tiles inside Sections**: Fit neatly in **1 or 2 rows** within their section, with **consistent button/tile sizes**, **Dark Blue (`#0A2B6D`) writing on a White background with an App Design Colour border** (or highlighted with App Design Colour backgrounds), and generous enterprise spacing so every word fits cleanly inside its border.