---
name: Dawwarha Civic Resource
colors:
  surface: '#f2fbf6'
  surface-dim: '#d3dcd7'
  surface-bright: '#f2fbf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf6f1'
  surface-container: '#e7f0eb'
  surface-container-high: '#e1eae5'
  surface-container-highest: '#dbe5e0'
  on-surface: '#151d1a'
  on-surface-variant: '#3f4946'
  inverse-surface: '#2a322f'
  inverse-on-surface: '#eaf3ee'
  outline: '#6f7975'
  outline-variant: '#bec9c4'
  surface-tint: '#106a5a'
  primary: '#076757'
  on-primary: '#ffffff'
  primary-container: '#2f806f'
  on-primary-container: '#ebfff7'
  inverse-primary: '#87d5c1'
  secondary: '#33685a'
  on-secondary: '#ffffff'
  secondary-container: '#b6eedc'
  on-secondary-container: '#396e5f'
  tertiary: '#834f14'
  on-tertiary: '#ffffff'
  tertiary-container: '#9f672b'
  on-tertiary-container: '#fffaf8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a3f2dd'
  primary-fixed-dim: '#87d5c1'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#005143'
  secondary-fixed: '#b6eedc'
  secondary-fixed-dim: '#9bd2c0'
  on-secondary-fixed: '#002019'
  on-secondary-fixed-variant: '#184f42'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#feb874'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3b00'
  background: '#f2fbf6'
  on-background: '#151d1a'
  surface-variant: '#dbe5e0'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 3.5rem
    fontWeight: '600'
    lineHeight: 4rem
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.005em
  headline-sm:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '500'
    lineHeight: 1.5rem
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
  label-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.02em
  code-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.125rem
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a high-trust, dual-language (Arabic/English) civic infrastructure platform dedicated to community-level resource rescue, circular logistics, and transparent redistribution. The aesthetic bridges the programmatic precision of modern developer tools with the human warmth, dependability, and clarity required of institutional civic platforms.

### Personality & Tone
- **Utilitarian Rigor:** Data-dense, structurally ordered, and free of extraneous ornamental flourishes. Interfaces communicate logistical certainty, auditability, and immediate actionable utility.
- **Civic Humanity:** Approachable and grounded; avoiding gamified mechanics, superficial confetti, or tokenized badges in favor of verified impact ledgers, factual distribution weights, and community accountability.
- **Bilingual Parity:** Engineered symmetrically for Left-to-Right (LTR) and Right-to-Left (RTL) scripts, ensuring typographical rhythm and logical flow remain pristine across English and Arabic viewports.

### Design Movement
The system implements a **Border-First Civic Minimalist** architecture. Rather than leaning on heavy drop-shadows or exaggerated blur tiers, interface boundaries rely on structural 1px low-contrast dividers, pure white surface containers set upon a muted neutral foundation, and tightly tuned typographic hierarchy.

## Colors

The color palette reinforces operational stability, institutional endurance, and ecological stewardship. Every combination adheres strictly to WCAG AA contrast ratios against pure white and canvas tokens.

### Role Allocation & Hierarchy
- **Primary (`#2F806F`):** Applied to active states, primary logistical actions, system confirmations, verified chain of custody indicators, and critical UI focus targets.
- **Secondary (`#164E41`):** Serves as deep forest anchor. Used for primary typography, authoritative headers, dense data-table rows, and institutional signifiers.
- **Tertiary (`#C98A4B`):** Warm mineral sand accent. Reserved specifically for community contribution totals, material weight audits, urgency flags, and handoff inspection states. It must never be overused for routine decoration.
- **Surface Canvas (`#F8FAF9`):** The non-intrusive backdrop color that anchors layout geometry and maintains soft contrast with active containers.
- **Surface Pure (`#FFFFFF`):** Work surfaces, interactive cards, input containers, and operational tables.
- **System Borders (`#DCE3E0`):** Crisp, structural boundaries defining all interactive blocks and layout tiers.
- **Neutral Core (`#707975`):** Secondary metadata, unit signifiers, timestamp markers, and deactivated controls.

## Typography

The typographic system is built on **Inter** (paired symmetrically with **IBM Plex Sans Arabic** in production runtimes). It enforces legibility across technical reports, matching ledgers, bilingual data entry, and mobile intake flows.

### Editorial Guidelines & Script Dynamics
- **Bilingual Font Mirroring:** When rendering Arabic strings, line heights scale systematically by 1.15× relative to Latin bounds to accommodate taller vertical ascenders and descenders without clipping.
- **Tabular Figures (`tnum`):** All numerical displays—including rescue weights (kg/tons), timestamp logs, coordinates, and batch quantities—must activate tabular numbers to ensure alignment within inspection sheets.
- **Letter Spacing:** Headlines utilize tight negative tracking (`-0.01em` to `-0.02em`) to deliver architectural solidity. Small labels use slight positive tracking (`+0.02em`) for clarity under low-lit field operations.

## Layout & Spacing

Layouts follow an 8-point base rhythm, structured across a dynamic responsive grid optimized for logistical density and operational execution.

