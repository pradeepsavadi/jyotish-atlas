# Navagraha Orrery — Hero 3D Experience

**Date:** 2026-06-18
**Status:** Approved direction (per "Antariksha" elevation pitch), implementing now.
**Scope:** Replace the static hero emblem with a living 3D Navagraha orrery; snap it to the user's real sky when a chart is active.

---

## 1. Goal

The signature "wow" moment: the homepage hero becomes a **living, geocentric orrery** — the nine Grahas orbiting a luminous core (the observer/Earth — Jyotish is geocentric) on the warm-dark field, gold-leaf emblems catching light over a drifting starfield. The instant a chart is active, **the nine planets ease to their actual ecliptic positions** and a Lagna marker appears: the idle cosmos becomes *your* sky.

This is the demo that sells the whole redesign.

## 2. Non-negotiable constraints (unchanged from the redesign)

- **Single file, offline, zero dependencies.** No WebGL library, no Three.js, no network. The orrery is **pure CSS 3D + Canvas 2D + vanilla JS**. (WebGL was considered and rejected: ~600KB and breaks the offline/single-file promise for one scene.)
- **Never touch the astrology math.** The orrery only *reads* chart data via the existing `JA.getActiveChart()`; it computes nothing astrological. `#selftest` must stay ✅ 13/13.
- **Accessible & performant.** Decorative (`aria-hidden`); 60fps budget; one `requestAnimationFrame` loop, paused offscreen via `IntersectionObserver`; honors `prefers-reduced-motion`; graceful fallback to the existing `grahaEmblem('Su')` SVG.

## 3. Data contract (read-only)

- `JA.getActiveChart()` → `null` or a chart `c` with `c.planets[k] = {sign:0–11, deg:0–30}` for `k ∈ {Su,Mo,Ma,Me,Ju,Ve,Sa,Ra,Ke}` and `c.La = {sign, deg}` (Lagna).
- **Ecliptic longitude** of a body = `sign*30 + deg` (degrees, 0 = Mesha/Aries start).
- Subscribe to chart changes by chaining `JA.onChartsChange` (preserve any previous handler, as other modules do).

## 4. Visual & interaction design

- **Core:** a radiant gold core at center (the seer/Earth), soft pulsing glow (static under reduced-motion).
- **Ecliptic ring:** a perspective-tilted ellipse (faked via `Ry = Rx·cos(tilt)`, ~0.46) with 12 faint sign ticks.
- **Nine Graha nodes:** each rendered with the existing `grahaEmblem(k)` (ties to the design system), tinted glow from `GBYK[k].col`. Depth cues by orbital position: nodes toward the front are larger, brighter, higher `z-index`; toward the back smaller and dimmer.
- **Idle motion:** planets drift at individual rates (outer slower), the ring rotates slowly.
- **Chart-snap:** when a chart is active, each node eases (shortest-angle) to its ecliptic longitude on the ring; a gold **Lagna (Asc)** marker appears at `c.La` longitude; idle drift quiets so the sky holds.
- **Parallax:** the ellipse center and tilt lean subtly toward the cursor, spring-eased. Disabled under reduced-motion.
- **Starfield:** ~80 Canvas 2D stars, gentle twinkle + drift; drawn once under reduced-motion.

## 5. Fallback ladder

1. Small screens (`< 760px`) or init failure → existing `grahaEmblem('Su',{size:190,focus:true,bija:'सू'})` (current behavior).
2. `prefers-reduced-motion` → orrery renders **once, static** (planets placed, no rAF, no twinkle, no pulse).
3. Otherwise → full animated orrery.

## 6. Implementation surface

- **CSS:** a `/* == ORRERY == */` block (after the EMBLEMS region).
- **JS:** an `initOrrery()` function replacing the current hero-emblem mount (the single `insertAdjacentHTML` at the `#heroEmblem` line); self-contained, guarded, idempotent.
- **Markup:** built by JS inside the existing `<div id="heroEmblem">` — no new section, no anchor changes.
- One file (`index.html`); no other module touched except adding the orrery's `JA.onChartsChange` chain.

## 7. Success criteria

- Hero shows a smooth, beautiful orrery on capable devices; clean SVG fallback elsewhere.
- Loading/activating a chart visibly snaps the nine planets to their real longitudes + shows the Lagna marker, within one ease.
- 60fps, pauses when scrolled away, no animation under reduced-motion.
- `#selftest` still ✅ 13/13; no astrology logic changed; offline single-file intact.

## 8. Non-goals

- No full WebGL scene, no per-planet textures/shaders, no audio (these are future "Antariksha" phases).
- No new astrological computation; the orrery never decides positions, it only renders `JA.getActiveChart()`.
- Not wiring every section to 3D yet — this spec is the hero moment only.
