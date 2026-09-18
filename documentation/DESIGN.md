# DESIGN.md — Dawwarha Design System

*دورها — Human warmth + system precision.*

Version 1.0 · Source: `Dawwarha-Product-Brief.pdf` (primary), `Dawwarha — MongoDB Implementation Plan v1.0`, `Dawwarha — Backend Implementation Plan v1.0` (workflow/state reference) · No existing Angular/Tailwind frontend repository was found to inspect at the time this document was written — there are no prior visual decisions to preserve, so this document establishes the initial, authoritative design system. If a frontend repository already exists elsewhere with committed styling, its compatible decisions should be reconciled into this file rather than silently overridden.

---

## 1. Design System Overview

### What it is

The Dawwarha Design System is the single specification governing how the Dawwarha product looks, behaves, and communicates — tokens, primitive components, domain-specific components, page templates, and the rules for assembling them into screens.

### Purpose

Dawwarha is built by a small team across four backend domains (Identity, Supply, Demand & Matching, Transfer/Trust/Impact) with a separate Angular frontend effort, and is increasingly implemented with AI coding agent assistance. Without one shared visual contract, independently-built screens drift apart. `DESIGN.md` is that contract — implementation-ready enough that an engineer or an AI agent can build a new Dawwarha screen without making an independent visual judgment call.

### Who uses it

- Angular engineers implementing components, pages, and features.
- AI coding agents generating or modifying Dawwarha UI code.
- Designers extending or reviewing the visual language.
- Backend engineers who need to understand what states and error shapes the UI expects to receive.

### Design philosophy

**Information first. Decoration second.** Every visual decision in this document is justified by what it communicates — hierarchy, state, or trust — not by how it looks in isolation. Where the Product Brief specifies a workflow, status, or requirement, this document visualizes it; it does not reinterpret it.

### Source-of-truth rules

1. `Dawwarha-Product-Brief.pdf` is authoritative for product functionality, roles, workflows, lifecycle states, and requirements (FR/NFR numbers cited throughout this document refer to it).
2. `DESIGN.md` is authoritative for **visual and UI implementation** of those workflows.
3. Where the Product Brief leaves a visual detail undefined, this document makes an explicit, labeled call:

> **Design Decision:** *[decision + rationale]*

4. If a future implementation detail conflicts with something recorded here, the correct fix is to update `DESIGN.md` — never to silently diverge in one component or one AI-generated screen (see Section 37).
5. If an existing frontend implementation is found with a conflicting but reasonable prior decision, that decision is evaluated against this document's principles (Section 2) and either adopted (with this document updated to match) or superseded (with the rationale recorded) — it is never silently overwritten without a decision either way.

---

## 2. Design Principles

**Clarity over decoration.** Every screen must make two things obvious at a glance: what the user can do here, and what happens when they do it. An element that doesn't help answer either question is a decoration candidate for removal.

**Information hierarchy.** Primary facts dominate visually over secondary ones through size, weight, and position — never through color alone. On any listing, category and quantity outrank description text (Product Brief §23).

**Human warmth.** Community-oriented, not corporate and not childish. Warmth is carried by tone of voice, the Warm Sand accent (reserved for Impact/Contribution contexts), generous whitespace, and plain language — never by cartoon illustration or forced playfulness.

**Trust through transparency.** Verification, match scores, handover status, and report status always show *why*, never just *what*. A percentage or a badge with no visible reasoning is not acceptable anywhere in Dawwarha.

**Progressive disclosure.** Show what's needed for the decision at hand; defer detail one interaction deeper. Cards summarize; detail views elaborate.

**Accessibility by default.** Not a final pass — part of every component's contract from first implementation (Section 30). A component that fails its accessibility requirements is not "done."

**Consistency over novelty.** Reuse an existing pattern before inventing one. New patterns are a last resort and must be documented (Section 37).

**Mobile-first usability.** Providers and seekers publish and browse from phones as often as desktops. Components are designed mobile-first and enhanced upward — never designed for desktop and compressed down.

---

## 3. Brand & Visual Identity

**Brand personality:** Calm, capable, community-rooted — a trustworthy neighbor who happens to be exceptionally well organized, not a startup dashboard and not an NGO pamphlet.

**Visual mood:** Grounded and precise, warmed by sand and earth tones against a structured green-and-neutral base. Closer to a well-run civic office than a marketplace — no countdown timers, no scarcity pressure tactics; urgency in Dawwarha is a matching signal (Product Brief §12), not a sales device.

**Shape language:** Soft-cornered rectangles (10–14px) for cards, inputs, and containers; fully rounded (`9999px`) reserved for badges, avatars, and pills. No sharp corners anywhere in the system.

**Density:** Medium by default on user-facing screens; Admin (Section 28) is permitted higher density since its users are trained operators optimizing for throughput.

**Whitespace:** Used to build hierarchy and group related content — never purely decorative padding.

**Visual hierarchy:** Established primarily through the type scale (Section 5) and spacing rhythm (Section 6), so any two Dawwarha screens read as built by the same hand regardless of which engineer or agent built them.

**Image usage:** Real aspect ratios inside rounded containers; never stretched or force-cropped for effect.

**Illustration usage:** Minimal — small line-style Lucide icons for empty states, not custom illustration, to avoid the "cartoonish NGO" look the Product Brief explicitly warns against.

**Iconography:** A single family throughout — see Section 11.

**Overall UI character:** Infrastructure you'd trust with a real transfer between real people — structured like modern SaaS, warmed like a well-run community bulletin board.

---

## 4. Color Tokens

Components reference **semantic tokens only** — never raw hex values (Section 32). Raw values are defined once below and mapped to semantic roles.

### Primary Green scale

| Token | Hex | When to use | When not to use |
|---|---|---|---|
| `primary-900` | `#164E41` | Dark-mode surfaces (future), highest-emphasis dark text | Small body text on light bg (too heavy) |
| `primary-800` | `#1B5E50` | Deep hover/active depth | Large fills |
| `primary-700` | `#237361` | Active/pressed button state, small text-on-white needing AA | — |
| `primary-600` | `#2F806F` | **`primary`** — buttons, links, active nav, verified accent | Large background fills at scale (too saturated) |
| `primary-500` | `#3F9582` | `primary-hover` | Body text (contrast risk on white) |
| `primary-100` | `#DCEFEA` | Selected chip/filter background, subtle highlight | Long-text background |
| `primary-50` | `#F0F8F6` | Section background tint, hover row | — |

### Warm Sand scale

| Token | Hex | When to use | When not to use |
|---|---|---|---|
| `sand-700` | `#9A6538` | Small accent text/icon only | Buttons — not an action color |
| `sand-600` | `#B87942` | Decorative accent line, illustration stroke | Primary/secondary actions |
| `sand-500` | `#C98A4B` | Impact/contribution highlight accents | Status communication |
| `sand-100` | `#F5E8D8` | Impact card background | Default page/card surface |
| `sand-50` | `#FBF6F0` | Subtle section background in Impact/Contribution areas | — |

> **Design Decision:** Warm Sand is scoped exclusively to Impact, Contribution, and community-recognition moments (Sections 27, matching Product Brief §26). Using it as general UI chrome would dilute it into meaninglessness.

### Neutrals

| Token | Hex | When to use | When not to use |
|---|---|---|---|
| `neutral-900` | `#17211E` | `text-primary` | Backgrounds |
| `neutral-700` | `#394640` | `text-secondary` | Headings (use text-primary) |
| `neutral-500` | `#66756F` | `text-muted`, placeholders | Body copy |
| `neutral-300` | `#8A9792` | Disabled content on dark surfaces | Standard borders (fails AA as a border on white) |
| `neutral-200` | `#DCE3E0` | `border` | Text |
| `neutral-100` | `#F2F5F3` | `surface-muted` | Primary card surface |
| `neutral-50` | `#F8FAF9` | `background` | Card surface (needs contrast against page bg) |
| `neutral-0` | `#FFFFFF` | `surface` | Page background (cards should read as elevated above it) |

### Semantic tokens

| Token | Hex | Use | Don't |
|---|---|---|---|
| `success` | `#27845F` | Completed, verified, published, available | Anything unrelated to positive lifecycle state |
| `warning` | `#B7791F` | Pending, medium urgency, in-review | General emphasis unrelated to a pending/urgent state |
| `danger` | `#C94A4A` | Rejected, suspended, reported, destructive actions, high urgency | Decorative accents |
| `info` | `#3978A8` | Informational banners, neutral status (draft, matched) | Primary calls to action |

