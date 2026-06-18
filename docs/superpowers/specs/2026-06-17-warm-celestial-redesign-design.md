# Jyotish Atlas — "Warm Celestial" Redesign

**Date:** 2026-06-17
**Status:** Approved design, ready for implementation planning
**Scope:** Full visual + UX overhaul of `index.html`, built in phases.

---

## 1. Goal

Elevate Jyotish Atlas from a capable teaching tool into a distinctive, beautiful,
intuitive primer to Vedic astrology — drawing inspiration from align27's guides but
clearly surpassing it in visual identity, iconography, and depth of interpretation.

Three pillars:
1. **A warm, mystical, manuscript-grade visual system** ("Warm Celestial").
2. **Vedic-rooted illuminated iconography** for the Grahas and Rashis that visibly beats align27.
3. **In-depth authored interpretation** baked into the file.

All without breaking the project's core promise: **a single self-contained `index.html`,
no install, no build step, fully functional offline, with validated astrology math.**

---

## 2. Hard constraints (non-negotiable)

- **Single file.** Everything stays inside `index.html`. No external CSS/JS/image
  requests at runtime, no bundler, no `npm install`.
- **Offline.** No network calls for content or interpretation. All interpretation text is
  authored into the file. (Existing Google-Fonts fallback in the font stack is retained;
  the site must remain fully usable if fonts fail to load.)
- **Preserve validated logic.** Do not alter the verified computation: Navamsa/D-9
  (`NAV_START = [Aries, Capricorn, Libra, Cancer]`), BAV / Sarvashtakavarga tables,
  Nakshatra (`floor(lon / 13°20')`, pada `floor(remainder / 3°20')+1`), and the
  JHora/Parashara's Light `.txt` chart parser. These are tested against real charts and
  must keep passing.
- **Approach:** *in-place evolution* of the existing markup/CSS/JS — not a rewrite.

---

## 3. Visual system — "Warm Celestial"

Dark and mystical but **warm** — a candlelit-manuscript feel, not cold navy.

### 3.1 Color tokens (CSS custom properties, dark default)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#181310` | warm ink base |
| `--bg2` | `#1f1813` | secondary background |
| `--panel` | `#241b16` | cards / panels |
| `--panel2` | `#2c211b` | raised panel |
| `--line` | `#3a2e26` | borders / dividers |
| `--ink` | `#f3ead9` | primary text (warm ivory) |
| `--muted` | `#b8a78f` | secondary text (warm taupe) |
| `--gold` | `#e9bf6a` | primary accent (antique gold) |
| `--gold2` | `#f5d894` | gold highlight |
| `--terracotta` | `#d6815a` | secondary accent / warm callouts |
| `--exalt` | `#6fbf86` | exalted / favorable (warm green) |
| `--debil` | `#e2705a` | debilitated / unfavorable (warm red) |
| `--own` | `#e9bf6a` | own sign |
| `--friend` | `#7fc4ff` *(retune warmer if needed)* | friendly |
| `--enemy` | `#e2705a` | inimical |

- **Gradients:** gold→terracotta (`135deg, #e9bf6a, #d6815a`) for primary CTAs and rule lines.
- **Glow/aura:** warm radial `rgba(233,191,106,.12–.5)` behind hero/focused emblems.
- **Light theme:** keep the existing light-theme toggle working; produce a warm *daylight*
  parchment variant (parchment `#f5f1e8`, ink `#2b2620`, antique gold `#b8860b`,
  terracotta `#b5552f`) rather than the current cool light theme. Light theme is a
  secondary deliverable — dark is the primary, hero experience.

### 3.2 Typography — "Illuminated Manuscript × Cosmic Display"

- **Display/serif:** Fraunces (already loaded) — expressive, high optical contrast.
- **Body/UI sans:** Inter (already loaded).
- **Data/monospace:** existing Menlo/Consolas stack — used sparingly for degrees,
  longitudes, scores (kept subtle; not the dominant voice).
- **Devanagari:** each Graha/Rashi/Bhava paired with its Sanskrit name (e.g. `सूर्य`),
  rendered in the system/Inter Devanagari fallback (offline-safe; no new web font required).
- **Signature treatments:**
  - Oversized Fraunces headlines with italic gold emphasis on a key word.
  - **Drop-cap initials** on long interpretive passages (illuminated-book device).
  - **Wide-tracked small-caps labels** (`letter-spacing ~.2–.28em`, uppercase) for
    eyebrows/section labels.
  - Gold→terracotta gradient hairline rules as section flourishes.
- Maintain the existing type-scale variables; extend with larger display sizes for heroes.

### 3.3 Motion

