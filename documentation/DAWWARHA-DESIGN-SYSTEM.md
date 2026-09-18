# Dawwarha Design System

*دورها — Turning unused resources into community impact.*

Version 1.0 · Derived from **Dawwarha — Product Brief v1.0** · Prepared as the authoritative UI source of truth for the Dawwarha team and for AI coding agents (e.g. Antigravity) implementing the Angular + Tailwind frontend.

---

## 1. Introduction

### What this document is

The Dawwarha Design System is the single specification for how the Dawwarha product looks, behaves, and communicates across every screen, role, and platform. It defines design tokens, primitive and composite components, domain-specific patterns, page templates, and the rules for combining them.

### Why it exists

Dawwarha is built by a small team (four backend engineers plus a frontend/Angular implementation) working in parallel across Identity, Supply, Demand & Matching, and Transfer/Trust/Impact domains, with AI coding agents assisting implementation. Without a shared visual contract, four people (and an AI agent) building four domains in parallel will produce four different products stitched together. This document is that shared contract.

### Who should use it

- Frontend engineers implementing Angular components and pages.
- AI coding agents (e.g. Antigravity) generating or modifying UI code.
- Designers reviewing or extending the visual language.
- Backend engineers who need to understand what states, statuses, and error shapes the UI expects (see the Backend Implementation Plan and Product Brief for the underlying contracts this document visualizes).

### What it controls

Design tokens (color, type, spacing, radius, elevation, motion), primitive UI components, domain components (ResourceCard, MatchCard, etc.), page templates, navigation structure, responsive behavior, accessibility requirements, and RTL/LTR handling.

### What it does not control

Business logic, API contracts, database schema, matching algorithm weights, or backend validation rules. Those live in the Product Brief and the Backend/MongoDB Implementation Plans. Where this document references a workflow (e.g. the resource lifecycle), it visualizes a rule defined elsewhere — it does not redefine it.

### Source of truth rules

1. The **Product Brief** is the authoritative source for product functionality, workflows, lifecycle states, roles, and requirements.
2. This document is authoritative for **visual and UI implementation** — how those workflows are presented, not what they are.
3. Where the Product Brief does not explicitly define a visual detail, this document makes a reasonable design-system decision. Every such decision is explicitly labeled:

> **Design System Decision:** *[decision and rationale]*

4. This document never invents functionality that conflicts with the Product Brief. If a conflict is discovered during implementation, the Product Brief wins, and this document is updated.

This document is **authoritative for UI implementation**. An AI coding agent or engineer building a Dawwarha screen should not need to make an independent visual decision — if a decision is needed and not covered here, the correct action is documented in Section 49.

---

## 2. Design Principles

### 2.1 Clarity over decoration

Every screen must answer two questions at a glance: **What can I do here?** and **What happens when I do it?** Decoration that does not help answer these questions is removed, not added "for polish."

### 2.2 Information hierarchy

Important information visually dominates secondary information through size, weight, and position — not color alone. On a Resource Card, category and quantity must be more visually prominent than the description text, because those are the facts a user needs to decide relevance (Product Brief, Section 23).

### 2.3 Human warmth

Dawwarha is community-oriented, not corporate. Warmth comes from tone of voice, the Warm Sand accent, generous whitespace, and plain language — never from cartoon illustration, excessive emoji, or forced playfulness. The platform coordinates real transfers between real people; it should feel as trustworthy as it feels welcoming.

### 2.4 Trust through transparency

Verification badges, match scores, handover status, and report status must always show *why*, not just *what*. A "92% Match" without a visible breakdown is not acceptable anywhere in the product (see Section 23–24).

### 2.5 Progressive disclosure

Show what's needed for the current decision; defer detail. A Resource Card shows category, quantity, location, and availability up front; full description and metadata are one interaction away.

### 2.6 Accessibility by default

Accessibility is not a pass at the end — it is part of every component's contract (see Section 32). A component that fails its accessibility requirements is not complete, regardless of how it looks.

### 2.7 Consistency over novelty

Reuse an existing pattern before inventing a new one. A new visual pattern is a last resort, and when introduced, must be documented here (see Section 49, "AI Implementation Rules").

### 2.8 Mobile-first practicality

Dawwarha's users publish and browse listings from their phones as often as from a desktop. Every component is designed mobile-first and enhanced upward, never designed desktop-first and shrunk down.

---

## 3. Brand / Visual Identity

### Brand personality

Calm, capable, and community-rooted. Dawwarha behaves like a trustworthy neighbor who happens to be well organized — not like a startup dashboard, not like an NGO pamphlet.

### Visual mood

Grounded and precise, warmed by sand and earth tones against a structured green-and-neutral system. The mood is closer to a well-run civic office than a marketplace: quiet confidence rather than urgency-driven marketplace energy (no countdown timers, no "only 2 left" pressure tactics — urgency in Dawwarha is a matching signal, not a sales device).

### Shape language

Soft-cornered rectangles (10–14px radius) throughout for cards, inputs, and containers, with fully rounded (`9999px`) elements reserved for badges, avatars, and pills. No sharp corners, no heavy skeuomorphic shapes.

### Density

Medium density by default; the Admin shell (Section 40) is permitted higher density because its users are trained operators optimizing for throughput, while public and user-facing screens stay generously spaced to keep first-time users comfortable.

### Contrast

Primarily low-contrast, border-first surfaces (Section 14) with contrast reserved for meaningful moments: primary actions, status badges, and match scores. High-contrast is a signal, not a default treatment.

### Whitespace

Whitespace is used to establish hierarchy and group related information — never purely decorative padding. A card's internal spacing should make its own anatomy legible without needing a border to separate every element.

### Visual rhythm

A consistent 8px-based rhythm (Section 10) runs through spacing, and a consistent type scale (Section 9) runs through headings, so that any two Dawwarha screens feel like they came from the same hand even if built by different engineers or an AI agent.

### Image usage

Photography (where used, e.g. resource images uploaded by providers) is shown in real aspect ratios inside rounded containers, never stretched or forced into decorative crops.

### Illustration usage

Minimal. Empty states may use small, simple line-style icons (Lucide, Section 16) rather than custom illustrations. Per the Product Brief's own product direction, this avoids a "cartoonish NGO aesthetic."

### Iconography

A single icon family throughout — see Section 16.

**Visual personality statement:** *Dawwarha looks like infrastructure you can trust with a real transfer between real people: structured like modern SaaS, warmed like a community bulletin board that's actually well organized.*

---

## 4. Color System

### Design philosophy

Components reference **semantic tokens**, never raw hex values. Raw hex values are defined once, in Section 46's token reference, and mapped to semantic roles here. This is the same rule stated in Section 43 for Tailwind: `bg-primary`, never `bg-[#164E41]`.

### Primary Green — trust & action

| Token | Hex | Purpose | Use | Avoid |
|---|---|---|---|---|
| `--color-primary-900` | `#164E41` | Deepest brand green | Dark-mode surfaces, high-emphasis text on light backgrounds | Body text at small sizes (too heavy) |
| `--color-primary-800` | `#1B5E50` | Primary hover/active depth | Button active state | Large fills |
| `--color-primary-700` | `#237361` | Primary active | Pressed button state, active nav indicator | — |
| `--color-primary-600` | `#2F806F` | **`--color-primary`** — core brand action color | Primary buttons, links, active states, verified badge | Large background fills (too saturated at scale) |
| `--color-primary-500` | `#3F9582` | Primary hover | Button/link hover state | Text (contrast risk on light bg) |
| `--color-primary-100` | `#DCEFEA` | Primary tint | Selected filter chips, subtle highlight backgrounds | Body copy background under long text |
| `--color-primary-50` | `#F0F8F6` | Faintest tint | Page section backgrounds, hover rows | — |

Primary green carries the platform's core actions (publish, accept match, confirm handover) and its trust signals (verified badge). It must never be used for destructive or warning actions.

### Warm Sand — human warmth accent

| Token | Hex | Purpose | Use | Avoid |
|---|---|---|---|---|
| `--color-sand-700` | `#9A6538` | Deepest sand | Small accent text/icons only | Large fills, buttons (not an action color) |
| `--color-sand-600` | `#B87942` | Mid sand | Decorative accents, illustration line color | Primary/secondary actions |
| `--color-sand-500` | `#C98A4B` | Core sand accent | Contribution/impact highlights, warm accent borders | Status communication (not semantic) |
| `--color-sand-100` | `#F5E8D8` | Sand tint | Impact card backgrounds, warm highlight panels | Default surface (reserve for warmth moments) |
| `--color-sand-50` | `#FBF6F0` | Faintest sand tint | Subtle section backgrounds for Impact/Contribution areas | — |