Every semantic color has a paired `-bg` tint (auto-derived at ~8–12% opacity) for badge/banner fills — `success-bg`, `warning-bg`, `danger-bg`, `info-bg` — generated consistently, never hand-picked per instance.

### Contrast

All text/background pairs meet **WCAG 2.2 AA**: 4.5:1 for body text, 3:1 for large text (≥24px, or ≥19px bold) and UI component boundaries. `primary-600` passes AA for large text and UI elements on white but **not** small body text — use `primary-800` for small primary-colored text.

> **Design Decision:** Dark mode is out of MVP scope (Product Brief §31). Tokens are structured semantically so a dark theme can be added later by remapping values, but none ships in v1.0.

---

## 5. Typography

### Typefaces

| Script | Font | Why |
|---|---|---|
| Latin | **Inter** | Neutral, legible at small sizes, wide weight range, open license |
| Arabic | **IBM Plex Sans Arabic** | Purpose-paired with Inter-style Latin faces, matched x-height and weight steps |

Fallback stacks: `Inter, -apple-system, "Segoe UI", sans-serif` / `"IBM Plex Sans Arabic", Tahoma, sans-serif`. `font-display: swap` on both.

### Scale

| Role | Size/Line-height | Weight | Tracking | Use |
|---|---|---|---|---|
| Display | 48/56 | 700 | -0.02em | Landing hero only |
| H1 | 36/44 | 700 | -0.01em | Page titles |
| H2 | 28/36 | 600 | -0.01em | Section headings |
| H3 | 22/30 | 600 | 0 | Card-group headings, dialog titles |
| Body | 16/24 | 400 | 0 | Default copy |
| Small | 14/20 | 400 | 0 | Secondary text, metadata |
| Caption | 12/18 | 500 | 0.01em | Timestamps, helper text, badge labels |

Button and Label styles (14/20 sm, 16/24 md/lg, weight 600) are defined alongside their components in Section 12.

### Hierarchy

One H1 per page. H2 for major sections, H3 for subsections/card groups. Never skip a level for visual effect — adjust the correct semantic level's size instead.

### Arabic typography

- Arabic body text renders 1–2px larger than the equivalent Latin size (Plex Sans Arabic reads slightly smaller at matched pixel size) — applied once via a `[dir="rtl"]` scale adjustment on the body-size tokens, never per component.
- Arabic headings use the same weight steps as Latin; do not compensate with heavier weights.
- No `letter-spacing` on Arabic — it breaks glyph joining.
- Numbers default to Western Arabic numerals (0–9) throughout, for consistency with the API/DB layer.

### RTL typography

Text alignment is always `start`, never hardcoded `left`/`right` (see Section 29 for full RTL rules). Heading hierarchy and weight steps are identical in both directions — RTL is a mirror of layout and directional iconography, not a different typographic system.

### Truncation & max width

- Body copy in descriptions/prose caps at `65ch` (or the Arabic equivalent measure).
- Card titles: single line, ellipsis, with the full text available via `title`/accessible name.
- Card descriptions: clamp to 2–3 lines; full text lives on the detail view only.
- Category, quantity, status, and urgency are **never truncated** — they're decision-critical (Section 2) and wrap rather than clip.

---

## 6. Spacing

### Scale

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96` px, exposed as `space-1`…`space-24` (4px steps).

| Context | Token |
|---|---|
| Icon-to-text gap | `space-2` (8px) |
| Component internal padding (input, button, badge) | `space-3`–`space-4` (12–16px) |
| Card padding | `space-4`–`space-5` (16–20px); `space-6` (24px) on desktop for flagship cards |
| Form field vertical rhythm | `space-5` (20px) |
| Section spacing within a page | `space-8`–`space-10` (32–40px) |
| Page top/bottom margin | `space-12`–`space-16` desktop, `space-8` mobile |
| Dashboard grid gap | `space-6` desktop, `space-4` mobile |

Arbitrary spacing (any value off this scale) requires a documented **Design Decision** — sub-pixel optical nudges (e.g. 1px icon alignment) are exempt.

---

## 7. Layout & Grid

### Containers

| Breakpoint | Max width | Page padding |
|---|---|---|
| Mobile | 100% | 16px |
| Tablet | 100% | 24px |
| Laptop | 1120px | 32px, auto-centered |
| Desktop | 1280px | 40px, auto-centered |
| Large desktop | 1440px | auto-centered; content stays capped at 1280px |

### Grid

12 columns (laptop+), 4 columns (mobile/tablet); gutter `space-6` desktop / `space-4` mobile.

### Sidebar & header

Sidebar: 260px expanded / 72px collapsed, fixed. Header: 64px, sticky, holds search (where applicable), notifications, user menu.

### Dashboard layout

Sidebar + content area, each with independent max-width/padding; KPI row → activity/preview sections beneath (Section 24).

### Mobile layout

Sidebar collapses to a bottom tab bar (max 5 primary items) or a slide-over drawer for secondary nav; header compresses to a 56px bar with a menu affordance.

---

## 8. Responsive Breakpoints

| Name | Range | Navigation | Cards | Grids | Forms | Tables | Filters | Dashboards | Modals | Timelines |
|---|---|---|---|---|---|---|---|---|---|---|
| Mobile | `<640px` | Bottom tab bar / drawer | Stack, vertical internal layout | 1 column | Single column, stacked fields | Convert to stacked cards | Bottom sheet/drawer | KPIs scroll or stack 1/row | Full-screen sheet | Vertical stepper |
| Tablet | `640–1023px` | Collapsible sidebar | 2-column grid | 2 columns | Single/two column mixed | Stacked cards | Top bar | 2/row KPIs | Centered, narrower | Vertical stepper |
| Laptop | `1024–1279px` | Full sidebar | 3-column grid | 3 columns | Multi-column where logical | Real table | Sidebar or top bar | 2–3/row KPIs | Centered panel | Horizontal |
| Desktop | `1280–1535px` | Full sidebar | 3–4 column grid | 3–4 columns | Multi-column | Real table | Sidebar | Full KPI row (4+) | Centered panel | Horizontal |
| Large desktop | `≥1536px` | Full sidebar | Same as desktop, content capped | Same, capped at 1280px | Same | Real table | Sidebar | Full KPI row | Centered panel | Horizontal |

Rule: content **stacks** before it **scrolls**, and **scrolls** before it **hides**. Hiding is reserved for genuinely secondary metadata only (e.g. "posted 3 days ago" may hide before category/quantity ever would).

---

## 9. Radius, Borders & Shadows

### Radius

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 6px | Inputs, small buttons, badges, checkboxes |
| `radius-md` | 10px | Default buttons, dropdown menus, tooltips |
| `radius-lg` | 14px | **Cards** — the default container radius |
| `radius-xl` | 18px | Modals, dialogs, large panels |
| `radius-2xl` | 24px | Hero panels, landing feature blocks |
| `radius-full` | 9999px | Avatars, pills, status badges, circular icon buttons |

Recommended card radius: **14px**. Never mix radius sizes across a single component's own corners.

### Borders

`border` (`#DCE3E0`), 1px, default on all cards/inputs/table rows. `border-width-emphasis` (1.5–2px) reserved for a selected/active state or a focus-ring container.

### Shadows

Dawwarha is **border-first**; shadows are the exception.

| Level | Token | Use |
|---|---|---|
| 0 | `shadow-none` | Cards at rest — border does the work |
| 1 | `shadow-sm` | Card hover (desktop only, subtle lift) |
| 2 | `shadow-md` | Dropdowns, popovers |
| 3 | `shadow-lg` | Modals, dialogs |

> **Design Decision:** cards never carry a shadow at rest; a shadow appears only on desktop hover, as a signal of interactivity, and is skipped entirely on touch devices where hover has no meaning. Modals/dropdowns always use elevation since they genuinely float above content.

---

## 10. Motion

### Durations & easing

| Token | Value | Use |
|---|---|---|
| `duration-fast` | 120ms | Hover, focus ring, button press |
| `duration-base` | 200ms | Dropdown, tab switch, tooltip |
| `duration-slow` | 280ms | Modal/dialog enter-exit, drawer slide |
| `ease-standard` | `cubic-bezier(0.2,0,0,1)` | Most transitions |
| `ease-emphasized` | `cubic-bezier(0.3,0,0.1,1)` | Modal/drawer entrances only |