- Subtle, tasteful, respects `prefers-reduced-motion`.
- A **soft animated aura/pulse** on the *focused/active* emblem (e.g. selected planet in the
  Synthesizer, hero emblem). Everything else is static SVG. No heavy particle systems.

---

## 4. Iconography — Vedic Illuminated Emblems

Hand-built inline **SVG** (crisp, themeable, offline). Foundation = "Illuminated Emblems"
with a touch of glow on focus. **Must read as authentically Vedic/Jyotish**, not Western clip-art.

### 4.1 Grahas (9)

Each Graha gets a unique gold-leaf medallion grounded in classical attributes:

| Graha | Iconographic cue |
|---|---|
| Surya (सूर्य) | rayed solar disc, molten gold→terracotta core; seven-horse/chariot motif optional |
| Chandra (चन्द्र) | pearl/soma crescent, cool silver-warm tone |
| Mangala (मंगल) | red spear/shakti, sharp triangular fire |
| Budha (बुध) | green, dual/quick line motif, scholarly |
| Guru (गुरु / बृहस्पति) | expansive gold lotus, benefic fullness |
| Shukra (शुक्र) | white-gold blossom, six-point grace |
| Shani (शनि) | dark iron ring, slow heavy band, restrained |
| Rahu (राहु) | eclipse serpent **head**, smoky shadow |
| Ketu (केतु) | serpent **tail** / flag (dhvaja), wispy |

Shared frame language: a thin gold ring + subtle engraved concentric/mandala detail so the
set feels like one illuminated series. Use a small reusable SVG "ring + bīja" frame.

### 4.2 Rashis (12)

Engraved mandala roundels, each with its classical symbol and Sanskrit name
(Mesha/मेष … Meena/मीन), element-tinted (fire/earth/air/water) within the warm palette.

### 4.3 Bhavas (12)

Lighter-weight numbered glyphs/roundels consistent with the emblem frame; can reuse the
existing Bhava mandala view, restyled.

### 4.4 Implementation note

Define emblems once as reusable SVG symbols/components (e.g. a JS map `GRAHA_EMBLEMS` /
`<symbol>` defs) so they're referenced via `<use>` across reference pages, Synthesizer,
charts, and quiz — single source of truth, small file footprint.

---

## 5. In-depth interpretation — Authored Library

Depth comes from **hand-authored classical prose baked into the file**, surfaced through the
existing synthesizer wiring (do not rebuild the synthesis engine; feed it richer content).

### 5.1 Content to author

- **9 Grahas** — rich interpretive description: nature, soul/karaka meaning, strong vs
  afflicted expression, karakatvas, body, dignity logic. (~150–250 words each.)
- **12 Rashis** — element/modality/ruler/body + interpretive character. (~120–180 words.)
- **12 Bhavas** — significations, classification (Kendra/Trikona/Dusthana/Upachaya),
  interpretive meaning. (~120–180 words.)
- **27 Nakshatras** — short authored profile per nakshatra (deity, ruler, symbol,
  temperament). (~60–100 words; some offline card data already exists — extend/curate.)
- **Key combinations** — authored notes for high-signal cases where a generic stitch is weak:
  - dignity states (exalted / debilitated / own / mūlatrikoṇa) phrasing per Graha,
  - Graha-in-Bhava emphasis lines (the 9×12 that matter most),
  - "Promise vs delivery" (D-1 dignity vs D-9) phrasing,
  - "Watch for" growth-edge notes.
