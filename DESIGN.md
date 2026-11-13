---
name: VIDVA
description: A dark, single-accent stats dashboard that reads a Plex film collection as a portrait of its owner.
colors:
  logo-orange: "#F2762E"
  logo-orange-light: "#F6813F"
  ground: "#111318"
  sidebar: "#0C0E12"
  card: "#1C1F26"
  card-hover: "#232731"
  hairline: "#2A2E37"
  hairline-strong: "#6B7280"
  ink: "#E5E7EB"
  ink-soft: "#C9CDD4"
  muted: "#9CA3AF"
typography:
  stat:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1, 'cv11' 1"
  headline:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.55
    fontFeature: "'tnum' 1, 'cv11' 1"
  label:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  bar: "3px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  card-x: "20px"
  page-x: "32px"
  page-top: "28px"
  page-x-mobile: "16px"
components:
  section-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "18px 20px 16px"
  stat-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px 18px"
  stat-card-hover:
    backgroundColor: "{colors.card-hover}"
  ranked-row-person:
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "6px 8px"
    height: "56px"
  ranked-row-category:
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "4px 8px"
    height: "34px"
  ranked-row-hover:
    backgroundColor: "{colors.card-hover}"
  bar-track:
    backgroundColor: "{colors.hairline}"
    rounded: "{rounded.bar}"
    height: "6px"
  bar-fill:
    backgroundColor: "{colors.logo-orange}"
    rounded: "{rounded.bar}"
  person-avatar:
    rounded: "{rounded.full}"
    size: "44px"
  sidebar:
    backgroundColor: "{colors.sidebar}"
    width: "220px"
  nav-link:
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
  nav-link-active:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
  mobile-tab:
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  mobile-tab-active:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
  search-input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    width: "320px"
  poster-frame:
    backgroundColor: "{colors.card-hover}"
    rounded: "{rounded.md}"
---

# Design System: VIDVA

## Overview

**Creative North Star: "The Collector's Ledger"**

VIDVA is a stats dashboard built at the craft level of Linear or Vercel and framed the way Letterboxd frames a film life. It keeps the dashboard convention (sidebar, stat cards, ranked lists, bar charts) and spends its effort on precision inside it: a dark graphite ground, flat cards separated by one hairline, Inter with tabular figures so every column of counts aligns, and a single orange taken from the logo that marks everything quantitative or actionable. Faces carry the personality. Directors and performers appear as round portraits beside their counts, so the collector recognizes their taste before reading a number.

Density is that of a working tool read closely on a laptop in the evening: 14px body, 34px category rows, 56px person rows, 16px gutters, content filling the full width beside a fixed 220px sidebar. Every number is a link to the films behind it; hover states confirm that without decoration. Charts are HTML and CSS bars, never canvas, so they share the type, color, and focus behavior of the rest of the page.