### Patterns

- **Hover:** color/border at `duration-fast`.
- **Dialogs:** backdrop fades over `duration-base`; panel scales 0.97→1 + fades over `duration-slow` with `ease-emphasized`.
- **Dropdowns:** slide 4px + fade over `duration-base`.
- **Page transitions:** none by default; a thin top progress bar only if a route's data fetch exceeds 300ms — no full-page spinner overlay.
- **Skeletons:** shimmer/pulse, 1.5s ease-in-out infinite, opacity 0.6↔1. Never pair a skeleton with a spinner for the same region.

### `prefers-reduced-motion`

All transform-based animation (scale, slide, shimmer) is replaced by instant change or a simple opacity crossfade at `duration-fast`, implemented once at the token/utility layer — not per component. Motion always communicates a state change; it never exists for decoration alone.

---

## 11. Iconography

**Family:** Lucide Icons, exclusively. No mixing icon families, ever — if Lucide lacks an icon, use the closest semantic match or fall back to a text label.

| Context | Size |
|---|---|
| Inline with Caption/Small text | 14px |
| Inline with Body text, form fields | 16px |
| Buttons (default) | 18px |
| Standalone icon buttons | 20px |
| Empty-state icons | 40–48px |
| Status badge icons | 12–14px |

**Stroke:** 1.75–2px consistently (Lucide default 2px) — never mixed on the same screen.

**Icon/text spacing:** `space-2` (8px), vertically centered to the text's optical center.

**Status icons:** always paired with a text label (Section 18) — never a lone icon or color chip.

**Button icons:** leading icon for actions with a clear object ("+ Publish Resource"), trailing icon only for disclosure/navigation ("Continue →").

---

## 12. Core UI Components

For each: Purpose, Anatomy, Variants, Sizes, States, Responsive, Accessibility, Do, Don't.

### Button

**Purpose:** trigger a single action. **Anatomy:** optional leading icon, label, optional trailing icon. **Variants:** Primary (solid `primary` fill), Secondary (`surface` fill + `border`), Ghost (transparent, text-only, `surface-muted` on hover), Destructive (`danger` fill, or Ghost with `danger` text for lower emphasis). **Sizes:** sm (32px), md (40px, default), lg (48px). **States:** default, hover (one step darker fill / `surface-muted` bg), active (one further step), focus (2px `primary-600` ring at 40% opacity, offset 2px, always visible), disabled (40% opacity, `cursor:not-allowed`, `aria-disabled`), loading (label replaced by centered spinner, width preserved, disabled). **Responsive:** minimum 40×40px touch target on touch surfaces regardless of visual size. **Accessibility:** real `<button>`, visible focus ring never suppressed, `aria-busy` while loading. **Do:** keep one Primary per section/footer. **Don't:** pair two Primary buttons competing for attention.

### Input

**Purpose:** single-line text entry. **Anatomy:** label above, control, helper/error below. **Variants:** text, email, number, password. **Sizes:** 40px height default, 32px compact (tables/filters). **States:** default, focus (ring), error (`danger` border 1.5px + message), disabled (`surface-muted` bg, `text-muted`), read-only. **Responsive:** full-width on mobile. **Accessibility:** programmatic `<label>` association, `aria-invalid`/`aria-describedby` on error. **Do:** show placeholder as an example, never as the label. **Don't:** rely on placeholder-as-label.

### Textarea

**Purpose:** multi-line entry (descriptions). **Anatomy:** same as Input + optional character counter. **Variants:** fixed rows (min 3), auto-grow. **States:** same as Input. **Responsive:** full width always. **Accessibility:** same as Input; counter announced via `aria-live="polite"` near the limit. **Do:** show remaining characters when a max applies. **Don't:** silently truncate input past the limit — block further typing with a visible counter instead.

### Select

**Purpose:** choose one value from a closed list. **Anatomy:** trigger (matches Input height) + option list. **Variants:** native `<select>` (preferred for simple enums), custom trigger (for styled consistency with Combobox). **States:** default, open, focus, error, disabled. **Responsive:** options list becomes a bottom sheet on mobile for custom variant. **Accessibility:** `role="listbox"`/`role="option"` for custom variant, full keyboard support (arrow keys, type-ahead, Escape). **Do:** use native `<select>` where no search/large list is needed (simplicity, built-in a11y). **Don't:** rebuild a custom select for a 3–5 item enum.

### Combobox

**Purpose:** search + select from a longer list (category taxonomy, location). **Anatomy:** search input trigger + filtered option list. **Variants:** single-select, multi-select (filter chips inside the trigger). **States:** default, open/filtering, no-results, loading, error, disabled. **Responsive:** bottom sheet on mobile. **Accessibility:** WAI-ARIA combobox pattern (`aria-expanded`, `aria-activedescendant`), announces result count changes. **Do:** debounce filtering at 150–200ms. **Don't:** require an exact-match selection with no visible "no results" state.

### Checkbox

**Purpose:** binary or multi-select choice. **Anatomy:** 18×18px box + label (label is part of the hit target). **States:** unchecked, checked (`primary` fill + check glyph), indeterminate, disabled, error (rare — used for required-agreement checkboxes). **Accessibility:** native `<input type="checkbox">` under the hood, label wraps or is `for`-linked. **Do:** make the full label clickable. **Don't:** shrink the hit target below 40×40px including label padding on touch.

### Radio

**Purpose:** single choice from a small visible set. **Anatomy:** 18×18px circle + label. **States:** unchecked, checked (`primary` dot), disabled. **Accessibility:** grouped in a `<fieldset>`/`<legend>` or `role="radiogroup"` with an accessible group label. **Do:** use for ≤5 mutually exclusive options. **Don't:** use Radio for >5 options — switch to Select/Combobox.

### Switch

**Purpose:** immediate boolean toggle (e.g. "Mark unavailable"). **Anatomy:** 40×22px track + thumb. **States:** off, on (`primary` track), disabled, loading (thumb shows a small spinner during an async toggle). **Accessibility:** `role="switch"`, `aria-checked`, operable via Space. **Do:** use for settings that apply immediately. **Don't:** use Switch for anything requiring a form submit — that's a Checkbox.

### Search

**Purpose:** query input for Browse screens. **Anatomy:** leading search icon, input, clear (×) affordance once populated. **States:** default, focus, with-query, loading (debounced live search), no-results (handled by the containing list, Section 21). **Responsive:** full-width in mobile filter drawer. **Accessibility:** `role="searchbox"`, results count announced via `aria-live`. **Do:** debounce at ~300ms. **Don't:** fire a request on every keystroke.

### File Upload

**Purpose:** attach resource images / organization verification documents. **Anatomy:** dashed-border dropzone, drag state (`primary-100` bg), thumbnail + remove affordance once attached. **Variants:** single image, multi-image, document (PDF). **States:** empty, dragging-over, uploading (progress), uploaded, error (file type/size). **Responsive:** full-width dropzone on mobile, tap-to-browse. **Accessibility:** dropzone is also a real, keyboard-activatable file input trigger — drag-and-drop is progressive enhancement, not the only path. **Do:** show file-type/size constraints up front. **Don't:** accept a file silently and fail only on submit.

### Card

**Purpose:** generic content container — the base every domain card (Section 13) builds on. **Anatomy:** surface, `border`, `radius-lg`, internal padding (Section 6). **Variants:** default, interactive (hover lift + pointer cursor), selected (emphasis border). **States:** default, hover, selected, loading (skeleton), disabled. **Accessibility:** if the whole card is a single click target, it's one focusable element (a wrapping `<a>`/`<button>`), not nested duplicate focus stops. **Do:** use as the base for every domain card. **Don't:** hand-roll card styling outside this primitive (Section 36).

### Badge