### Grid & Breakpoints
- **Desktop (≥1200px):** 12-column fluid system, `margin: 2rem`, `gutter: 1.5rem`. Max readable application canvas is capped at 1440px to eliminate horizontal eye strain.
- **Tablet (768px – 1199px):** 8-column layout, `margin: 1.5rem`, `gutter: 1.25rem`. Complex side panels shift to stacked drawers.
- **Mobile (<768px):** 4-column layout, `margin-mobile: 1rem`, `gutter-mobile: 1rem`. Field operational inputs, camera verifications, and handover confirmations snap to full-width containers.

### Spacing Rules
- Component padding strictly scales from `space-xs` (4px) for micro badges up to `space-xl` (40px) for container grouping margins.
- Dual-direction flow: Spacing relies strictly on CSS logical properties (`margin-inline-start`, `padding-inline-end`) ensuring seamless inversion between Arabic (RTL) and English (LTR).

## Elevation & Depth

Visual hierarchy is maintained primarily via structural borders and background contrast rather than diffuse layering.

### Surface Architecture
- **Layer 0 (Canvas):** Set to `#F8FAF9`. The continuous architectural floor.
- **Layer 1 (Cards & Data Shells):** `#FFFFFF` paired with a mandatory `1px solid #DCE3E0` border.
- **Layer 2 (Overlays, Flyouts & Modals):** `#FFFFFF` with a `1px solid #DCE3E0` border, supported by an ultra-subtle contextual anchor: `box-shadow: 0 4px 16px -2px rgba(22, 78, 65, 0.06)`. Note the tinting from the secondary palette (`#164E41`), anchoring overlays within the brand palette instead of generic black.
- **Focus & Selection:** Elements do not lift outward on hover. Instead, their border transitions smoothly to `1px solid #2F806F`, accompanied by a 2px offset ring `rgba(47, 128, 111, 0.18)`.

## Shapes

The design system standardizes geometric contours to reflect civic durability and ergonomic usability.

### Corner Radius Mapping
- **Standard Structural Elements (Radius 2 / `0.5rem` / 8px):** Base controls, table blocks, code snippets, form inputs, and split-pane dividers.
- **Large Contextual Cards (`rounded-lg` / `0.875rem` / 14px):** Primary work cards, rescue lot profiles, route modules, and modal containers. This 14px outer radius delivers the distinctive civic-utility curve without compromising data density.
- **Pill Indicators (`9999px`):** Strict convention reserved for interactive chips, chain-of-custody status tags, metric units, and user avatars.

## Components

### Buttons
- **Primary:** Background `#2F806F`, text `#FFFFFF`, border `1px solid transparent`, corner radius `0.5rem`. Hover state transitions to `#164E41`. Active state engages a slight inset scale (`0.99`).
- **Secondary / Outline:** Background `#FFFFFF`, text `#164E41`, border `1px solid #DCE3E0`. Hover introduces `#F8FAF9` background and `#2F806F` border.
- **Subtle Tertiary:** Background transparent, text `#2F806F`. Hover background `rgba(47, 128, 111, 0.08)`.

### Form Inputs & Text Fields
- **Container:** Height 40px (desktop), 44px (mobile touch targets). Background `#FFFFFF`, border `1px solid #DCE3E0`, radius `0.5rem`.
- **States:** Focus replaces border with `#2F806F` and an outer halo of `3px rgba(47, 128, 111, 0.12)`. Invalid entries shift border to `#C94B4B` with neutral helper text.
- **Prefix / Suffix Elements:** Tabular units (e.g., `kg`, `boxes`, `SAR`, `EGP`) are docked with `#707975` text and separated by an internal vertical `#DCE3E0` border.

### Badges & Status Chips
- Height 24px, pill-shaped (`border-radius: 9999px`), padding `0 10px`, font `label-sm`.
- **Pending Matching:** Background `rgba(201, 138, 75, 0.12)`, text `#C98A4B`, border `1px solid rgba(201, 138, 75, 0.3)`.
- **Custody Verified / Collected:** Background `rgba(47, 128, 111, 0.10)`, text `#2F806F`, border `1px solid rgba(47, 128, 111, 0.25)`.
- **System Archived:** Background `rgba(112, 121, 117, 0.08)`, text `#707975`, border `1px solid #DCE3E0`.

### Cards & Work Units
- **Base Style:** `#FFFFFF` fill, `1px solid #DCE3E0`, `border-radius: 14px` (`0.875rem`).
- Internal layout follows strict vertical compartmentalization: header metadata separated by subtle 1px dividers, middle payload data grid, and bottom action footer.

### Lists & Audit Tables
- Headers set to `#707975`, uppercase, `label-sm`.
- Rows use `#FFFFFF` with `1px solid #DCE3E0` bottom border. Hover state renders background `#F8FAF9`. All weights, quantities, and times utilize tabular numbering.

### Civic-Specific Modules
- **Transparent Match Breakdown:** A dual-column card displaying provider specs on one side and recipient capacity on the other, bridged by an audit status pill showing variance delta (e.g., `Δ 0.0% variance`).
- **Two-Sided Handover Verification:** Dual confirmation slot featuring counterpart confirmation timestamps, geolocation hash preview, and dual signature state markers.