**Design System Decision:** Warm Sand is reserved specifically for Impact, Contribution, and community-recognition moments (Sections 39, 21–25's "additional metadata" for impact). It is the platform's "warmth" register and must not be used for ordinary UI chrome, or it stops being distinctive.

### Neutral — structure

| Token | Hex | Purpose | Use | Avoid |
|---|---|---|---|---|
| `--color-neutral-900` | `#17211E` | Primary text | `--color-text-primary` | Backgrounds |
| `--color-neutral-700` | `#394640` | Secondary text | `--color-text-secondary` | Primary headings |
| `--color-neutral-500` | `#66756F` | Muted text | `--color-text-muted`, placeholder text | Body copy |
| `--color-neutral-300` | `#8A9792` | Disabled content, dividers on dark surfaces | Disabled text | Standard borders (too light for AA on white) |
| `--color-neutral-200` | `#DCE3E0` | `--color-border` | Card borders, input borders, dividers | Text |
| `--color-neutral-100` | `#F2F5F3` | `--color-surface-muted` | Muted panels, table stripe, disabled input background | Primary card surface |
| `--color-neutral-50` | `#F8FAF9` | `--color-background` | App/page background | Card surface (needs contrast from page bg) |
| `--color-neutral-0` | `#FFFFFF` | `--color-surface` | Card, modal, input surface | Page background (use `--color-background` instead so cards read as elevated) |

### Semantic tokens

| Token | Hex | Purpose | Light-mode behavior | Dark-mode consideration |
|---|---|---|---|---|
| `--color-success` | `#27845F` | Completed, verified, published, available | Text/icon on light bg; `--color-success-bg` tint at 10% for badge fills | Increase lightness ~8% to maintain AA on dark surfaces |
| `--color-warning` | `#B7791F` | Pending, urgent (medium), in-review | Same pattern as success | Same pattern |
| `--color-danger` | `#C94A4A` | Rejected, suspended, reported, destructive actions, high urgency | Same pattern | Same pattern |
| `--color-info` | `#3978A8` | Informational banners, neutral status (draft, matched) | Same pattern | Same pattern |

**Design System Decision:** Every semantic color gets a paired `-bg` tint token (e.g. `--color-success-bg`) at low opacity for badge and banner fills, generated programmatically at 8–12% opacity of the base token rather than hand-picked, to guarantee consistency across all four semantic colors.

### Contrast expectations

All text/background pairings used in components must meet **WCAG 2.2 AA** (4.5:1 for body text, 3:1 for large text ≥24px/19px bold, 3:1 for UI component boundaries). `--color-primary-600` on `--color-surface` passes AA for large text and UI elements but not small body text — use `--color-primary-800` for small primary-colored text on white.

### Dark mode

**Design System Decision:** Dark mode is not in the MVP scope defined by the Product Brief (Section 31). The token architecture is dark-mode-ready (semantic tokens map to different raw values per theme) so it can be added later without restructuring components, but no dark theme is shipped in v1.0 of this system.

---

## 5. Typography

### Typefaces

| Script | Typeface | Rationale |
|---|---|---|
| Latin (English) | **Inter** | Neutral, highly legible at small sizes, wide weight range, free/open |
| Arabic | **IBM Plex Sans Arabic** | Designed as a genuine pairing partner for Inter-style Latin faces; consistent x-height and weight mapping avoids the Arabic text "feeling like an afterthought" |

Both are loaded as variable or static web fonts with `font-display: swap`. System font fallback stack: `Inter, -apple-system, "Segoe UI", sans-serif` (Latin) / `"IBM Plex Sans Arabic", Tahoma, sans-serif` (Arabic).

### Type scale

| Role | Size / Line height | Weight | Letter spacing | Use |
|---|---|---|---|---|
| Display | 48 / 56 | 700 | -0.02em | Landing hero only |
| H1 | 36 / 44 | 700 | -0.01em | Page titles |
| H2 | 28 / 36 | 600 | -0.01em | Section headings |
| H3 | 22 / 30 | 600 | 0 | Card group headings, dialog titles |
| Body | 16 / 24 | 400 | 0 | Default body copy |
| Body Small | 14 / 20 | 400 | 0 | Secondary text, metadata rows |
| Caption | 12 / 18 | 500 | 0.01em | Timestamps, helper text, badge labels |
| Label | 14 / 20 | 600 | 0 | Form labels, table headers |
| Button | 14 / 20 (sm) · 16 / 24 (md/lg) | 600 | 0 | Button text |

### Arabic typography rules

- Arabic body text is rendered 1–2px larger than the equivalent Latin size at Body and below, since Plex Sans Arabic's default metrics read slightly smaller at matched pixel size — implemented via a `[dir="rtl"]` scale adjustment on the `--font-size-body*` tokens, not per-component overrides.
- Arabic headings use the same weight steps as Latin (700/600) — do not substitute a heavier weight to "compensate," as this breaks the pairing.
- Never use `letter-spacing` on Arabic text; Arabic does not use letter-tracking and applying it breaks glyph joining.
- Numbers in Arabic content default to Western Arabic numerals (0–9) for consistency with quantities, dates, and match scores across the platform, unless a specific locale requirement changes this — a **Design System Decision** made for consistency with the MongoDB/API layer, which stores and returns Western numerals.

### Heading hierarchy

Only one H1 per page. H2 for major sections, H3 for card-group or subsection headings. Never skip a level for visual effect (e.g. H1 → H3 to make something "look right") — adjust with type scale overrides on the correct semantic level instead.

### Maximum text width

Body copy is capped at `65ch` (Latin) / equivalent Arabic measure for readability in descriptions and long-form content (About page, resource descriptions). Cards and metadata rows are not subject to this cap since they are not prose.

### Truncation & multiline behavior

- Card titles: single line, ellipsis truncation (`text-overflow: ellipsis`) with a `title` attribute (or Angular equivalent) carrying the full text for hover/accessibility.
- Descriptions inside cards: clamp to 2–3 lines (`-webkit-line-clamp`) with a "Read more" affordance on the detail view, never on the card itself.
- Never truncate category, quantity, status, or urgency — these are decision-critical (Section 2.2) and must always render in full, even if it means wrapping.

---

## 6. Spacing System

### Scale

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96` (px), exposed as `--space-1` through `--space-24` (in 4px steps: `--space-1 = 4px` … `--space-24 = 96px`).

### Application

| Context | Token |
|---|---|
| Icon-to-text gap | `--space-2` (8px) |
| Component internal padding (input, button, badge) | `--space-3`–`--space-4` (12–16px) |
| Card padding | `--space-4`–`--space-5` (16–20px), `--space-6` (24px) on desktop for Resource/Request/Match cards |
| Form field vertical rhythm | `--space-5` (20px) between fields |
| Section spacing (within a page) | `--space-8`–`--space-10` (32–40px) |
| Page-level top/bottom margin | `--space-12`–`--space-16` (48–64px) desktop, `--space-8` (32px) mobile |
| Dashboard grid gap | `--space-6` (24px) desktop, `--space-4` (16px) mobile |

Arbitrary spacing values (anything not on this scale) are not permitted in components without a documented **Design System Decision** explaining the exception (e.g. optical alignment of an icon by 1px is acceptable and does not need documentation; a one-off 30px gap does).

---

## 7. Grid & Layout

### Containers

| Breakpoint | Max content width | Page margin |
|---|---|---|
| Mobile | 100% | 16px |
| Tablet | 100% | 24px |
| Laptop | 1120px | 32px (auto-centered) |
| Desktop | 1280px | 40px (auto-centered) |
| Large desktop | 1440px | auto-centered, content stays capped at 1280px |

### Grid

12-column grid on laptop and up, 4-column on mobile/tablet, with a consistent `--space-6` (24px) gutter on desktop and `--space-4` (16px) on mobile.

### Dashboard layout

Sidebar (fixed, 260px expanded / 72px collapsed) + main content area with its own max-width and padding. Header height: 64px, sticky, containing search (where applicable), notifications, and the user menu.

### Mobile layout

Sidebar collapses to a bottom tab bar (primary nav, max 5 items) or a slide-over drawer for secondary items. Header becomes a compact top bar (56px) with a hamburger/menu affordance.

---

## 8. Breakpoints

| Name | Range | What changes |
|---|---|---|
| Mobile | `< 640px` | Single column, stacked cards, bottom nav, filters in a drawer/sheet, dialogs go full-screen |
| Tablet | `640–1023px` | 2-column card grids, sidebar becomes collapsible, filters as a top bar |
| Laptop | `1024–1279px` | Full sidebar + content layout, 3-column card grids, dashboards show 2–3 KPI cards per row |
| Desktop | `1280–1535px` | 3–4 column card grids, full dashboard KPI row (4+) |
| Large desktop | `≥ 1536px` | Content stays capped at 1280px max-width; extra space is margin, not more columns — Dawwarha does not stretch content infinitely wide |

The system is mobile-first: base styles target mobile, and each breakpoint upward adds layout complexity via `min-width` media queries — never the reverse.

---

## 9. Border Radius

| Token | Value | Semantic usage |
|---|---|---|
| `--radius-sm` | 6px | Inputs, small buttons, badges (non-pill), checkboxes |
| `--radius-md` | 10px | Buttons (default), dropdown menus, tooltips |
| `--radius-lg` | 14px | **Cards** (Resource/Request/Match/Impact — the default container radius) |
| `--radius-xl` | 18px | Modals, dialogs, large panels |
| `--radius-2xl` | 24px | Hero panels, landing page feature blocks |
| `--radius-full` | 9999px | Avatars, pills/chips, status badges, circular icon buttons |

Recommended card radius is **14px** (`--radius-lg`) across the system, per the Product Brief's visual direction. Do not mix radius sizes within a single component's own corners.

---

## 10. Borders & Elevation

Dawwarha is **border-first**. Shadows are the exception, reserved for genuinely floating elements.

### Borders

- `--color-border` (`#DCE3E0`), 1px, on all cards, inputs, and table rows by default.
- `--border-width-emphasis`: 1.5–2px, used only for a selected/active state (e.g. a selected filter card) or a focus ring container — not for general emphasis.

### Shadows (elevation)

| Level | Token | Use | Value (approx.) |
|---|---|---|---|
| 0 | `--shadow-none` | Cards at rest (border does the work) | none |
| 1 | `--shadow-sm` | Card on hover (subtle lift) | `0 1px 2px rgba(23,33,30,0.06)` |
| 2 | `--shadow-md` | Dropdowns, popovers | `0 4px 12px rgba(23,33,30,0.10)` |
| 3 | `--shadow-lg` | Modals, dialogs | `0 12px 32px rgba(23,33,30,0.16)` |

**Design System Decision:** Cards never use a shadow at rest — only a border. A shadow appears only on hover (desktop) as a 1-level lift, signaling interactivity, and is omitted entirely on touch devices where hover has no meaning. Modals and dropdowns always use elevation because they are genuinely floating above content and a border alone would not separate them from the page behind.

---

## 11. Motion & Animation

Motion communicates state changes; it never exists purely for decoration.

### Duration tokens

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | 120ms | Hover states, focus rings, button press |
| `--duration-base` | 200ms | Dropdown open/close, tab switch, tooltip |
| `--duration-slow` | 280ms | Modal/dialog enter-exit, drawer slide |

### Easing

`--ease-standard: cubic-bezier(0.2, 0, 0, 1)` for most transitions (fast start, gentle settle). `--ease-emphasized: cubic-bezier(0.3, 0, 0.1, 1)` for modal/drawer entrances only.

### Specific patterns

- **Hover:** color/border transitions at `--duration-fast`, opacity/shadow at `--duration-fast`.
- **Modal:** backdrop fades in over `--duration-base`; panel scales from 0.97→1 and fades in over `--duration-slow` with `--ease-emphasized`.
- **Dropdown:** slides down 4px + fades in over `--duration-base`.
- **Page transitions:** none by default (Angular router navigation is instant); a thin top progress bar may indicate route-level data loading, not a full-page transition animation.
- **Loading transitions:** skeleton pulse animation, 1.5s ease-in-out infinite, opacity 0.6↔1.
- **Skeleton animation:** shimmer or pulse, never a spinner *and* a skeleton together for the same region.

### `prefers-reduced-motion`

When set, all transform-based animations (scale, slide, shimmer) are replaced with instant state changes or a simple opacity crossfade at `--duration-fast`. This is implemented once at the token/utility level (a reduced-motion media query wrapping the animation utilities), not per-component.

---

## 12. Iconography

**Icon family:** Lucide Icons exclusively. Mixing icon families (e.g. adding Font Awesome or Material icons for "one thing that's missing") is not permitted — if Lucide lacks an icon, use the closest semantic match or a text label instead.

| Context | Size |
|---|---|
| Inline with Caption/Body Small text | 14px |
| Inline with Body text, form fields | 16px |
| Buttons (default size) | 18px |
| Standalone action icons (icon buttons) | 20px |
| Empty-state icons | 40–48px |
| Status icons (badges) | 12–14px |

**Stroke:** 1.75–2px stroke weight consistently (Lucide default is 2px — do not mix stroke weights across icons on the same screen).

**Icon + text spacing:** `--space-2` (8px) between icon and adjacent label text, vertically centered on the text's optical center, not its box center.

**Alignment:** Icons in buttons/badges are vertically centered with the text baseline optically adjusted (Lucide icons often need a 1px nudge relative to text — acceptable as noted in Section 6).

---

## 13. Button System

### Variants

| Variant | Purpose | Visual |
|---|---|---|
| Primary | The single dominant action in a section | `--color-primary` fill, white text |
| Secondary | Supporting actions | `--color-surface` fill, `--color-border` border, `--color-text-primary` text |
| Ghost | Tertiary / low-emphasis actions, toolbar actions | transparent, text-only, hover shows `--color-surface-muted` |
| Destructive | Delete, cancel resource/request, suspend, reject | `--color-danger` fill (solid) or `--color-danger` text on Ghost (for lower-emphasis destructive actions like "Reject match") |

### Sizes

| Size | Height | Padding (h) | Typography |
|---|---|---|---|
| sm | 32px | 12px | Button sm (14/20) |
| md (default) | 40px | 16px | Button md (16/24) |
| lg | 48px | 20px | Button md (16/24), heavier visual weight via padding not type size |

Minimum touch target is **40px** for any interactive element on touch surfaces, even if the visual button is smaller (achieved via padding/hit-area expansion on `sm` buttons in touch contexts) — this is a hard rule from Section 32 (Accessibility).

### States

- **Icon placement:** leading icon for actions with a clear object (e.g. "+ Publish Resource"), trailing icon only for disclosure/navigation ("Continue →").
- **Loading:** icon/label replaced by a centered spinner at the button's icon size; button retains its width (no layout shift) and is disabled during load.
- **Disabled:** 40% opacity, no hover/active states, `cursor: not-allowed`, `aria-disabled="true"`.
- **Hover:** Primary darkens one step (`--color-primary-500` → hover uses `--color-primary-700` for text-on-fill contexts); Secondary/Ghost show `--color-surface-muted` background.
- **Active (pressed):** darkens one further step from hover; scale unchanged (no bounce/scale-down effect — keeps interactions calm per Section 2.3).
- **Focus:** visible 2px focus ring in `--color-primary-600` at 40% opacity offset 2px from the button edge, always visible on keyboard focus, never suppressed.

### Hierarchy rule

Only one Primary button should normally dominate a given section or card footer. A form with "Save" and "Cancel" uses Primary + Ghost, not Primary + Secondary (which reads as two competing calls to action).

---

## 14. Form System

Every form control shares the same anatomy: **Label → Control → Helper text OR Error message → (optional) Required indicator.**

| Control | Notes |
|---|---|
| Input | 40px height default, `--radius-sm`, `--color-border`, focus ring on `:focus-visible` |
| Textarea | Min 3 rows, resizable vertically only, character count shown when a max length applies (e.g. resource description) |
| Select | Native `<select>` styled to match Input, or a custom Combobox-pattern trigger of identical height |
| Combobox | Used for category selection with search (categories list can grow); same trigger styling as Select |
| Checkbox | 18×18px, `--radius-sm` at half value (≈4px), `--color-primary` when checked |
| Radio | 18×18px circular, `--color-primary` dot when selected |
| Switch | Used for boolean toggles (e.g. "Mark unavailable"); 40×22px track |
| Date input | Native date input styled to match Input height; quantity/date pairs (availability window) shown side-by-side on desktop, stacked on mobile |
| Quantity input | Numeric input with unit label suffix (e.g. "kg", "items") inside the field, right-aligned |
| Search | Leading search icon, clear (×) affordance when populated |
| File/image upload | Dropzone pattern: dashed `--color-border` container, drag state highlights with `--color-primary-100` background, shows thumbnail + remove affordance once a file is attached |

### Per-control requirements

- **Label:** always visible (never placeholder-as-label), Label typography (Section 5), positioned above the control.
- **Placeholder:** example content only, never instructional ("e.g. 5 boxes of canned food," not "Enter quantity").
- **Helper text:** Caption typography, `--color-text-muted`, below the control, replaced by an error message when one is present (not shown simultaneously).
- **Validation:** inline, on blur for most fields; on change for fields with an async check (e.g. email uniqueness).
- **Error state:** `--color-danger` border (1.5px), error icon + message in `--color-danger` below the field, `aria-invalid="true"` and `aria-describedby` pointing to the error text.
- **Disabled state:** `--color-surface-muted` background, `--color-text-muted` text, no focus ring.
- **Focus state:** 2px `--color-primary-600` ring at 40% opacity, offset 2px, on every control type identically.
- **Required indicator:** a `--color-danger` asterisk after the label text, plus `aria-required="true"` — never color alone (Section 2.6, 20).

Forms are guided rather than raw CRUD: the Resource/Request creation forms are multi-section (not necessarily multi-step) with clear section headings ("What are you offering," "Where and when") rather than one long flat field list, per the Product Brief's "guided form with examples" direction (Section 08 journey table).

---

## 15. Feedback System

| Pattern | Use | Duration / dismissal |
|---|---|---|
| **Toast** | Short-lived confirmation of a completed action (e.g. "Resource published") | Auto-dismiss after 4s, manually dismissible, max 1 visible at a time (queue additional) |
| **Inline error** | Field-level validation failure | Persists until corrected |
| **Banner** | Page-level problem (e.g. "You must verify your organization before publishing a standing request") | Persists until resolved or dismissed; placed at top of the relevant page/section |
| **Dialog** | Destructive or high-impact confirmation (cancel resource, suspend user, reject match) | Requires explicit action to dismiss (confirm or cancel) |
| **Skeleton** | Content-heavy loading (card lists, detail pages) | Shown for operations >300ms per NFR-006; replaced by content or an error/empty state |
| **Spinner** | Short operations, typically button-scoped or small regions | Same 300ms threshold |

**Design System Decision:** the 300ms threshold from the Product Brief (NFR-006) is implemented as: don't show a loading indicator at all if the operation resolves within 300ms (avoids flicker for fast responses); if it exceeds 300ms, show skeleton (content regions) or spinner (buttons, small inline regions).

---

## 16. Status System

| Status | Color | Icon (Lucide) | Notes |
|---|---|---|---|
| Draft | Neutral (`--color-text-muted` on `--color-surface-muted`) | `file-edit` | Not yet visible to others |
| Published | Info | `megaphone` | Visible, not yet matched |
| Available | Success | `circle-check` | Open for matching |
| Matched | Info | `link` | Candidate proposed |
| Accepted | Primary | `handshake` | Both sides agreed |
| In Handover | Warning | `truck` | Coordination in progress |
| Completed | Success | `check-check` | Both sides confirmed |
| Impact Recorded | Sand accent (`--color-sand-700` icon, success-tinted badge) | `sparkles` | Logged to impact metrics |
| Pending | Warning | `clock` | Awaiting review (verification, reports) |
| Verified | Success | `badge-check` | Organization/user trust signal |
| Rejected | Danger | `circle-x` | Match/verification/report declined |
| Suspended | Danger | `ban` | Account/org disabled |
| Reported | Warning | `flag` | Flagged for moderation review |

### Rules

- Status is always communicated with **icon + label text**, never color alone (Section 2.6, WCAG 1.4.1).
- Badge shape: `--radius-full` pill, Caption typography, `--space-2` horizontal padding beyond text, icon leading.
- Badge background uses the semantic `-bg` tint (Section 4); badge text/icon uses the full-strength semantic color.

---

## 17. Resource Card

### Anatomy (top to bottom / hierarchy order)

1. **Category** — icon + label, most prominent metadata row (Label typography)
2. **Quantity** — adjacent to category, equally prominent
3. **Location** — Body Small, with a location-pin icon
4. **Availability** — status badge (Section 16) + availability window if relevant
5. **Description** — Body Small, clamped to 2 lines (Section 5)
6. **Additional metadata** — provider/org name (with verification badge if applicable), posted date — Caption, lowest visual weight

### Layout

- **Desktop:** horizontal card, optional thumbnail image left (96×96px, `--radius-md`), content right, `--space-5` internal padding.
- **Mobile:** stacked — thumbnail (if present) full-width top at 16:9, content below, `--space-4` padding.

### States

- **Hover (desktop):** `--shadow-sm` lift + border color shifts to `--color-primary-100`... actually border shifts to a slightly darker neutral, cursor pointer (whole card is a single tap/click target).
- **Loading:** skeleton matching the exact anatomy — category/quantity row, location row, description lines — never a generic gray box.
- **Empty (list-level, not card-level):** see Section 29.
- **Unavailable:** card desaturates slightly (icon/text drop to `--color-text-muted`), status badge shows "Unavailable," card remains clickable (detail view explains why) but is not actionable for new matches.
- **Expired:** same visual treatment as Unavailable, with "Expired" status and a note on the detail view about the availability window having passed.

---

## 18. Request Card

Same anatomy pattern as Resource Card, re-ordered for demand-side priorities:

1. **Category**
2. **Requested quantity**
3. **Location**
4. **Urgency** — a distinct badge from status, using semantic color (Low = Info tint, Medium = Warning, High = Danger), always paired with the word ("High urgency"), never a color chip alone
5. **Status** — lifecycle badge (Section 16)

Layout, states, loading, and empty treatment mirror the Resource Card (Section 17) exactly, for consistency (Section 2.7) — the only difference is field order/priority and the addition of the Urgency badge.

---

## 19. Match Card

The Match Card is Dawwarha's flagship trust surface — see Section 23 (Product Brief) for why matching must never feel like "mysterious AI."

### Anatomy

1. **Match Score** (Section 20) — top of card, most prominent element
2. Paired **Resource** and **Request** summary (compact versions of Sections 17–18: category, quantity, location only)
3. **Score breakdown** — the five signals (Category, Location, Quantity, Urgency, Availability), each with a checkmark/cross, always visible (not hidden behind a "why?" interaction) per the Product Brief's transparency requirement
4. Actions: **Accept** (Primary) / **Reject** (Ghost, destructive-toned text)
5. Match status badge if not in a "pending decision" state

### Layout

Desktop: two-column comparison (Resource left, Request right) beneath the score header. Mobile: stacked, Resource above Request, each collapsed to its compact summary.

---

## 20. Match Score System

### Score presentation

Displayed as a percentage (e.g. **92% Match**) in a large, high-contrast numeral (H3 weight/size) at the top of the Match Card, accompanied immediately by the signal breakdown — score and breakdown are never separated into a "details" click-through.

### Score ranges (visual treatment)

| Range | Treatment |
|---|---|
| 85–100% | Success-colored score numeral and ring/accent |
| 60–84% | Info-colored |
| Below threshold | Not surfaced to users at all — the matching engine's threshold (Product Brief Section 12) means only qualifying matches ever reach the UI |

**Design System Decision:** exact percentage breakpoints above are a UI-layer decision for color treatment only; they do not alter the underlying rule-based scoring model or its threshold, which is owned by the Backend Implementation Plan's `matchingService`.

### Confidence language

Never use language implying machine learning or opaque AI ("Our AI thinks this is a good match"). Always factual and rule-based: **"92% match based on category, location, quantity, urgency, and availability."**

### Score explanation

The five-signal breakdown (Section 19) is the explanation — each signal shows a check (matched) or cross (partial/no match) with its label, always in the same fixed order (Category → Location → Quantity → Urgency → Availability) matching the Product Brief's scoring model order.

### Accessibility

Score breakdown checks/crosses are never color- or icon-only: each row pairs the icon with the signal label as text, and the overall percentage has an `aria-label` reading the full sentence form ("92 percent match: category matched, location matched, quantity matched, urgency matched, availability matched").

### Mobile behavior

Score breakdown collapses to a 2-column grid of the five signals rather than a single vertical list, to avoid excessive card height on small screens, but every signal remains visible without a tap.

### Deceptive precision

Scores are never shown beyond whole-percentage precision (no "91.73% Match") — the underlying model is explainable and rule-based, not falsely precise.

---

## 21. Lifecycle / Timeline Component

### States per step

- **Completed:** filled circle (`--color-success`), connecting line to next step solid `--color-success`.
- **Active:** filled circle in `--color-primary`, pulsing subtly (respecting reduced-motion) or a solid ring, label bolded.
- **Upcoming:** hollow circle in `--color-border`, connecting line dashed/muted, label in `--color-text-muted`.
- **Failed:** circle in `--color-danger` with an × mark, line to it in `--color-danger` — used when a resource/request/handover terminates abnormally (cancelled, no-show, rejected) rather than progressing.
- **Cancelled:** circle in `--color-text-muted` with a dash/minus mark — distinct from Failed to communicate "stopped by choice" vs. "stopped by problem," matching the Product Brief's distinct edge cases (Section 11).

### Mobile behavior

Horizontal timeline (desktop) becomes a vertical stepper on mobile, with the active step scrolled into view by default and completed steps collapsible/summarized to save vertical space.

---

## 22. Domain Components

Every domain component below follows the same documentation contract: Purpose, Anatomy, Variants, States, Responsive behavior, Accessibility, Do, Don't. Full specifications for the flagship components (ResourceCard, RequestCard, MatchCard, MatchScore, LifecycleTimeline) are in Sections 17–21. The remaining domain components:

### LocationChip

**Purpose:** Compact display of a resource/request's area, used inline in cards and filter bars.
**Anatomy:** pin icon + area/city label, `--radius-full`, Caption typography.
**Variants:** default (neutral), interactive (used as a filter toggle — adds a selected state in `--color-primary-100`).
**States:** default, hover (interactive variant only), selected (interactive variant only).
**Responsive:** unchanged across breakpoints; wraps into the filter bar's flex-wrap layout on mobile.
**Accessibility:** interactive variant is a real `<button>` with `aria-pressed`.
**Do:** keep label short (area/neighborhood, not full address). **Don't:** show precise addresses in a chip (privacy — Product Brief Section 17 security note; full address is never shown in the UI at all pre-handover).

### UrgencyBadge

**Purpose:** Communicate request urgency. **Anatomy:** icon + label pill (Section 16 status pattern). **Variants:** Low/Medium/High, mapped to Info/Warning/Danger. **States:** static display only (not interactive). **Responsive:** unchanged. **Accessibility:** text label always present, never an unlabeled color dot. **Do:** always show alongside category/quantity on Request Cards. **Don't:** use urgency color semantics (Danger=High) for anything unrelated to urgency, to avoid users misreading unrelated danger-colored elements as urgent requests.

### VerificationBadge

**Purpose:** Show verified organization/user trust status inline with a name. **Anatomy:** small `badge-check` icon (success color) immediately after the name, no separate label text (tooltip on hover/focus provides "Verified organization"). **Variants:** verified, pending (clock icon, warning), rejected (not shown inline — rejected orgs don't display a badge at all, per the trust model). **States:** static. **Responsive:** unchanged. **Accessibility:** `aria-label="Verified organization"` on the icon since it carries meaning with no visible text. **Do:** place immediately adjacent to the name it verifies. **Don't:** use the badge as a decorative "official" stamp on unrelated content.

### ImpactCard

**Purpose:** Summarize a user's or organization's cumulative contribution. **Anatomy:** large numeral (completed transfers count) + label, Warm Sand accent treatment (Section 3, 4). **Variants:** personal (Contribution History page), organizational (Org Impact screen), aggregate (Admin analytics — uses neutral, not sand, treatment to stay consistent with the Admin shell's operational tone). **States:** loading (skeleton), empty ("No completed transfers yet" + link to browse). **Responsive:** stacks into a single column on mobile within a KPI grid. **Accessibility:** numeral has a text label, never a number-only tile. **Do:** keep language credible, not gamified ("14 resources rescued," not "🏆 Level 3 Rescuer!") per Section 39's explicit anti-gamification direction. **Don't:** add points, levels, or badges beyond the Verification Badge — the Product Brief explicitly avoids childish gamification.

### ContributionCard

**Purpose:** A single row/card in the Contribution History list — one completed transfer. **Anatomy:** category icon, resource title, counterpart name (with VerificationBadge if applicable), completed date, link to the full handover record. **Variants:** as-provider, as-seeker (label reflects role: "You gave" / "You received"). **States:** default, loading (skeleton row). **Responsive:** table-like row on desktop, stacked card on mobile (Section 36 governs table vs. card choice). **Accessibility:** each row is a landmark-free but semantically ordered list item (`<li>` within `<ul>`/`<ol>` or an ARIA list pattern). **Do:** always show the completion date. **Don't:** show contact info here — that's handover-scoped and time-limited (Product Brief Section 17 privacy note).

### OrganizationCard

**Purpose:** Represent an organization in browse/detail contexts. **Anatomy:** org name + VerificationBadge, short description, category focus (if applicable), verification status badge if not yet approved. **Variants:** public (browse/detail), admin-review (adds document links and Approve/Reject actions — see Section 40). **States:** pending, verified, rejected (admin-review variant only shows all three; public variant only ever shows verified orgs, since unverified orgs shouldn't be discoverable as trustworthy — a **Design System Decision** consistent with the trust model in Section 13 of the Product Brief). **Responsive:** standard card breakpoint behavior. **Accessibility:** standard card semantics; verification status never conveyed by border color alone.

### ReportStatus

**Purpose:** Show a report's moderation state to the reporter and to admins. **Anatomy:** status badge (Open/Reviewed/Resolved, Section 16 pattern) + timestamp. **Variants:** reporter-facing (status + "we'll review this" copy, no target details exposed beyond what reporter already knows), admin-facing (full detail — see Section 40). **States:** open (Warning), reviewed (Info), resolved (Success). **Accessibility:** standard status badge pattern.

### NotificationItem

**Purpose:** A single row in the notification list. **Anatomy:** type icon (matches the triggering domain — e.g. `link` icon for a new match, `handshake` for handover, `flag` for a report update), message text, timestamp, unread indicator. **Variants:** unread (bold text + `--color-primary` dot), read (regular weight, no dot). **States:** default, hover (interactive — clicking navigates to the relevant detail). **Responsive:** unchanged. **Accessibility:** unread state communicated via `aria-label` prefix ("Unread: ...") not dot color alone. **Do:** keep message text factual and short. **Don't:** stack more than one action per notification row — tapping navigates, nothing else.

---

## 23. Navigation

### Public

Home · Browse Resources · Browse Requests · About · Login · Register — horizontal top nav on desktop (with Login/Register as buttons, right-aligned), collapses to a hamburger menu on mobile with Login/Register pinned as visible buttons even when the menu is closed (they are the primary conversion actions for anonymous visitors).

### Authenticated User

Dashboard · Resources · Requests · Matches · Notifications · Contributions · Profile — left sidebar on desktop/laptop, bottom tab bar (Dashboard, Resources, Requests, Matches, Profile — 5 max) plus a Notifications icon in the top bar on mobile, since a 7-item nav doesn't fit a mobile tab bar (Section 8).

### Organization

Adds an **Organization** section to the authenticated sidebar (Org Dashboard, Verification, Org Requests, Received Resources, Org Impact) — shown as a distinct grouped section beneath personal nav items, not merged into them, so a person acting on behalf of an org can clearly tell which context they're in.

### Admin

A **separate shell** (Section 27's "Do not make the admin interface visually identical to the public experience" — restated at length in Section 40). Top-level: Dashboard, Users, Organizations, Resources/Requests, Reports, Categories, Analytics. Persistent visual signal (a distinct header treatment — see Section 40) makes it unmistakable that the admin is in a different operational context, reducing the chance of an admin accidentally treating a moderation action as casually as a personal one.

---

## 24. Dashboard System

The Dawwarha dashboard aims for the clarity of Linear/Stripe-style modern SaaS product dashboards, not a dense ERP template or generic Bootstrap admin.

### Composition

- **KPI cards** — top row, 2–4 cards (e.g. Active Resources, Active Requests, Pending Matches, Completed Transfers), each with a numeral, label, and optional trend/period comparison. Neutral surface, no Warm Sand (that's reserved for Impact-specific contexts, Section 4).
- **Activity** — recent-activity feed below KPIs, using NotificationItem-style rows.
- **Matches** — a horizontally-scrollable or grid preview of top pending matches, linking to the full Matches screen.
- **Resources / Requests** — a compact list preview of the user's own active listings.
- **Notifications** — condensed preview (3–5 items) with a "View all" link.
- **Contribution/Impact** — a single ImpactCard summarizing cumulative contribution, using the Warm Sand treatment here specifically because this is an Impact-context surface.
- **Empty states** — see Section 29; a brand-new user's dashboard leads with a clear "Publish your first resource" or "Post your first request" call to action rather than a grid of empty KPI cards reading "0."

---

## 25. Empty States

Every empty state answers: **What is empty? Why is it empty? What can I do next?**

| Context | What's empty | Why | Next action |
|---|---|---|---|
| No resources | "You haven't published any resources yet" | New account or all listings completed/removed | "Publish a Resource" (Primary button) |
| No requests | "You haven't published any requests yet" | Same pattern | "Publish a Request" |
| No matches | "No matches yet for your active listings" | Matching runs against open resources/requests; none currently qualify | "Browse open requests" or "Check back soon" with a link to how matching works |
| No notifications | "You're all caught up" | No unread/recent activity | (no action needed — this is a positive empty state, kept simple, no CTA button) |
| No contributions | "No completed transfers yet" | New account, or first transfer still in progress | "See your active matches" if any exist, otherwise "Browse resources" |
| No search results | "No resources match these filters" | Filters too narrow, or genuinely nothing available in that category/area | "Clear filters" (Ghost button) |

Never render a bare "No data found." Every empty state includes a short explanatory sentence (Caption/Body Small) and, where a next step exists, a single clear action.

---

## 26. Loading States

| Context | Pattern |
|---|---|
| Card list (Resources/Requests/Matches) | 3–6 skeleton cards matching real card anatomy |
| Detail page | Skeleton blocks matching the page's real section layout (header, body, sidebar) |
| Table (Admin) | Skeleton rows matching real column structure |
| Button | Inline spinner replacing label (Section 13) |
| Page-level navigation | Thin top progress bar only if a route's initial data fetch exceeds 300ms; no full-page spinner overlay |
| Match generation | Skeleton Match Cards (score numeral skeleton + breakdown row skeletons) — communicates "computing matches" without inventing fake progress percentages |

Skeletons are preferred over spinners for any content-heavy region; spinners are reserved for buttons and small, bounded regions (Section 15).

---

## 27. Error States

| Error | UI treatment |
|---|---|
| 400 Validation | Inline field error(s), form does not submit, first invalid field receives focus |
| 401 Authentication | Redirect to Login with a banner: "Please log in to continue" (verbatim Product Brief copy, Section 22) |
| 403 Authorization | Banner or dialog: "You don't have permission to do that." Action that triggered it is disabled/hidden where the UI already knows the user lacks permission (e.g. Edit button never shown on someone else's resource) — the 403 message is a backstop for edge cases (stale UI state), not the primary defense |
| 404 Not Found | Dedicated not-found state on the detail page: "This listing no longer exists," with a link back to Browse |
| 409 Conflict | Inline banner near the relevant action: "This request has already been matched" (or the specific conflict message returned by the API) — action is disabled after the conflict is shown |
| 500 Server Error | Toast or banner: "Something went wrong. Please try again." — generic, never shows a stack trace or raw error text (matches Backend Plan Section 16 exactly) |
| Network error / offline | Persistent banner: "Connection lost — retrying..." with automatic retry/backoff; forms preserve unsaved input while offline |

All error messaging in the UI must match the Product Brief's Section 22 table verbatim where a message is specified there — this document does not introduce alternate wording for the same error type.

---

## 28. Accessibility

Target: **WCAG 2.2 AA** throughout, per NFR-011.

- **Semantic HTML:** real `<button>`, `<a>`, `<nav>`, `<main>`, `<header>`, `<form>` elements — never a `<div onClick>` masquerading as an interactive element.
- **Keyboard navigation:** every interactive element (cards, buttons, filter chips, tabs) reachable and operable via keyboard alone; card-as-link patterns use a single focusable wrapping element, not nested duplicate focus stops.
- **Focus visibility:** the focus ring (Section 13) is never suppressed with `outline: none` without a replacement; visible on every focusable element, including custom components (Combobox, Switch, Checkbox).
- **Focus order:** matches visual/reading order; modals trap focus and return it to the triggering element on close.
- **Screen readers:** all icons that carry meaning without adjacent text get an `aria-label`; decorative icons get `aria-hidden="true"`.
- **Labels:** every form control has a programmatically associated `<label>`; icon-only buttons have `aria-label`.
- **ARIA:** used to enhance semantic HTML, not replace it; custom components (Combobox, Switch, Dialog, Tabs) follow WAI-ARIA APG patterns.
- **Color contrast:** all text/background and UI-boundary pairings meet AA (Section 4).
- **Status communication:** never color alone (Sections 16, 20); toasts/banners use `role="status"` or `role="alert"` as appropriate for their urgency.
- **Error announcements:** validation errors are announced to assistive tech via `aria-live="polite"` regions or `aria-describedby` linkage, not visual-only.
- **Reduced motion:** honored globally (Section 11).
- **Touch targets:** minimum 40×40px (Section 13), applied to all interactive elements, not just buttons.
- **Forms:** grouped with `<fieldset>`/`<legend>` where a logical group exists (e.g. availability window start/end); required fields announced via `aria-required`.
- **Dialogs:** `role="dialog"`, `aria-modal="true"`, labelled by their heading via `aria-labelledby`, focus-trapped, closable via `Escape`.

---

## 29. RTL / Arabic Support

Dawwarha supports Arabic (RTL) and English (LTR) as first-class, symmetric experiences — not a mirrored afterthought.

- **Directional spacing:** all spacing tokens are applied via logical properties (`margin-inline-start`, `padding-inline-end`, etc.) rather than physical `left`/`right`, so the same component code works in both directions without per-direction overrides.
- **Icons:** directional icons (arrows, chevrons pointing "forward"/"back," the send/reply family) flip horizontally in RTL; non-directional icons (category icons, status icons, Lucide's `check`, `flag`, `clock`, etc.) do **not** flip.
- **Arrows/chevrons:** a "next" chevron points left in RTL, right in LTR — implemented via a CSS logical transform tied to `[dir]`, not duplicated icon assets.
- **Text alignment:** start-aligned by default in both directions (`text-align: start`), never hardcoded `left`.
- **Numbers:** rendered LTR-internally even within RTL text flow (standard bidi behavior for numerals) using Western Arabic numerals (Section 5).
- **Dates:** formatted per the active locale's date convention but numerals stay Western Arabic per the Section 5 decision.
- **Mixed Arabic/English content:** organization names or resource titles that mix scripts rely on the browser's native Unicode bidi algorithm; no manual bidi override is applied except in rare cases (e.g. a Latin acronym embedded mid-Arabic-sentence) where an explicit `<bdi>` wrapper is used.
- **Sidebar behavior:** the sidebar mirrors to the opposite physical side in RTL (right-side in Arabic), not just its internal text alignment — this is a layout mirror, not merely a text-direction change.
- **Forms:** label-above-control layout is direction-agnostic; inline field pairs (e.g. availability start/end) reverse order in RTL to preserve "first thing chronologically reads first."
- **Tables:** column order mirrors in RTL (first column becomes rightmost); sort/filter icons flip only if directional.

**Never solve RTL by simply mirroring everything blindly** (Product Brief instruction, restated): status badge icons, category icons, and the Match Score checkmarks/crosses stay fixed orientation in both directions since they carry no inherent directionality.

---

## 30. Responsive Design

| Element | Mobile behavior |
|---|---|
| Navigation | Collapses to bottom tab bar / hamburger drawer (Section 23) |
| Cards | Stack single-column, internal layout switches from horizontal to vertical (Section 17) |
| Dashboards | KPI row scrolls horizontally or stacks 1–2 per row; sidebar collapses (Section 24) |
| Forms | Single column, full-width controls, multi-field rows (e.g. availability window) stack |
| Tables | Convert to stacked card rows below the tablet breakpoint (Section 36) |
| Filters | Move into a bottom sheet / drawer triggered by a "Filters" button, rather than an always-visible sidebar |
| Modals | Become full-screen sheets below the tablet breakpoint rather than centered floating panels |
| Timelines | Horizontal → vertical stepper (Section 21) |
| Match cards | Two-column Resource/Request comparison → stacked (Section 19) |

General rule: content **stacks** before it **scrolls**, and **scrolls** before it **hides**. Hiding content on mobile is a last resort reserved for genuinely secondary metadata (e.g. "posted 3 days ago" may hide before category/quantity ever would).

---

## 31. Search / Filter System

- **Search input:** leading search icon, debounced (300ms) live search on Browse screens, explicit submit on forms that aren't live-search contexts.
- **Filter chips:** LocationChip-style interactive pills for quick single-tap filters (category, area) shown above the results grid.
- **Dropdown filters:** used for filters with many options or ranges not suited to a chip row (e.g. availability window).
- **Location filter:** area/city selection, paired with the LocationChip pattern for display of the active filter.
- **Category filter:** uses the controlled taxonomy (Product Brief Section 15) — never free text.
- **Urgency filter:** (Requests only) Low/Medium/High checkboxes or a segmented control.
- **Availability filter:** (Resources only) toggle for "available now" vs. date range.
- **Sorting:** a single Select control (e.g. "Newest," "Closest," "Highest match score" where applicable) — never more than one sort control per list.
- **Clear filters:** always visible once any filter is active, as a Ghost button, resets to the unfiltered state in one tap.
- **No-result state:** see Section 25's "No search results" row.

Filtering stays understandable: no more than the six filter dimensions above are exposed on any single Browse screen, consistent with Section 2.5 (progressive disclosure) and the Product Brief's own filter set (Section 22, FR-022).

---

## 32. Data Display

- **Tables** are used in Admin contexts where users scan/compare many records at once with consistent columns (Users, Organizations, Reports — Section 40).
- **Lists/cards** are used everywhere user-facing content is browsed for relevance rather than compared field-by-field (Resources, Requests, Matches, Notifications).
- **Metadata** (posted date, provider name) is always Caption weight, positioned last in a card's visual hierarchy (Section 17).
- **Numbers** (quantities, scores) use tabular figures where the typeface supports them, right-aligned in table columns.
- **Dates** use a relative format for recent activity ("2 days ago") and an absolute format for anything older than 7 days or in formal contexts (verification records, handover completion) — never ambiguous numeric-only formats like `03/04/26`.
- **Quantities** always show their unit (Section 14's Quantity input pattern) — a bare number is never sufficient on its own in a card or table.
- **Locations** show area/city level only in list/card contexts; full address is never shown pre-handover (Section 22's LocationChip Don't).
- **Percentages** (Match Score) follow Section 20's whole-number rule.
- **Impact metrics** use the Warm Sand accent treatment (Section 4) consistently wherever they appear.

**When to use a table vs. a card/list:** use a table when the primary task is scanning/comparing many records with the same fixed columns and no rich per-item content (Admin lists). Use a card/list when each item benefits from its own visual hierarchy, status, and imagery, and the primary task is browsing for relevance (all user-facing domain content).

---

## 33. Trust & Verification UI

| State | Treatment |
|---|---|
| Verified user/organization | VerificationBadge (Section 22) inline with name, everywhere the name appears |
| Pending verification | Warning-colored "Pending Verification" badge on the org's own dashboard/profile only — not shown to other users browsing, since a pending org isn't yet trust-established (Section 22's OrganizationCard Do/Don't) |
| Rejected verification | Shown only to the organization itself and to Admins, with the rejection reason (required per Backend Plan Task 1.G) displayed plainly and a path to resubmit |
| Reports | ReportStatus component (Section 22); reporters see only their own report's status, never the outcome details of action taken against another user |
| Suspicious activity | Not surfaced to end users at all — this is an Admin-only moderation signal (Section 40), never a public flag on a profile (which would itself be a vector for abuse/harassment) |
| Moderation | Fully contained within the Admin shell (Section 40) |
| Reputation | Shown as the ImpactCard/ContributionCard pattern (completed vs. cancelled history) — Dawwarha does not display a numeric "reputation score" star rating; reputation is communicated through the factual completed-transfer record, consistent with Section 39's anti-gamification stance |

Trust indicators are informative, not decorative: every trust-related badge or status has a clear, factual meaning a user could explain in one sentence, and never exists purely to make a profile "look official."

---

## 34. Handover UX

The two-sided confirmation model (FR-013) is made structurally visible, not just described in copy.

| Stage | UI treatment |
|---|---|
| Match accepted | Timeline (Section 21) advances to "Accepted," handover record created; user sees a clear "Next: coordinate the handover" prompt with the counterpart's contact info now revealed (Backend Plan Section 17's contact-reveal rule) |
| Coordination | A simple status panel showing both parties' names/contact and any coordination notes; not a full messaging system in the MVP |
| Handover started | Timeline shows "In Handover"; both sides see a large, unmistakable "Confirm Handover" primary action |
| Provider confirmation | Once the provider confirms, their side of a two-part confirmation indicator (Section 21-style dual state) fills; the seeker sees "Waiting on your confirmation" |
| Seeker confirmation | Mirror of the above from the seeker's side |
| Completed | Timeline advances to "Completed" the instant both flags are true; an explicit, unmistakable success state is shown (Section 15/2.3's "never a silent success" — Product Brief Section 23) — not just a badge color change |
| Failed/cancelled | Timeline shows the Failed or Cancelled state (Section 21) with a plain-language explanation of what happened and what's next (resource/request returns to Available, per the lifecycle edge cases) |
| Impact recorded | Timeline's final "Impact" step lights up; both parties see a link to their now-updated Contribution History |

**Design System Decision:** the two-sided confirmation is visualized as **two independent indicator dots/checks** (one per party) inside the "In Handover" timeline step, rather than a single progress bar, so it's immediately legible that *both* sides must act — a single bar filling halfway could misleadingly read as "50% done" rather than "one side confirmed."

---

## 35. Contribution & Impact

- **Contribution history:** a reverse-chronological list of ContributionCard entries (Section 22), filterable by role (Given/Received).
- **Points:** not used. Per Section 39's explicit direction, Dawwarha avoids point systems entirely.
- **Impact cards:** ImpactCard (Section 22), Warm Sand-accented, factual numerals only.
- **Completed handovers:** each links through to its own read-only detail view showing the full lifecycle timeline (Section 21) in its completed state, as a permanent record.
- **Community impact metrics:** aggregate versions of the same ImpactCard pattern appear on the Admin Analytics screen (Section 40), using the neutral (not Sand) treatment there to match the Admin shell's operational tone.

Impact is communicated as a credible, factual record — a count of real completed transfers — never inflated with streaks, levels, or celebratory gamification beyond a single, restrained success state at the moment of completion (Section 34).

---

## 36. Admin / Moderation Design

The Admin shell is **visually distinct** from the public/user experience while sharing the same underlying token system (Product Brief Section 27's instruction, restated).

### How it differs

- **Header treatment:** a distinct, slightly denser header bar (darker neutral background, `--color-neutral-900` text on `--color-neutral-50`, or an inverted header) signals "you are in an operational context."
- **Density:** table row height drops to 40px (from a more generous 56px+ in user-facing lists); font sizes shift down one step where appropriate (Body → Body Small as the table default).
- **Navigation:** the Admin sidebar (Section 23) is structurally separate from the user sidebar — an admin who is also a personal user switches between two distinct navigation contexts, never a single merged menu.

### Contents

- **Moderation dashboard:** KPI cards for Open Reports, Pending Verifications, Recent Activity (Section 25 of the Product Brief).
- **Reports:** table view, filterable by status/target type, row expands to full ReportStatus detail with Resolve action (Dialog confirmation, Section 15).
- **Users:** searchable table, Suspend/Reactivate actions (Dialog confirmation for Suspend, since it's destructive).
- **Organizations:** table + OrganizationCard admin-review variant (Section 22) for the verification queue, Approve/Reject actions.
- **Resources / Requests:** searchable/filterable table, Remove/Flag actions.
- **Suspicious activity:** surfaced only here, as a filter/flag on the Users or Resources tables — never a public-facing indicator (Section 33).
- **Verification:** the org verification queue, showing submitted documents inline (via the docx/pdf viewing pattern appropriate to the file type) and a decision form requiring a reason on rejection (Backend Plan Task 1.G).
- **Audit information:** a simple, append-only activity log per entity (who did what, when) shown in the detail/expanded view of Users, Organizations, and Reports.

Admin UI prioritizes density, clarity, filtering, and operational efficiency over the warmth register used elsewhere — it uses the same tokens (never a different color system) but leans on Neutral and Info more heavily than Primary Green and never uses Warm Sand except in the aggregate Impact KPI.

---

## 37. Page Templates

Templates describe page **anatomy** — the arrangement of regions — not pixel-specific designs.

| Template | Anatomy |
|---|---|
| **Public Landing** | Header nav → Hero (value prop + primary CTA) → How-it-works (3-step) → Category highlights → Footer |
| **Browse** | Header nav → Filter bar (Section 31) → Result count → Card grid (Section 17/18) → Pagination/infinite scroll → Empty state (Section 25) if no results |
| **Detail** | Breadcrumb/back → Title + status/urgency badges → Full metadata (category, quantity, location, availability/urgency) → Full description → Provider/requester info (with VerificationBadge) → Primary action (Request/Offer/Accept, contextual) |
| **Authentication** | Centered single-column form, minimal chrome, logo + short value-prop line above the form (Section 08 journey: "minimal required fields") |
| **User Dashboard** | Sidebar nav → KPI row → Activity/Matches/Resources/Requests preview sections → Notifications preview → Impact summary (Section 24) |
| **Organization Dashboard** | Same as User Dashboard, plus an Org-context banner/header identifying the active organization, and Org-specific sections (Standing Requests, Received Resources) |
| **Admin Dashboard** | Admin shell header → Admin sidebar → KPI row → Recent activity/queues (Section 36) |
| **Create Resource** | Guided multi-section form (Section 14) → Sticky/bottom Publish action → Draft-save affordance |
| **Create Request** | Mirror of Create Resource, request-specific fields |
| **Matches** | Header + filter (by status) → Match Card list (Section 19) → Empty state if none |
| **Notifications** | Simple reverse-chronological NotificationItem list, mark-as-read affordance |
| **Profile** | Editable form (Section 14 patterns) → Save action → (for verified orgs/users) VerificationBadge display |
| **Contribution History** | Filter (Given/Received) → ContributionCard list → ImpactCard summary at top |
| **Moderation** | Admin shell → Tabbed or sidebar-filtered table views (Reports/Users/Organizations/Resources/Requests) per Section 36 |

---

## 38. Angular Architecture

### Recommended structure

```
src/app/shared/
├── ui/                        ← Primitive Components
│   ├── button/
│   ├── input/
│   ├── select/
│   ├── dialog/
│   ├── toast/
│   ├── badge/
│   ├── card/
│   ├── skeleton/
│   └── ...
│
├── components/                ← Domain Components
│   ├── resource-card/
│   ├── request-card/
│   ├── match-card/
│   ├── match-score/
│   ├── lifecycle/
│   ├── location-chip/
│   ├── urgency-badge/
│   ├── verification-badge/
│   └── impact-card/
│
└── design-tokens/
```

### Primitive vs. Domain components

**Primitive Components** (`ui/`) know nothing about Dawwarha's product domain — a `Button`, `Input`, or `Badge` would be equally at home in an unrelated product. They expose generic variant/size/state APIs (Section 41).

**Domain Components** (`components/`) are Dawwarha-specific compositions of primitives that understand product concepts — a `ResourceCard` knows what a "category" and "availability window" are; internally, it is built from `Card`, `Badge`, and typography primitives, never from raw HTML re-implementing what a primitive already provides.

This mirrors the architecture diagram in Section 4 of this document: Tokens → Primitives → Composites → Domain Components → Page Templates → Screens. A Domain Component must not reach past Composite/Primitive components to hand-roll markup a primitive already solves (e.g. a domain component should never build its own button styling inline).

---

## 39. Tailwind Architecture

Tokens map into Tailwind via CSS custom properties referenced in `tailwind.config` theme extensions — never as hardcoded Tailwind arbitrary values in component markup.

**Bad:**
```html
<div class="bg-[#164E41] rounded-[14px] p-[17px]">
```

**Preferred:**
```html
<div class="bg-primary rounded-card p-4">
```

### Token categories mapped into Tailwind

- **Semantic color tokens** → `bg-primary`, `text-danger`, `border-border`, etc. (Section 4)
- **Spacing tokens** → Tailwind's default spacing scale is aligned to Section 6's 4px-step scale, so standard `p-4`/`gap-6` utilities already map correctly; no custom spacing scale needed beyond confirming alignment.
- **Radius tokens** → `rounded-card` (14px), `rounded-modal` (18px), `rounded-pill` (9999px), custom-named in the Tailwind theme rather than relying on ambiguous default `rounded-lg`.
- **Typography tokens** → custom `text-h1`, `text-body`, etc. utility classes (or a typography plugin config) mapped to Section 5's scale, rather than composing `text-4xl font-bold leading-tight` ad hoc per component.
- **Shadow tokens** → `shadow-card-hover`, `shadow-dropdown`, `shadow-modal` named per Section 10.
- **Transition tokens** → `duration-fast/base/slow` and `ease-standard/emphasized` custom theme values (Section 11).

All Dawwarha custom tokens are centralized in a single `design-tokens/tailwind-tokens.ts` (or equivalent) file that both the Tailwind config and any Angular-side TypeScript constants (e.g. chart color mapping) import from — one source, not two hand-synced copies.

---

## 40. Component API Principles

- **Inputs:** typed, minimal, and named for what they mean in the domain (`status: ResourceStatus`, not `variant: string`) where a component is domain-specific; primitives use generic names (`variant`, `size`).
- **Outputs:** named as events, past-tense or imperative-clear (`(accept)`, `(reject)`, `(statusChange)`).
- **Variants:** a fixed, documented enum per component (Section 13's button variants, Section 16's status set) — never an open string prop that invites ad hoc values.
- **Sizes:** `sm | md | lg` consistently across every primitive that has a size concept — never a component-specific size vocabulary.
- **States:** loading/disabled/error exposed as explicit boolean or enum inputs, not inferred from the absence/presence of other inputs.
- **Composition:** prefer content projection (`<ng-content>`) for flexible internal content over an ever-growing list of string/config inputs.
- **Accessibility contracts:** every interactive primitive ships with its required ARIA attributes built in (e.g. `Dialog` always sets `role="dialog"` and manages focus trap internally) — consuming code should not need to remember to add these.

Avoid giant components with dozens of unrelated inputs: if a component's input list is trying to serve multiple distinct use cases, split it into variants or separate components instead of growing a single component's API indefinitely.

---

## 41. Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Angular components | `kebab-case` selector, `PascalCase` class | `<app-resource-card>` / `ResourceCardComponent` |
| Primitive components | Generic names, no domain prefix | `ButtonComponent`, `BadgeComponent` |
| Domain components | Domain-noun names | `ResourceCardComponent`, `MatchScoreComponent` |
| Design tokens | `--category-role[-modifier]` | `--color-primary-600`, `--space-4`, `--radius-lg` |
| CSS/Tailwind classes | Semantic utility names, not raw values | `bg-primary`, `rounded-card` |
| Variants | `lowerCamelCase` string literal union | `variant: 'primary' | 'secondary' | 'ghost' | 'destructive'` |
| States | Boolean or enum props named for the state | `isLoading`, `isDisabled`, `status: 'pending' | 'verified' | 'rejected'` |
| Files | `kebab-case`, one component per file/folder | `resource-card/resource-card.component.ts` |
| Angular selectors | Prefixed `app-` | `app-match-card` |

Naming is predictable enough that an AI coding agent generating a new domain component can infer the correct file path, selector, and token names from this table without asking.

---

## 42. Design Tokens Reference

### Colors (semantic)

| Token | Maps to |
|---|---|
| `--color-background` | `--color-neutral-50` `#F8FAF9` |
| `--color-surface` | `--color-neutral-0` `#FFFFFF` |
| `--color-surface-muted` | `--color-neutral-100` `#F2F5F3` |
| `--color-border` | `--color-neutral-200` `#DCE3E0` |
| `--color-text-primary` | `--color-neutral-900` `#17211E` |
| `--color-text-secondary` | `--color-neutral-700` `#394640` |
| `--color-text-muted` | `--color-neutral-500` `#66756F` |
| `--color-primary` | `--color-primary-600` `#2F806F` |
| `--color-primary-hover` | `--color-primary-500` `#3F9582` |
| `--color-primary-active` | `--color-primary-700` `#237361` |
| `--color-success` | `#27845F` |
| `--color-warning` | `#B7791F` |
| `--color-danger` | `#C94A4A` |
| `--color-info` | `#3978A8` |

### Typography

See Section 5's full scale table.

### Spacing

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96` px — Section 6.

### Radius

`6 · 10 · 14 · 18 · 24 · 9999` px — Section 9.

### Shadows

`none · sm · md · lg` — Section 10.

### Motion

`fast 120ms · base 200ms · slow 280ms`; `ease-standard · ease-emphasized` — Section 11.

### Breakpoints

`mobile <640 · tablet 640–1023 · laptop 1024–1279 · desktop 1280–1535 · large ≥1536` — Section 8.

### Z-index

| Token | Value | Use |
|---|---|---|
| `--z-dropdown` | 20 | Dropdown menus, comboboxes |
| `--z-sticky` | 30 | Sticky headers/nav |
| `--z-drawer` | 40 | Mobile filter/nav drawers |
| `--z-modal-backdrop` | 50 | Dialog/modal backdrop |
| `--z-modal` | 51 | Dialog/modal panel |
| `--z-toast` | 60 | Toast notifications (always topmost) |

---

## 43. Do / Don't

### DO

- Use clear hierarchy — category and quantity dominate every listing card.
- Use semantic color tokens, never raw hex, in component code.
- Keep cards readable — full sentences and clamped description text, no dense jargon.
- Explain match scores — the breakdown is always visible, never hidden.
- Use purposeful empty states with a next action.
- Preserve accessibility on every custom component, not just the primitives.
- Support RTL correctly using logical properties, not mirrored duplicate styles.

### DON'T

- Use random colors outside the token system.
- Use arbitrary spacing values without a documented exception.
- Overuse shadows — Dawwarha is border-first (Section 10).
- Turn everything into a card — Admin tables exist for a reason (Section 32).
- Hide important information (category, quantity, status) behind a click.
- Use color as the only status indicator anywhere in the product.
- Create decorative animations that don't communicate a state change.
- Build generic CRUD-looking screens when a guided, domain-specific pattern exists.

---

## 44. UI Quality Checklist

Use before considering any screen complete.

**Visual**
- [ ] Typography matches the defined scale (Section 5), no ad hoc sizes
- [ ] Spacing uses the token scale (Section 6), no arbitrary values
- [ ] Hierarchy is clear at a glance (category/quantity dominate, metadata recedes)
- [ ] Alignment is consistent (start-aligned text, consistent card padding)
- [ ] Color uses semantic tokens only
- [ ] Responsive behavior verified at mobile, tablet, and desktop breakpoints

**UX**
- [ ] Loading state implemented (skeleton or spinner per Section 26)
- [ ] Success state is explicit, never silent (Section 15, 34)
- [ ] Error state implemented per Section 27's mapping
- [ ] Empty state implemented per Section 25's template
- [ ] Disabled state implemented where relevant actions can be unavailable
- [ ] Destructive/high-impact actions confirmed via Dialog (Section 15)

**Accessibility**
- [ ] Fully keyboard operable
- [ ] Visible focus states on every interactive element
- [ ] Labels present on every form control and icon-only button
- [ ] Contrast checked against Section 4's AA requirements
- [ ] Screen reader tested for status/error announcements
- [ ] `prefers-reduced-motion` honored

**Product consistency**
- [ ] Uses existing tokens, not new ad hoc values
- [ ] Uses existing primitive/domain components, not duplicated markup
- [ ] Matches an existing domain pattern (Section 22) rather than inventing a new one
- [ ] Terminology matches the Product Brief exactly (status names, role names)
- [ ] RTL verified, not just LTR

---

## 45. AI Implementation Rules

This section governs how AI coding agents (and engineers) should make decisions while implementing Dawwarha's UI.

1. Never invent a new color when an existing token can be used.
2. Never introduce arbitrary spacing without justification documented inline as a **Design System Decision**.
3. Reuse existing primitives before creating new components.
4. Prefer domain components over duplicating markup.
5. Never bypass accessibility requirements (Section 28), even under time pressure.
6. Never introduce a new visual pattern without documenting it in this file.
7. Preserve RTL/LTR behavior (Section 29) in every new component.
8. Do not replace the Dawwarha visual language with generic Material/Bootstrap styling.
9. Do not introduce gradients unless explicitly justified and documented.
10. Do not introduce excessive glassmorphism.
11. Do not create unnecessary animations — motion communicates state (Section 11), it doesn't decorate.
12. Do not use color alone to communicate status (Sections 16, 20, 28).
13. Maintain consistent loading/error/empty states across every new screen (Sections 25–27).
14. Keep mobile behavior intentional — verify the mobile layout, don't assume it "just works" by shrinking desktop.
15. When a new design decision is necessary, update this document.

### When uncertain

1. Reuse an existing component.
2. Reuse an existing token.
3. Follow an existing pattern.
4. Only then introduce a new pattern.
5. Document the new decision, in this file, as a **Design System Decision**.

---

## 46. Final Design System Summary

Dawwarha is a calm, trustworthy, community-rooted coordination product. Its interface combines the structural clarity of modern SaaS tooling — clear hierarchy, border-first surfaces, restrained motion, explainable data — with a warmth that comes from tone, color accent, and honesty about what the product does, not from decoration. Every screen tells the person using it what they can do and what will happen when they do it; every match, badge, and status tells them why. That is what "information first, decoration second" means in practice, and it is the standard every screen in Dawwarha should be held to.

---

*This document, together with the Dawwarha Product Brief v1.0, the MongoDB Implementation Plan v1.0, and the Backend Implementation Plan v1.0, is the team's complete source of truth. Any UI decision this document does not cover should be resolved per Section 45, and the resolution recorded here.*