**Purpose:** compact label — status, count, or category tag. **Anatomy:** icon (optional) + label, `radius-full` pill, Caption typography. **Variants:** neutral, success, warning, danger, info (maps to Section 18's status system), count (numeral only, e.g. unread count). **States:** static (non-interactive) by default. **Accessibility:** always carries visible text, never a color-only dot for meaning-bearing badges. **Do:** pair icon + label for status badges. **Don't:** use a bare color dot to convey status.

### Avatar

**Purpose:** represent a user/organization visually. **Anatomy:** circular image or initials fallback, `radius-full`. **Sizes:** sm (24px), md (32px), lg (48px). **States:** image loaded, initials fallback, loading (skeleton circle). **Accessibility:** `alt` text with the person/org name; decorative-only avatars (paired with visible adjacent name) use `alt=""`. **Do:** use consistent initials-fallback coloring (deterministic hash-to-`primary`-tint). **Don't:** use a generic silhouette icon — initials read as more personal and are more legible.

### Tooltip

**Purpose:** supplementary info on hover/focus, not required to complete a task. **Anatomy:** small dark surface, Caption text, directional arrow/caret. **States:** hidden, visible (delayed ~400ms on hover, instant on focus). **Responsive:** suppressed on touch (no true hover) — content that must be available on touch belongs in visible UI, not a tooltip. **Accessibility:** `role="tooltip"`, associated via `aria-describedby`; never the only way to access required information. **Do:** use for icon-only button labels as a supplement to `aria-label`. **Don't:** put essential instructions only in a tooltip.

### Dropdown

**Purpose:** contextual menu of actions or a list of selectable options triggered from a button/icon. **Anatomy:** trigger + floating panel (`shadow-md`, `radius-md`). **States:** closed, open, item-hover, item-disabled. **Responsive:** becomes a bottom sheet on mobile for long option lists. **Accessibility:** WAI-ARIA menu pattern, full keyboard nav (arrows, Escape, type-ahead), focus returns to trigger on close. **Do:** close on outside click and Escape. **Don't:** nest a dropdown inside another dropdown — use a submenu pattern or restructure.

### Dialog

**Purpose:** focused, blocking interaction — confirmation or a short form that must complete before returning to the page. **Anatomy:** backdrop, panel (`radius-xl`, `shadow-lg`), title, body, footer actions. **States:** closed, opening/closing (motion, Section 10), open. **Responsive:** full-screen sheet below tablet breakpoint. **Accessibility:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` to the title, focus-trapped, closable via Escape, focus returns to the trigger on close. **Do:** use for destructive/high-impact confirmations (cancel resource, suspend user, reject match). **Don't:** use Dialog for a routine, low-stakes action — that's a Toast or inline state.

### Drawer

**Purpose:** slide-in panel for secondary content that doesn't need full focus-trapping urgency (filters on mobile, a detail preview). **Anatomy:** slides from an edge, backdrop, scrollable content. **Variants:** filter drawer, nav drawer, detail-preview drawer. **States:** closed, open. **Responsive:** primary mobile pattern for filters/secondary nav (Section 8). **Accessibility:** same focus-trap and Escape-to-close behavior as Dialog when it functions as a modal overlay. **Do:** use for filter panels on mobile. **Don't:** use Drawer for a confirmation that truly needs a blocking Dialog.

### Tabs

**Purpose:** switch between related views without navigating away. **Anatomy:** tab list (horizontal), active-tab indicator (underline in `primary`), panel. **States:** active, inactive, disabled, hover, focus. **Responsive:** horizontally scrollable tab list on mobile if it overflows, never wraps to two rows. **Accessibility:** WAI-ARIA tabs pattern (`role="tablist"`/`"tab"`/`"tabpanel"`), arrow-key navigation between tabs. **Do:** keep tab labels short (1–2 words). **Don't:** use Tabs for a sequential/stepped process — that's the Lifecycle Timeline (Section 13) or a stepper.

### Toast

**Purpose:** short-lived, non-blocking confirmation. **Anatomy:** icon + message, optional single action link, auto-dismiss. **Variants:** success, error, info (maps to semantic tokens). **States:** entering, visible, exiting. **Behavior:** auto-dismiss after 4s, manually dismissible, maximum one visible at a time (others queue). **Accessibility:** `role="status"` (or `role="alert"` for error toasts), doesn't steal focus. **Do:** use for "Resource published," "Match accepted." **Don't:** use Toast for anything the user must act on — that needs a Banner or Dialog.

### Alert (Banner)

**Purpose:** page- or section-level persistent notice. **Anatomy:** icon + message + optional action, full-width within its container. **Variants:** success, warning, danger, info. **States:** persists until resolved or dismissed. **Accessibility:** `role="alert"` for danger/warning, `role="status"` for info/success. **Do:** use for "You must verify your organization before publishing a standing request." **Don't:** use Alert for a single field's validation error — that's inline (Section 19).

### Skeleton

**Purpose:** content-shaped loading placeholder. **Anatomy:** gray blocks matching the real content's exact layout (never a generic spinner-in-a-box). **States:** shimmer/pulse animation (Section 10), replaced by real content, empty state, or error state. **Accessibility:** `aria-busy="true"` on the containing region, hidden from the accessibility tree via `aria-hidden` on the skeleton shapes themselves. **Do:** shape skeletons to match the real component's anatomy (e.g. a Resource Card skeleton has a category-row block, a location-row block). **Don't:** use a single generic gray rectangle for a complex card.

### Spinner

**Purpose:** loading indicator for small, bounded regions (buttons, inline areas). **Anatomy:** circular indeterminate spinner at icon size. **States:** visible only past the 300ms threshold (Section 20). **Accessibility:** `aria-live="polite"` region announcing "Loading" once, not repeatedly. **Do:** use inside buttons and small inline regions. **Don't:** use a full-page spinner overlay — prefer a skeleton or a top progress bar.

### Table

**Purpose:** scan/compare many records with fixed columns (primarily Admin, Section 28). **Anatomy:** header row (sortable columns where relevant), body rows, optional row actions. **States:** default, loading (skeleton rows), empty (Section 21), row-hover, row-selected. **Responsive:** converts to stacked cards below tablet (Section 8) — a table is never horizontally scrolled on mobile as the primary pattern. **Accessibility:** semantic `<table>`/`<thead>`/`<tbody>`, sortable headers exposed via `aria-sort`. **Do:** use for Admin lists (Users, Organizations, Reports). **Don't:** use Table for user-facing browsing (Resources/Requests/Matches) — those use cards (Section 32).

### Pagination

**Purpose:** navigate a large result set. **Anatomy:** previous/next controls + page indicator (numbered or "Page 2 of 8"), or a "Load more" pattern for infinite-scroll-style lists. **Variants:** numbered pagination (Admin tables), Load More / infinite scroll (Browse screens, matches user-facing card-browsing behavior better than page numbers). **States:** default, disabled (at first/last page), loading (next page fetching). **Accessibility:** `<nav aria-label="Pagination">`, current page marked `aria-current="page"`. **Do:** use Load More for public Browse screens. **Don't:** force numbered pagination on a casual mobile browsing experience.

---

## 13. Domain Components

Dawwarha-specific components are the product's real differentiator and matter more than the generic primitives above. Each follows: Purpose, Information hierarchy, Anatomy, Variants, States, Responsive, Accessibility, Do/Don't.

### ResourceCard — see Section 14 (full spec)

### RequestCard — see Section 15 (full spec)

### MatchCard / MatchScore — see Section 16 (full spec)

### LifecycleTimeline — see Section 17 (full spec)

### LocationChip

**Purpose:** compact area/city display, inline in cards and filter bars. **Hierarchy:** single-level — no nested info. **Anatomy:** pin icon + area label, `radius-full`, Caption type. **Variants:** static (display-only), interactive (filter toggle, adds a selected state in `primary-100`). **States:** default, hover (interactive only), selected (interactive only). **Responsive:** wraps within a flex-wrap filter bar on mobile. **Accessibility:** interactive variant is a real `<button>` with `aria-pressed`. **Do:** keep to area/neighborhood level. **Don't:** show a precise street address — full address is never shown pre-handover (Product Brief §17 privacy note).

### UrgencyBadge

**Purpose:** communicate request urgency. **Hierarchy:** equal prominence to Status on a Request Card (Section 15). **Anatomy:** icon + label pill (Section 12 Badge pattern). **Variants:** Low (`info`), Medium (`warning`), High (`danger`). **States:** static. **Accessibility:** always icon + text, never a color dot. **Do:** always render alongside category/quantity on Request Cards. **Don't:** reuse urgency's danger-red for unrelated meanings elsewhere on the same screen — it would misread as urgent.

### VerificationBadge

**Purpose:** trust signal for a verified user/organization. **Hierarchy:** always adjacent to the name it verifies, never standalone. **Anatomy:** small `badge-check` icon (success), no separate label — tooltip provides "Verified organization" on hover/focus. **Variants:** verified (shown), pending (shown only on the org's own dashboard, warning-colored clock icon), rejected (never shown inline — see Section 25). **Accessibility:** `aria-label="Verified organization"` on the icon since it's meaning-bearing with no adjacent text. **Do:** place immediately next to the name. **Don't:** use it as a decorative "official" stamp on unrelated content.

### ImpactCard

**Purpose:** summarize cumulative contribution. **Hierarchy:** large numeral leads, label secondary. **Anatomy:** numeral + label, Warm Sand accent (personal/org contexts only — Section 4). **Variants:** personal, organizational, aggregate (Admin — neutral treatment, not Sand, see Section 28). **States:** loading (skeleton), empty ("No completed transfers yet"). **Accessibility:** numeral always has a text label, never a bare number tile. **Do:** stay factual ("14 resources rescued"). **Don't:** add points, levels, or badges beyond VerificationBadge (Section 27's anti-gamification rule).

### ContributionCard

**Purpose:** one row in Contribution History — a single completed transfer. **Hierarchy:** category/title lead, counterpart and date secondary. **Anatomy:** category icon, resource title, counterpart name (+VerificationBadge if applicable), completed date. **Variants:** as-provider ("You gave"), as-seeker ("You received"). **States:** default, loading (skeleton row). **Responsive:** table-row on desktop, stacked card on mobile. **Accessibility:** semantic list item within an ordered/unordered list. **Do:** always show the completion date. **Don't:** show contact info here — that's handover-scoped and time-limited.

### OrganizationCard

**Purpose:** represent an org in browse/detail/admin-review contexts. **Hierarchy:** name + VerificationBadge lead, description secondary. **Anatomy:** name, badge, short description, category focus, verification status badge (admin-review variant only). **Variants:** public (verified orgs only — a **Design Decision** consistent with the trust model, since surfacing unverified orgs publicly would undercut trust), admin-review (adds document links + Approve/Reject, Section 28). **States:** pending, verified, rejected — public variant only ever renders verified. **Accessibility:** standard card semantics; verification never conveyed by border color alone.

### NotificationItem

**Purpose:** one row in the notification list. **Hierarchy:** message leads, timestamp trails. **Anatomy:** type icon (matches triggering domain), message, timestamp, unread indicator. **Variants:** unread (bold text + `primary` dot), read. **States:** default, hover (navigates on click/tap). **Accessibility:** unread communicated via an `aria-label` prefix ("Unread: ..."), never dot color alone. **Do:** keep message text factual and short. **Don't:** stack more than one action per row.

### ReportStatus

**Purpose:** show a report's moderation state. **Hierarchy:** status badge leads, timestamp trails. **Anatomy:** status badge (Open/Reviewed/Resolved) + timestamp. **Variants:** reporter-facing (status + reassurance copy, no target detail beyond what the reporter already knows), admin-facing (full detail, Section 28). **States:** open (`warning`), reviewed (`info`), resolved (`success`). **Accessibility:** standard Badge pattern (Section 12).

---

## 14. Resource Card

### Information hierarchy (highest to lowest)

1. **Category** — icon + label, most prominent metadata
2. **Quantity** — equal prominence to category
3. **Location** — Small type, pin icon
4. **Availability** — status badge + window if relevant
5. **Description** — Small type, clamped to 2 lines
6. **Additional metadata** — provider/org name (+ VerificationBadge), posted date, Caption weight, lowest prominence

### Anatomy

Optional thumbnail, then the six hierarchy levels above in order.

### Desktop behavior

Horizontal layout: thumbnail (96×96px, `radius-md`) left, content right, `space-5` padding. Hover: `shadow-sm` lift, border shifts one step darker, whole card is a single click target.

### Mobile behavior

Stacked: thumbnail (if present) full-width 16:9 top, content below, `space-4` padding.

### States

Loading (skeleton matching exact anatomy), empty (list-level, Section 21), unavailable (desaturated text/icons, "Unavailable" badge, still clickable), expired (same treatment, "Expired" badge, detail view explains the passed availability window).

---

## 15. Request Card

Same anatomy/state pattern as Resource Card (Section 14), re-prioritized:

1. **Category**
2. **Requested quantity**
3. **Location**
4. **Urgency** — UrgencyBadge (Section 13), always paired with the word ("High urgency")
5. **Status** — lifecycle badge (Section 18)

Layout, states, loading, and empty treatment are identical to Section 14 by design (Section 2's consistency-over-novelty principle) — only field order and the added Urgency badge differ.

---

## 16. Matching UI

Matching is Dawwarha's flagship trust surface (Product Brief §12, §23) — it must never feel like "mysterious AI."

### MatchCard

**Anatomy:** MatchScore header (below) → compact Resource summary + compact Request summary (category/quantity/location only) → score breakdown (always visible) → Accept (Primary) / Reject (Ghost, danger-toned text) actions → status badge if not pending.

**Layout:** desktop — two-column Resource/Request comparison beneath the score; mobile — stacked, Resource above Request.

### MatchScore

**Presentation:** large H3-weight percentage (e.g. **92% Match**) at the top of the card, immediately followed by the breakdown — score and breakdown are never separated behind a click.

**Breakdown example:**

```
92% Match

Category      ✓
Location      ✓
Quantity      ✓
Urgency       ✓
Availability  ✓
```

Fixed order always: Category → Location → Quantity → Urgency → Availability, matching the Product Brief's scoring model order (§12) exactly.

**Score ranges (visual treatment only, not a change to the underlying rule-based threshold):**

| Range | Treatment |
|---|---|
| 85–100% | `success`-colored numeral/accent |
| 60–84% | `info`-colored numeral/accent |
| Below the matching engine's threshold | Never surfaced — the backend only returns qualifying matches |

**Confidence language:** always factual — *"92% match based on category, location, quantity, urgency, and availability."* Never *"our AI thinks..."* — the system is rule-based (Product Brief §12), and the UI must say so implicitly through how it explains itself.

**Deceptive precision:** whole-percentage only — never `91.73%`.

**Accessibility:** each breakdown row pairs its check/cross icon with its text label; the overall score carries an `aria-label` reading the full sentence form.

**Mobile:** breakdown collapses to a 2-column grid of the five signals rather than a tall single column, but every signal stays visible without a tap.

---

## 17. Lifecycle

### States

| State | Visual treatment |
|---|---|
| Completed | Filled circle, `success`; connecting line to next step solid `success` |
| Active | Filled circle, `primary`; label bolded; subtle pulse (respects reduced-motion) |
| Upcoming | Hollow circle, `border` color; connecting line dashed/muted; label `text-muted` |
| Cancelled | Circle in `text-muted` with a dash/minus mark — "stopped by choice" |
| Failed | Circle in `danger` with an × mark — "stopped by problem" |

Steps in order: **Draft → Published → Available → Matched → Accepted → In Handover → Completed → Impact**, matching Product Brief §11 exactly.

### Responsive

Horizontal on desktop; vertical stepper on mobile, with the active step scrolled into view and completed steps collapsible to save space.

---

## 18. Status System

| Status | Color | Icon | Notes |
|---|---|---|---|
| Draft | Neutral | `file-edit` | Not yet visible to others |
| Published | Info | `megaphone` | Visible, unmatched |
| Available | Success | `circle-check` | Open for matching |
| Matched | Info | `link` | Candidate proposed |
| Accepted | Primary | `handshake` | Both sides agreed |
| In Handover | Warning | `truck` | Coordination in progress |
| Completed | Success | `check-check` | Both sides confirmed |
| Impact | Sand accent icon, success-tinted badge | `sparkles` | Logged to impact metrics |
| Pending | Warning | `clock` | Awaiting review |
| Verified | Success | `badge-check` | Trust signal |
| Rejected | Danger | `circle-x` | Declined |
| Suspended | Danger | `ban` | Account/org disabled |
| Reported | Warning | `flag` | Flagged for review |

**Status never depends on color alone** — every instance pairs the semantic color with an icon and a visible text label (Section 2, Section 30).

---

## 19. Forms

Every control shares one anatomy: **Label → Control → Helper text OR Error message → optional Required indicator.**

- **Labels:** always visible, Label weight/size (Section 5's Button/Label styling), positioned above the control — never placeholder-as-label.
- **Placeholders:** examples only ("e.g. 5 boxes of canned food"), never instructions.
- **Helper text:** Caption, `text-muted`, replaced (not doubled) by an error message when one exists.
- **Validation:** inline, on blur for most fields; on change for async checks (email uniqueness).
- **Errors:** `danger` border (1.5px) + icon + message below, `aria-invalid="true"` + `aria-describedby`.
- **Required fields:** `danger` asterisk after the label + `aria-required="true"` — never color alone.
- **Disabled state:** `surface-muted` background, `text-muted` text, no focus ring.
- **Loading state:** submit button shows the Button loading pattern (Section 12); fields remain interactive unless the whole form is locked during submission, in which case fields show the disabled treatment.
- **Success state:** explicit confirmation on submit (Toast or inline banner, Section 20) — never a silent success (Product Brief §23).
- **Accessibility:** every control programmatically labeled; logical field groups use `<fieldset>`/`<legend>` (e.g. availability window start/end).

Forms are guided workflows: the Resource/Request creation forms are structured into clear sections ("What are you offering," "Where and when") rather than one long flat field list, per Product Brief §08's "guided form with examples."

---

## 20. Feedback System

| Pattern | When |
|---|---|
| **Toast** | Short-lived confirmation ("Resource published") — auto-dismiss 4s |
| **Inline Error** | Field-level validation failure — persists until corrected |
| **Banner (Alert)** | Page-level persistent problem — persists until resolved/dismissed |
| **Dialog** | Destructive/high-impact confirmation — requires explicit action |
| **Skeleton** | Content-heavy loading >300ms |
| **Spinner** | Short, bounded-region operations >300ms |
| **Empty State** | A list/view has legitimately nothing to show (Section 21) |

> **Design Decision:** the 300ms threshold (NFR-006) means nothing is shown at all for operations resolving faster than 300ms, to avoid flicker; past 300ms, skeleton (content regions) or spinner (buttons/small regions) appears.

---

## 21. Empty States

Every empty state answers: **what's empty, why, and what to do next.**

| Context | What | Why | Next action |
|---|---|---|---|
| Resources | "You haven't published any resources yet" | New account or all listings resolved | "Publish a Resource" (Primary) |
| Requests | "You haven't published any requests yet" | Same | "Publish a Request" |
| Matches | "No matches yet for your active listings" | Nothing currently qualifies against the scoring threshold | "Browse open requests" / "Check back soon" |
| Notifications | "You're all caught up" | Nothing unread/recent | None — a positive empty state needs no CTA |
| Contributions | "No completed transfers yet" | New account or first transfer still in progress | "See your active matches" or "Browse resources" |
| Search results | "No resources match these filters" | Filters too narrow or genuinely nothing in that category/area | "Clear filters" (Ghost) |

Never render a bare "No data found." Every empty state includes a short explanatory sentence and, where relevant, one clear action.

---

## 22. Error States

| Error | UI behavior |
|---|---|
| 400 Validation | Inline field error(s); form doesn't submit; first invalid field gets focus |
| 401 Authentication | Redirect to Login + banner: "Please log in to continue." |
| 403 Authorization | Banner/Dialog: "You don't have permission to do that." — primary defense is hiding/disabling the action in the UI when permission is already known to be absent |
| 404 Not Found | Dedicated not-found state on the detail page: "This listing no longer exists," link back to Browse |
| 409 Conflict | Inline banner near the relevant action, using the specific conflict message returned by the API (e.g. "This request has already been matched") |
| 500 Server Error | Toast/banner: "Something went wrong. Please try again." — never a stack trace or raw error text |
| Network Error | Persistent banner: "Connection lost — retrying..." with automatic retry/backoff |
| Offline | Same banner pattern; unsaved form input is preserved while offline |

Messaging matches the Product Brief's §22 table verbatim wherever it specifies exact copy — this document doesn't introduce alternate wording for the same error type.

---

## 23. Navigation

**Public:** Home · Browse Resources · Browse Requests · About · Login · Register — horizontal top nav desktop, hamburger on mobile with Login/Register pinned visible even when the menu is collapsed (they're the primary conversion actions for anonymous visitors).

**User:** Dashboard · Resources · Requests · Matches · Notifications · Contributions · Profile — left sidebar desktop/laptop; mobile uses a 5-item bottom tab bar (Dashboard, Resources, Requests, Matches, Profile) + a Notifications icon in the top bar, since seven items don't fit a mobile tab bar.

**Organization:** adds a distinctly grouped Organization section beneath personal nav (Org Dashboard, Verification, Org Requests, Received Resources, Org Impact) — never merged into personal nav items, so the acting context is always clear.

**Admin:** a **separate shell** entirely (Section 28) — Dashboard, Users, Organizations, Resources/Requests, Reports, Categories, Analytics — with a persistent visual signal (distinct header treatment) that this is a different operational context, not "the public app with a few extra buttons."

---

## 24. Dashboard

Dawwarha dashboards read like Linear/Stripe-grade modern SaaS product dashboards — never a generic admin template.

- **KPI cards:** top row, 2–4 cards (Active Resources, Active Requests, Pending Matches, Completed Transfers), numeral + label + optional trend. Neutral surface — not Warm Sand (reserved for Impact context only).
- **Activity:** recent-activity feed using the NotificationItem pattern.
- **Matches:** preview grid/scroll of top pending matches, linking to the full Matches screen.
- **Resources / Requests:** compact preview list of the user's own active listings.
- **Notifications:** condensed preview (3–5 items) + "View all."
- **Contributions / Impact:** a single ImpactCard, Warm Sand-accented, since this is specifically an Impact-context surface.
- **Empty:** a brand-new user's dashboard leads with "Publish your first resource" rather than a grid of zeroed-out KPI cards.

---

## 25. Trust & Verification

| State | Treatment |
|---|---|
| Verified user/org | VerificationBadge (Section 13) inline with the name everywhere it appears |
| Pending verification | Warning "Pending Verification" badge, shown only on the org's own dashboard — never to other users browsing, since a pending org isn't yet trust-established |
| Rejected verification | Shown only to the org itself and Admins, with the required rejection reason displayed plainly and a resubmission path |
| Reports | ReportStatus (Section 13); reporters see only their own report's status, never the outcome details of action against another user |
| Suspicious activity | Never surfaced to end users — Admin-only moderation signal (Section 28); a public flag on a profile would itself be an abuse vector |
| Moderation | Fully contained within the Admin shell |
| Reputation | Shown via the factual ImpactCard/ContributionCard record, not a numeric star rating — consistent with the anti-gamification stance (Section 27) |

Every trust-related badge or status has a plain, one-sentence-explainable meaning — never a purely decorative "official" stamp.

---

## 26. Handover UX

The two-sided confirmation model (FR-013) is made structurally visible.

| Stage | Treatment |
|---|---|
| Match Accepted | Lifecycle advances to "Accepted"; handover record created; "Next: coordinate the handover" prompt; counterpart contact now revealed |
| Coordination | Simple status panel with both parties' names/contact and any coordination notes — not a full messaging system in the MVP |
| Handover Started | Lifecycle shows "In Handover"; both sides see a large, unmistakable "Confirm Handover" primary action |
| Provider Confirmation | Provider's side of a **two-part independent indicator** fills; seeker sees "Waiting on your confirmation" |
| Seeker Confirmation | Mirror of the above |
| Completed | Lifecycle advances instantly once both flags are true; an unmistakable success state renders — never a silent status-badge-only change |
| Impact | Final lifecycle step lights up; both parties see a link to their updated Contribution History |

> **Design Decision:** the two-sided confirmation renders as **two independent indicator dots/checks** — one per party — inside the "In Handover" step, rather than a single progress bar. A bar filling halfway could misleadingly read as "50% done"; two distinct indicators make it immediately legible that *both* sides must act independently.

---

## 27. Contribution & Impact

- **Contribution history:** reverse-chronological ContributionCard list, filterable by role (Given/Received).
- **Points:** not used, per the Product Brief's explicit anti-gamification direction (§39).
- **Completed handovers:** each links to a read-only detail view showing the full Lifecycle Timeline (Section 17) in its completed state, as a permanent record.
- **Impact metrics:** aggregate ImpactCard variants on Admin Analytics, using neutral (not Sand) treatment to match the Admin shell's operational tone.
- **Community outcomes:** communicated as a credible, factual count of real completed transfers — never streaks, levels, or badges beyond VerificationBadge.

---

## 28. Admin Design

The Admin shell is **visually distinct** from the public/user experience while reusing the same underlying tokens and primitives (never a different color system).

### How it differs

- **Header:** a denser, distinct header treatment (darker neutral background or an inverted header) signals "you are in an operational context."
- **Density:** table row height drops to ~40px (from ≥56px in user-facing lists); default text steps down from Body to Small in tables.
- **Navigation:** structurally separate sidebar from the user sidebar (Section 23) — never merged.

### Contents

- **Moderation dashboard:** KPI cards for Open Reports, Pending Verifications, Recent Activity.
- **Reports:** filterable table, expands to full ReportStatus detail with a Resolve action (Dialog-confirmed).
- **Users:** searchable table, Suspend/Reactivate (Dialog-confirmed for Suspend).
- **Organizations:** table + OrganizationCard admin-review variant for the verification queue.
- **Resources / Requests:** searchable/filterable table, Remove/Flag actions.
- **Suspicious activity:** a filter/flag on the Users or Resources tables — never public-facing.
- **Verification:** inline document review + a decision form requiring a reason on rejection.
- **Audit information:** an append-only activity log per entity (who did what, when) in the detail/expanded view.

Admin prioritizes density, clarity, filtering, and operational efficiency — same tokens, leaning more on Neutral and Info, and never using Warm Sand except in the aggregate Impact KPI.

---

## 29. RTL / LTR

- **Spacing:** all spacing applied via logical properties (`margin-inline-start`, `padding-inline-end`) rather than physical `left`/`right`, so the same component code works both directions.
- **Alignment:** `text-align: start` always, never hardcoded.
- **Icons:** directional icons (arrows, "forward"/"back" chevrons, send/reply) flip in RTL; non-directional icons (category, status, check/flag/clock) do **not** flip.
- **Arrows/chevrons:** a "next" chevron points left in RTL, right in LTR — via a CSS logical transform tied to `[dir]`, not duplicated assets.
- **Numbers:** Western Arabic numerals throughout (Section 5), rendered LTR-internally per standard bidi behavior even within RTL flow.
- **Dates:** locale date convention; numerals stay Western Arabic.
- **Mixed Arabic/English:** relies on native Unicode bidi; `<bdi>` used only for rare embedded-Latin-in-Arabic cases.
- **Tables:** column order mirrors in RTL (first column becomes rightmost).
- **Forms:** label-above-control is direction-agnostic; inline field pairs (availability start/end) reverse order in RTL to preserve chronological reading order.
- **Navigation:** sidebar mirrors to the opposite physical side in RTL (not just text alignment) — a true layout mirror.

**Do not blindly mirror every visual element:** status badge icons, category icons, and the MatchScore checkmarks/crosses stay fixed-orientation in both directions since they carry no inherent directionality.

---

## 30. Accessibility

Target: **WCAG 2.2 AA**.

- **Semantic HTML:** real `<button>`, `<a>`, `<nav>`, `<main>`, `<header>`, `<form>` — never a styled `<div onClick>`.
- **Keyboard navigation:** every interactive element reachable and operable by keyboard alone; card-as-link uses one focusable wrapper, not nested duplicate stops.
- **Focus states:** the 2px `primary-600` ring (Section 12) is never suppressed without an equivalent replacement, on every focusable element including custom components.
- **Screen readers:** meaning-bearing icons get `aria-label`; decorative icons get `aria-hidden="true"`.
- **Labels:** every control programmatically labeled; icon-only buttons get `aria-label`.
- **ARIA:** enhances semantic HTML, never replaces it; custom components follow WAI-ARIA APG patterns.
- **Contrast:** all text/background and UI-boundary pairs meet AA (Section 4).
- **Error announcements:** `aria-live="polite"` or `aria-describedby` linkage, not visual-only.
- **Status announcements:** toasts/banners use `role="status"` or `role="alert"` per urgency.
- **Touch targets:** minimum 40×40px on every interactive element, not just buttons.
- **Dialogs:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus-trapped, `Escape`-closable, focus returns to trigger.
- **Reduced motion:** honored globally (Section 10).

---

## 31. Angular Architecture

```
src/app/shared/
├── ui/                        ← Primitive Components (Section 12)
│   ├── button/
│   ├── input/
│   ├── select/
│   ├── dialog/
│   ├── toast/
│   ├── badge/
│   ├── card/
│   └── skeleton/
│
├── components/                ← Domain Components (Section 13)
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

**Primitive Components** (`ui/`) know nothing about Dawwarha's product domain — a `Button`, `Input`, or `Badge` would fit any product. They expose generic variant/size/state APIs (Section 33).

**Domain Components** (`components/`) are Dawwarha-specific compositions of primitives that understand product concepts — a `ResourceCard` knows what "category" and "availability window" mean; internally it's built from `Card`, `Badge`, and typography primitives, never raw HTML re-implementing what a primitive already solves.

This mirrors the system architecture: Tokens → Primitives → Composites → Domain Components → Page Templates → Screens. A Domain Component never reaches past Composite/Primitive components to hand-roll markup a primitive already provides.

---

## 32. Tailwind Token Architecture

Tokens map into Tailwind via CSS custom properties referenced in the Tailwind theme extension — never as arbitrary values in component markup.

**Bad:**
```html
<div class="bg-[#164E41] rounded-[14px] p-[17px]">
```

**Preferred:**
```html
<div class="bg-primary rounded-card p-4">
```

- **Colors** → semantic utility names (`bg-primary`, `text-danger`, `border-border`) mapped from Section 4.
- **Spacing** → Tailwind's default spacing scale is already aligned to the 4px-step scale in Section 6; no custom spacing scale is needed beyond confirming alignment.
- **Radius** → custom-named theme values (`rounded-card` = 14px, `rounded-modal` = 18px, `rounded-pill` = 9999px) rather than relying on ambiguous default `rounded-lg`.
- **Typography** → custom `text-h1`/`text-body`/etc. utilities mapped to Section 5, rather than composing `text-4xl font-bold leading-tight` ad hoc per component.
- **Shadows** → `shadow-card-hover`, `shadow-dropdown`, `shadow-modal` named per Section 9.
- **Motion** → `duration-fast/base/slow` and `ease-standard/emphasized` as custom theme values (Section 10).

The design system actively **discourages**: arbitrary colors, arbitrary spacing, arbitrary radius, and duplicated styles — all four are named explicitly in Section 36 (Anti-Patterns) and Section 37 (AI Rules). All custom tokens live in a single centralized token file that both Tailwind config and any Angular-side TypeScript constants import from — one source, never two hand-synced copies.

---

## 33. Component API Rules

- **Inputs:** typed and minimal; domain components use domain-meaningful names (`status: ResourceStatus`), primitives use generic names (`variant`, `size`).
- **Outputs:** named as clear events (`(accept)`, `(reject)`, `(statusChange)`).
- **Variants:** a fixed, documented enum per component — never an open string prop inviting ad hoc values.
- **Sizes:** `sm | md | lg` consistently across every primitive with a size concept — never a component-specific vocabulary.
- **States:** loading/disabled/error exposed as explicit boolean or enum inputs, never inferred from the absence of other inputs.
- **Composition:** prefer content projection (`<ng-content>`) for flexible content over an ever-growing list of config inputs.
- **Accessibility:** built into the primitive by default (e.g. `Dialog` always sets `role="dialog"` and manages its own focus trap) — consuming code never needs to remember to add it.

Avoid components with huge numbers of unrelated inputs: if a component's API is trying to serve multiple distinct use cases, split it into variants or separate components.

---

## 34. Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Angular components | `kebab-case` selector, `PascalCase` class | `<app-resource-card>` / `ResourceCardComponent` |
| Primitive components | Generic, no domain prefix | `ButtonComponent`, `BadgeComponent` |
| Domain components | Domain-noun names | `ResourceCardComponent`, `MatchScoreComponent` |
| Design tokens | `category-role[-modifier]` | `primary-600`, `space-4`, `radius-lg` |
| CSS/Tailwind classes | Semantic utility names, not raw values | `bg-primary`, `rounded-card` |
| Variants | `lowerCamelCase` string literal union | `variant: 'primary' \| 'secondary' \| 'ghost' \| 'destructive'` |
| States | Boolean/enum props named for the state | `isLoading`, `isDisabled`, `status: 'pending' \| 'verified' \| 'rejected'` |
| Files | `kebab-case`, one component per folder | `resource-card/resource-card.component.ts` |
| Angular selectors | Prefixed `app-` | `app-match-card` |

Naming is predictable enough that an AI coding agent generating a new domain component can infer the correct file path, selector, and token names from this table without asking.

---

## 35. Page Templates

Templates describe page **anatomy**, not pixel-specific designs.

| Template | Anatomy |
|---|---|
| **Landing** | Header nav → Hero (value prop + primary CTA) → How-it-works (3-step) → Category highlights → Footer |
| **Browse** | Header nav → Filter bar (Section 21's chip/dropdown pattern) → Result count → Card grid → Load More/pagination → Empty state if no results |
| **Detail** | Breadcrumb/back → Title + status/urgency badges → Full metadata → Full description → Provider/requester info (+VerificationBadge) → Primary action |
| **Authentication** | Centered single-column form, minimal chrome, logo + short value line above the form |
| **User Dashboard** | Sidebar nav → KPI row → Activity/Matches/Resources/Requests preview sections → Notifications preview → Impact summary |
| **Organization Dashboard** | Same as User Dashboard + an Org-context banner/header + Org-specific sections (Standing Requests, Received Resources) |
| **Admin Dashboard** | Admin shell header → Admin sidebar → KPI row → Recent activity/queues |
| **Create Resource** | Guided multi-section form → sticky/bottom Publish action → draft-save affordance |
| **Create Request** | Mirror of Create Resource, request-specific fields |
| **Matches** | Header + status filter → MatchCard list → empty state if none |
| **Notifications** | Reverse-chronological NotificationItem list, mark-as-read |
| **Profile** | Editable form (Section 19 patterns) → Save action → VerificationBadge display where applicable |
| **Contribution History** | Filter (Given/Received) → ContributionCard list → ImpactCard summary at top |
| **Moderation** | Admin shell → tabbed/sidebar-filtered table views (Reports/Users/Organizations/Resources/Requests, Section 28) |

---

## 36. Design Anti-Patterns

Not to be used unless explicitly, deliberately approved and documented as a **Design Decision**:

- Bootstrap-like UI (generic form/button styling with no distinctive identity)
- Generic Angular Material styling applied unmodified
- Random gradients
- Excessive glassmorphism
- Excessive shadows anywhere (Dawwarha is border-first, Section 9)
- Random/arbitrary colors outside the token system
- Inconsistent border radii within one component
- Excessive rounded pills (fully-rounded is reserved for badges/avatars/chips, not general containers)
- Decorative animations that don't communicate a state change
- Giant hero sections on every page (reserved for Landing only)
- Unnecessary cards (Admin tables exist precisely so not everything becomes a card, Section 12)
- Color-only status communication anywhere
- Inconsistent RTL handling (partial mirroring, physical instead of logical spacing)
- Duplicated component implementations (a second, slightly different Card built ad hoc instead of reusing the primitive)
- Arbitrary Tailwind values (`bg-[#...]`, `p-[17px]`) in place of tokens

---

## 37. AI Coding Agent Rules

1. Reuse existing components before creating new ones.
2. Reuse existing design tokens before creating new tokens.
3. Never invent random colors.
4. Never use arbitrary spacing when a token exists.
5. Never bypass accessibility.
6. Never introduce a new visual pattern without justification.
7. Preserve RTL/LTR (Section 29).
8. Preserve responsive behavior (Section 8).
9. Never replace Dawwarha's design language with generic Material/Bootstrap UI.
10. Keep loading, empty, success, and error states consistent (Sections 20–22).
11. Use domain components where appropriate (Section 13) rather than composing primitives from scratch each time.
12. Do not create duplicated UI implementations.
13. Do not add decorative UI that doesn't improve the user experience.
14. If a new design decision is required, document it in `DESIGN.md`.

### Decision hierarchy

```
Existing Component
        ↓
Existing Pattern
        ↓
Existing Token
        ↓
Existing Design Principle
        ↓
New Design Decision
        ↓
Document the Decision
```

An agent facing an undocumented case works down this hierarchy in order — reuse before reinvention at every step — and only writes a new **Design Decision** into this file when every step above it genuinely doesn't apply.

---

## 38. Do / Don't

**DO**
- Use the semantic `primary` token for the dominant action, maintain a visible focus state, and preserve the defined button height and spacing tokens.
- Show the full match-score breakdown inline, never behind a click.
- Pair every status/urgency indicator with an icon and a text label.
- Build every domain card from the `Card` primitive, not hand-rolled markup.
- Use logical CSS properties (`margin-inline-start`) instead of physical (`margin-left`) for anything spacing-related.

**DON'T**
- Say "make it modern" — say what token, component, and state to use.
- Use a raw hex value or an arbitrary Tailwind bracket value in component markup.
- Show a match score without its breakdown.
- Convey urgency, status, or verification through color alone.
- Mirror every element blindly when switching to RTL — only directional elements flip (Section 29).

---

## 39. Design Token Reference

### Colors (semantic)

| Token | Maps to |
|---|---|
| `background` | `neutral-50` `#F8FAF9` |
| `surface` | `neutral-0` `#FFFFFF` |
| `surface-muted` | `neutral-100` `#F2F5F3` |
| `border` | `neutral-200` `#DCE3E0` |
| `text-primary` | `neutral-900` `#17211E` |
| `text-secondary` | `neutral-700` `#394640` |
| `text-muted` | `neutral-500` `#66756F` |
| `primary` | `primary-600` `#2F806F` |
| `primary-hover` | `primary-500` `#3F9582` |
| `primary-active` | `primary-700` `#237361` |
| `success` | `#27845F` |
| `warning` | `#B7791F` |
| `danger` | `#C94A4A` |
| `info` | `#3978A8` |

### Typography

Display 48/56 · H1 36/44 · H2 28/36 · H3 22/30 · Body 16/24 · Small 14/20 · Caption 12/18 — Section 5.

### Spacing

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96` px — Section 6.

### Radius

`6 · 10 · 14 · 18 · 24 · 9999` px — Section 9.

### Shadows

`none · sm · md · lg` — Section 9.

### Motion

`fast 120ms · base 200ms · slow 280ms`; `ease-standard · ease-emphasized` — Section 10.

### Breakpoints

`mobile <640 · tablet 640–1023 · laptop 1024–1279 · desktop 1280–1535 · large ≥1536` — Section 8.

### Z-index

| Token | Value | Use |
|---|---|---|
| `z-dropdown` | 20 | Dropdown menus, comboboxes |
| `z-sticky` | 30 | Sticky headers/nav |
| `z-drawer` | 40 | Mobile filter/nav drawers |
| `z-modal-backdrop` | 50 | Dialog backdrop |
| `z-modal` | 51 | Dialog panel |
| `z-toast` | 60 | Toast notifications (always topmost) |

---

## 40. UI Quality Checklist

**Visual**
- [ ] Typography matches the defined scale (Section 5)
- [ ] Spacing uses the token scale (Section 6), no arbitrary values
- [ ] Hierarchy is clear at a glance
- [ ] Alignment is consistent
- [ ] Colors use semantic tokens only
- [ ] Visually consistent with existing Dawwarha screens (Section 2's consistency principle)

**UX**
- [ ] Loading state implemented (skeleton or spinner, Section 20)
- [ ] Success state is explicit, never silent
- [ ] Error states implemented per Section 22's mapping
- [ ] Empty states implemented per Section 21's template
- [ ] Disabled states implemented where relevant
- [ ] Destructive/high-impact actions confirmed via Dialog

**Responsive**
- [ ] Verified at mobile, tablet, and desktop breakpoints
- [ ] RTL verified, not just LTR

**Accessibility**
- [ ] Fully keyboard operable
- [ ] Visible focus states on every interactive element
- [ ] Labels present on every form control and icon-only button
- [ ] Contrast checked against Section 4's AA requirements
- [ ] Screen reader tested for status/error announcements
- [ ] `prefers-reduced-motion` honored

**Engineering**
- [ ] Uses existing reusable components, not duplicated markup
- [ ] Uses existing tokens, not new ad hoc values
- [ ] No arbitrary Tailwind values (`bg-[#...]`, `p-[17px]`)
- [ ] No duplicated component patterns (Section 36)

---

*This document, together with `Dawwarha-Product-Brief.pdf`, is Dawwarha's complete UI/UX source of truth. Any implementation decision not covered here is resolved per Section 37's decision hierarchy, and the resolution is recorded back into this file.*
