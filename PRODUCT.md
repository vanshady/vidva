# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cinephile Plex owners: self-hosters who collect film seriously and think about their library in terms of directors, performers, decades, and national cinemas. VIDVA is public open source (MIT, Docker Hub image `vanshady/vidva`), but the taste bar is the film lover's, not the generic media-server user's. Typical session: open the dashboard on the home network, pick a library, and read what the collection says about its owner, then drill into a director, actor, decade, genre, or country to see the titles behind a number.

TV libraries are supported (since 1.2.0) and must keep working, but movie libraries are the primary case.

## Product Purpose

VIDVA computes Letterboxd-style statistics over a Plex library so the owner can see a portrait of what they own: who they collect, which eras and countries dominate, how many hours the collection holds. Success means the stats are accurate to the Plex metadata, load fast enough on large libraries (hundreds to low thousands of titles), and every aggregate leads to the concrete titles behind it.

## Positioning

A portrait of the owned collection, not of viewing activity. Tautulli and Plex's own stats report watch history; Letterboxd profiles describe what someone has watched. VIDVA answers "what kind of collector am I" from the library itself, with film-literate counting conventions (for example, counting only the top 3 billed cast as Plex does, or top 4 as Letterboxd does).

## Operating Context

- Runs as a static single-page app served by Caddy inside a Docker container on a home server (Unraid, Synology Container Manager, and similar). Port 5173.
- The browser talks to the Plex Media Server HTTP API directly. Config comes from env vars (`PLEX_SERVER_URL` or `PLEX_URL`, `PLEX_TOKEN`, `PLEX_SERVER_ID`, `VIDVA_DEFAULT_TOP_CAST_COUNT`) substituted into the built bundle at container start by `env.sh`.
- View state (selected library, top-N cast count, expanded counts) lives in URL search params so views are linkable within the household.
- Data quality depends entirely on Plex agent metadata (genre, country, director, role tags, year, duration).

## Capabilities and Constraints

Current capabilities:
- Library selector across Plex movie and TV sections.
- Overview: total items/shows and total duration (human-readable months/weeks/days plus hours).
- Directors and cast: ranked portrait grids with title counts and progressive "see more". For TV, people are counted per episode and the directors section hides when empty.
- Decades, genres, countries: ranked bar charts.
- Drill-down pages per director, cast member, genre, country, and decade showing the matching titles as a poster grid.
- Top-N cast counting: all, top 3 (Plex), top 4 (Letterboxd), top 5, top 10.

Constraints:
- **LAN/private, read-only.** The Plex token is present in the client bundle, so VIDVA assumes a trusted network, no auth, and no backend. It never writes to Plex. Do not design features that imply public exposure or sharing outside the home network without first revisiting this constraint.
- No server-side component: all aggregation happens in the browser from Plex metadata fetched in comma-batched requests.
- Stack: React 19, Vite, TypeScript, Mantine 7, Chart.js, TanStack Query, React Router 7.

Terminology: "films" for movie libraries; "shows" and "episodes" for TV libraries.

## Brand Commitments

- Name: VIDVA (rendered in caps in the header).
- Logo: `public/logo.png`, an orange V mark, also used as the favicon.
- Open source under MIT; contribution guidelines in `CONTRIBUTING.md` ask for screenshots in `screenshots/` for UI changes.

## Evidence on Hand

- `screenshots/screenshot.png`: real dashboard capture of a 666-title movie library (64,155 hours) with directors such as Agnès Varda, Frank Capra, and Alice Guy-Blaché.
- No user counts, testimonials, Docker pull numbers, or press exist in the repo. Do not fabricate any.

## Product Principles

1. **The collection is the subject.** Every view describes what the owner holds; watch activity and recommendations are out of scope unless deliberately added.
2. **Numbers lead to films.** Every aggregate is a door to the titles behind it.
3. **Count like a cinephile.** Prefer conventions film lovers already use (billing order, Letterboxd norms, directors and national cinemas as first-class dimensions) over generic media-server categories.
4. **Stay a static, private, read-only appliance.** Zero backend, env-configured, safe only on a trusted network; new features fit inside that shape or explicitly change it.
5. **Honest to the metadata.** Show what Plex reports, handle missing tags gracefully, and never invent data to fill a chart.