**Key Characteristics:**
- Graphite ground (#111318) with flat #1C1F26 cards and 1px #2A2E37 hairlines; no shadows at rest.
- One accent, logo orange, for bars, links, focus rings, selection and the active-nav icon.
- Inter Variable throughout, tabular figures globally, weights 500 to 650.
- Ranked rows: right-aligned rank, optional portrait, name, 6px bar, count.
- Charts built from HTML elements; every bar and count is a link.

## Colors

A cool graphite neutral ramp carrying one warm signal color; the orange is the only hue on screen besides portraits and posters.

### Primary
- **Logo Orange** (#F2762E): the single accent. Fills every bar (ranked-row fills, decade columns), colors links and the "All N" card actions, draws the 2px focus outline, tints text selection at 35% alpha, colors the active sidebar icon, and underlines the active mobile tab. Mantine's `vidva` tuple, shade 5, is the source.
- **Logo Orange Light** (#F6813F): the hover lift of a decade bar and the highlighted leader name inside a stat card's subline ("led by **Agnès Varda**"). It is a state of the accent, not a second accent.

### Neutral
- **Graphite Ground** (#111318): page and main-area background.
- **Sidebar Black** (#0C0E12): sidebar and mobile header, one step below the ground so the navigation recedes.
- **Card Graphite** (#1C1F26): section cards, stat cards, active nav item, active mobile tab, inputs.
- **Raised Graphite** (#232731): hover fill for rows and linked stat cards; poster placeholder fill.
- **Hairline** (#2A2E37): every 1px border (cards, sidebar edge, poster frames, decade baseline) and the empty bar track.
- **Hairline Strong** (#6B7280): border of a linked stat card on hover.
- **Ink** (#E5E7EB): names, counts, headings, stat values.
- **Ink Soft** (#C9CDD4): poster fallback titles.
- **Muted** (#9CA3AF): labels, ranks, metadata, idle nav links, decade labels, explanatory notes.

### Named Rules
**The One Signal Rule.** Logo orange is the only accent and it means "quantity or action": a bar, a link, a focus ring, a selection, the current section. Never use it as a fill for surfaces, headings, or decoration, and never introduce a second hue for categories; bars stay one color and the label tells them apart.

**The Pure White Is Hover Rule.** Ink (#E5E7EB) is the resting text color. Pure white appears only as the hover color of a ranked-row name and on selected text.

## Typography

**Display Font:** Inter Variable (bundled via @fontsource-variable/inter, falling back to Inter, system-ui)
**Body Font:** Inter Variable
**Label/Mono Font:** none; figures use Inter's tabular numerals.

**Character:** One neutral grotesque at tight sizes, with `cv11` (single-storey a) and tabular figures switched on at the root. Hierarchy comes from weight and size steps of a few pixels, not from a second family.

### Hierarchy
- **Stat** (650, 30px, 1.15, -0.02em): the big number in each stat card. The only negatively tracked text.
- **Headline** (600, 24px, 1.25): the page title (h1) in the page header.
- **Title** (600, 15px, 1.4): section card titles (h2). Deliberately close to body size; the card border does the separating.
- **Body** (500, 14px): row names and counts (counts at 600), nav links, search results. Person rows step names and counts up to 15px.
- **Label** (400, 13px): stat-card labels, card actions ("All 612", weight 500), poster titles, rank numerals in person rows.
- **Caption** (400, 12px): ranks in category rows, poster year/meta, stat sublines (12.5px), sidebar library footer, explanatory notes. Decade counts and labels go to 11.5px and 11px.

### Named Rules
**The Tabular Rule.** `font-variant-numeric: tabular-nums` is set on `body`; every count, rank, and stat aligns in columns. Never switch to proportional figures for a number that sits in a list.

**The Sentence Case Rule.** All labels, titles, and nav items are sentence case at normal tracking. The logo wordmark "VIDVA" (700, 16px, 0.06em) is the only uppercase, tracked text in the system.

## Layout

A fixed 220px left sidebar beside a fluid content area. The content has no max-width: it fills the viewport, with padding of 28px top, 32px sides, 64px bottom. The page header (title left; search and library select right, wrapping below on narrow widths) sits 28px above the content.

The overview grid is four stat cards in a row (two per row below the `md` breakpoint), then a two-column grid of section cards (one column below `md`), all on a 16px gutter. A card can span both columns (the Countries card), which then splits its own list into two columns 32px apart. The overview shows the top 10 per dimension, and 15 for Genres; each card links to its full index page.

Poster grids auto-fill 132px-minimum columns with 20px row and 14px column gaps, dropping to 104px minimum with 16px by 10px gaps on mobile.

Below the `sm` breakpoint (48em) the sidebar collapses. A 104px header holds the logo row (52px) and a horizontal tab strip; content padding becomes 20px top, 16px sides, 48px bottom. The tab strip scrolls, centers the active tab on load, and fades only the edge that has more tabs beyond it (40px mask).

## Elevation & Depth

Flat. Depth comes from tonal layering of the graphite ramp: sidebar (#0C0E12) below ground (#111318) below cards (#1C1F26) below hover fills (#232731), with 1px hairlines doing the separating. There are no drop shadows anywhere in the build. The only shadow value is an inset 2px orange underline on the active mobile tab, which is an indicator, not elevation. Motion is limited to 150ms color/border transitions and a 2px lift on poster hover (200ms, cubic-bezier(0.16, 1, 0.3, 1)), all disabled under `prefers-reduced-motion`.

### Named Rules
**The Hairline Not Shadow Rule.** Separate surfaces with a 1px #2A2E37 border and a tonal step. A new surface that seems to need a shadow needs a darker or lighter graphite instead.

## Shapes

Softly rounded rectangles on three steps: 12px for cards (section and stat), 8px for interactive rows, nav items, tabs, inputs, and poster frames, 6px for small elements such as the logo hit area and decade columns. Bars are 6px tall with 3px rounded ends; decade columns round only their top corners (4px) and stand on a hairline baseline. Portraits are full circles: 44px in ranked rows, 64px in the person-page header. Posters keep a 2:3 frame.

## Components

### Cards / Containers
Quiet frames that let the data carry the color.
- **Corner Style:** 12px.
- **Background:** Card Graphite on the Graphite Ground.
- **Shadow Strategy:** none; see Elevation & Depth.
- **Border:** 1px Hairline.
- **Internal Padding:** section card 18px 20px 16px; stat card 16px 18px.
- **Section card header:** title (15px/600) left, optional meta and controls, a right-aligned orange "All N" link (13px/500) to the full index; 12px gap above content.
- **Stat card:** muted 13px label, 30px/650 value, 12.5px muted subline whose leader name is Logo Orange Light. When linked, hover raises the background to Raised Graphite and the border to Hairline Strong (150ms).

### Ranked Rows (signature component)
The core reading unit for directors, cast, genres, and countries.
- **Grid:** rank (22px, right-aligned, muted) / portrait (people only) / name / bar / count (52px, right-aligned, 600).
- **Person rows:** 56px tall with 44px round portraits (initials fallback), 15px name and count, 13px rank, 14px gaps.
- **Category rows:** 34px tall, no portrait, 14px name and count, 12px rank, 12px gaps.
- **Bar:** 6px track in Hairline, Logo Orange fill scaled to the largest count in the full set so bars compare across pages; minimum 2px fill.
- **Hover:** whole row fills Raised Graphite, name turns white. The entire row is one link with an aria-label stating name and count.
- **Rank:** omitted when the list is not sorted by count.
- **Mobile:** person rows drop the bar; category rows narrow it to 30%.

### Decade Bars
Vertical HTML columns, one per decade, sharing the row's color logic.
- Logo Orange columns with 4px top corners, count label (11.5px/600) above, decade label (11px, muted) below a hairline baseline; minimum height 236px (200px mobile).
- Hover lightens the column to Logo Orange Light and the label to Ink. Each column is a link to that decade's films.
- On mobile, every other decade label is hidden to prevent collisions.

### Inputs / Fields
- **Search:** Mantine text input, 320px on desktop and full width on mobile, 8px radius, search icon left and a `/` key hint right; `/` focuses it from anywhere. Results drop down grouped under Directors and Cast, six each, with a muted count per result.
- **Focus:** the global 2px Logo Orange outline at 2px offset (applies to every focusable element).
- **Segmented controls:** Mantine SegmentedControl for sort order, top-N cast counting, and A–Z/by-year toggles.

### Navigation
- **Sidebar:** 220px, Sidebar Black, hairline right edge. Logo (26px mark plus "VIDVA" wordmark) at top; six links (Overview, Directors, Cast, Decades, Genres, Countries) at 500 weight in Muted with 18px stroke-1.6 Tabler icons. Active link: Card Graphite fill, Ink text, Logo Orange icon. A footer, above a hairline, names the Plex library and its title count.
- **Mobile tab strip:** text-only tabs (14px/500, 8px 12px, 8px radius); active tab gets Card Graphite fill, Ink text, and a 2px orange inset underline.
- **Breadcrumbs:** muted 14px links above the page title on detail pages.

### Poster Grid
- 2:3 frames, 8px radius, hairline border, Raised Graphite placeholder; when no image exists, the title sits bottom-left in Ink Soft over a dark gradient.
- Hover: border turns Logo Orange and the frame lifts 2px.
- Watched ribbon: a 30px Logo Orange right triangle clipped into the top-right corner with a 12px Sidebar Black check, after Plex's corner marker. Films show it once viewed; shows only when every episode is watched. It is the one status use of the accent, permitted because it sits on the poster image, never on a surface.
- Title (13px/500, two-line clamp) and year (12px, muted) sit below the frame.

## Do's and Don'ts

### Do:
- **Do** keep Logo Orange (#F2762E) as the only accent, reserved for bars, links, focus, selection, and the current section.
- **Do** separate surfaces with a 1px #2A2E37 hairline and a graphite tonal step instead of shadows.
- **Do** make every count, bar, and row a link to the titles behind it, with the whole row as the hit area.
- **Do** build charts from HTML/SVG elements styled with the same tokens as the rest of the page.
- **Do** keep tabular figures on every number and right-align count columns.
- **Do** show people with round portraits (44px in rows, 64px on their page) and an initials fallback.
- **Do** scale bars to the largest count in the full set, not the visible page.

### Don't:
- **Don't** render charts on canvas.
- **Don't** add a second accent hue or color-code categories; one orange, labels tell rows apart.
- **Don't** add drop shadows to cards, rows, or menus at rest.
- **Don't** put uppercase tracked labels above titles; sentence-case titles carry each card on their own.
- **Don't** cap the content width; the dashboard fills the viewport beside the sidebar.