- Tone: classical, grounded (Parashara's grammar), teaching-oriented, never fatalistic.
  Source from BPHS-tradition concepts; mark caveats consistent with existing README
  (naisargika friendships only; Rahu/Ketu excluded from 7-planet BAV; teaching tool, not
  a replacement for full Jyotish software).

### 5.2 Data model

- Store authored text in structured JS objects (extend existing `GRAHA`, `RASHI`, `BHAVA`
  data), keyed so the Synthesizer can assemble: atomic description + dignity line +
  bhava emphasis + navamsa note + nakshatra note + drishti note → a flowing reading.
- The reading is **assembled from authored fragments**, not generated by new rules — the
  existing engine selects which authored fragments apply; we enrich the fragments.

### 5.3 Rendering

- **Reference page** (§ mockup `reading-templates.html`, top): emblem + Sanskrit + dignity
  chips + drop-cap authored paragraph + karakatvas/nature grid.
- **Synthesizer reading** (bottom mockup): placement header (mono degrees) + layered verdict
  chips (Dignity / Navamsa / Nakshatra / Drishti) + woven authored synthesis +
  terracotta "Watch for" callout.

---

## 6. Information architecture & navigation

Replace the ~12 flat nav links with **four intuitive zones** + the existing command palette
(`⌘K`) as the power-user jump. Sticky top nav, brand mark on left, `⌘K` affordance on right.

| Zone | Sections |
|---|---|
| **Learn** | The Idea · Grahas · Rashis · Bhavas · **Nakshatras (new reference)** |
| **Synthesize** | Synthesizer · Bhavat Bhavam · Compare |
| **My Charts** | Upload · BAV · Dasha · Life Outlook · Life Predictor |
| **Practice** | Quiz |

- **Homepage hero** (§ mockup `home-hero.html`): manuscript headline with Devanagari,
  illuminated Surya emblem + aura, intro line, dual CTAs ("Begin with the Grahas",
  "Upload my chart"), and the four zone cards.
- Preserve all existing functionality reachable from these zones (toasts, share/print,
  chart compare, accessibility/skip-link, back-to-top, command palette).
- Keep deep-link anchors working (existing `#grahas`, `#synth`, etc.).

---

## 7. Build approach & component structure

**In-place evolution of `index.html`:**

1. **Design-token layer** — consolidate `:root` into the Warm Celestial tokens (§3.1) for
   both dark and light themes; route all existing component styles through tokens.
2. **Emblem system** — add reusable inline SVG symbol defs (§4.4); replace existing
   planet/sign glyphs with `<use>` references.
3. **Typography layer** — apply the manuscript/Devanagari treatments (§3.2) via shared
   classes (`.eyebrow`, `.display`, `.dropcap`, `.rule-gold`, `.devanagari`).
4. **Content layer** — extend data objects with authored interpretation (§5).
5. **Section restyle** — re-skin each section to the new system, section by section.
6. **Nav/IA** — implement the 4-zone nav, homepage hero, and the new Nakshatras reference.

Keep the file organized with clear comment-delimited regions (tokens → emblems → data →
components → sections → app logic) so it stays navigable despite being one file.

---

## 8. Phasing (each phase ships a working, reviewable file)

- **Phase 1 — Foundation:** Warm Celestial tokens (dark + warm light), typography classes,
  emblem SVG system, global chrome (nav shell, buttons, chips, cards). No content loss.
- **Phase 2 — Learn:** Homepage hero + 4-zone nav; restyle The Idea, Grahas, Rashis, Bhavas;
  add Nakshatras reference; author Graha/Rashi/Bhava/Nakshatra interpretation.
- **Phase 3 — Synthesize:** Restyle Synthesizer with layered verdict chips + woven authored
  reading (+ "Watch for"); restyle Bhavat Bhavam and Compare.
- **Phase 4 — My Charts:** Restyle Upload, BAV, Dasha, Life Outlook, Life Predictor to the
  system (visual only; computation untouched).
- **Phase 5 — Practice & polish:** Restyle Quiz; motion/aura pass; light-theme parity;
  accessibility + `prefers-reduced-motion` + print audit; cross-check validated math intact.

---

## 9. Success criteria

- Visually distinct, warm-mystical, manuscript-grade identity that clearly surpasses
  align27's guides page.
- Grahas/Rashis render as authentic Vedic illuminated emblems (not Western icons).
- Every Graha/Rashi/Bhava/Nakshatra has rich authored interpretation; the Synthesizer
  produces a layered, in-depth reading for any placement.
- Navigation reduced to 4 intuitive zones; key flows reachable in fewer steps.
- Single file, opens offline with no install; all validated computations still pass against
  the four reference charts.
- Accessible (keyboard, contrast, reduced-motion) and printable.

---

## 10. Non-goals (YAGNI)

- No build pipeline, framework, or external dependencies.
- No new astrology computation features from the README roadmap (Shadbala, Yoga recognizer,
  Vimsottari dasha clock as *new math*, North-Indian chart diagram) — unless an existing
  section already implements them, in which case they're only re-skinned.
- No live/AI-generated interpretation.
- No backend, accounts, or sync (localStorage charts remain as-is).

---

## 11. Risks & mitigations

- **Single-file size growth** (authored content + SVG). Mitigate: reusable SVG symbols via
  `<use>`; concise authored prose; structured data over repetition. Monitor file size.
- **Regression in validated math** during markup refactor. Mitigate: never touch compute
  functions; restyle is presentation-only; spot-check against the four reference charts each phase.
- **Devanagari rendering offline** varies by OS font availability. Mitigate: treat Sanskrit
  as enhancement; never the sole label — always paired with romanized name.
- **Contrast on warm-dark palette.** Mitigate: verify WCAG AA for ivory-on-ink and
  gold-on-ink; adjust tokens if needed.
