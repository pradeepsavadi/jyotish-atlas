# Warm Celestial Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Jyotish Atlas's `index.html` into the "Warm Celestial" visual system — warm-dark manuscript aesthetic, Vedic illuminated SVG emblems, expressive Devanagari-paired typography, a 4-zone IA, and in-depth authored interpretation — without breaking the validated astrology math or the single-file/offline guarantee.

**Architecture:** In-place evolution of one self-contained `index.html` (currently 7348 lines: `<style>` 16–~786, `html.light` overrides ~787+, markup ~1240–1700, `<script>` ~1840+). We retune existing CSS custom properties (preserving token *names* so existing rules keep working), add new component classes, add a JS emblem system referenced via `<use>`, extend the `GRAHAS`/`RASHIS`/`BHAVAS`/`NAK` data objects with authored prose, and re-skin each section. A `#selftest` harness guards the validated math/data through every change. No build step, no dependencies, no network at runtime.

**Tech Stack:** Hand-written HTML/CSS/vanilla JS in a single file. Fonts: Fraunces (display) + Inter (sans), already loaded, with system Devanagari fallback. Inline SVG for all iconography.

---

## Conventions for every task

- **Working file:** `/Users/pradeepsavadi/Desktop/jyotish-atlas/index.html` (the only file modified unless stated).
- **Verification = browser.** There is no test runner. Open the file directly:
  - `open "file:///Users/pradeepsavadi/Desktop/jyotish-atlas/index.html"` (macOS).
  - For the regression guard, open `file://…/index.html#selftest` and read the **document title** (`✅ selftest N/N` or `❌`) and the browser console (`console.table`).
- **Never modify** the compute functions: `navamsaSign` (line ~2032), `NAV_START`, `dignityOf` (~2160), the BAV/Sarvashtakavarga code, nakshatra math, the `.txt` chart parser, divisional/Jaimini/avastha/dasha logic. This plan is presentational + content only. If a restyle seems to require a logic change, STOP and flag it.
- **Preserve all existing `id=` anchors** (`#why`, `#grahas`, `#synth`, `#charts`, `#promptbuilder`, `#bbavam`, `#arudhas`, `#outlook`, `#lifepredictor`, `#compare`, `#quiz`) so deep links and the command palette keep working.
- **Token names are stable.** Keep `--bg --bg2 --panel --panel2 --line --ink --muted --gold --gold2 --accent --exalt --debil --own --friend --enemy --neutral`. We change their *values* and add a few new tokens. Existing rules reference these names and must keep resolving.
- **Commit after each task** with the message shown. Branch is already `cursor/ux-a11y-quick-wins` (rebased on latest `main`).
- **Reduced motion:** every animation must be disabled under `@media (prefers-reduced-motion: reduce)`.

---

## File-region map (after Phase 1 adds comment banners)

Inside the single file, keep these comment-delimited regions in order:

```
<style> … </style>
  /* == TOKENS == */         retuned :root + html.light
  /* == TYPOGRAPHY == */     manuscript utility classes
  /* == EMBLEMS == */        emblem + aura CSS
  /* == COMPONENTS == */     nav, buttons, chips, cards, reading
  …existing section CSS…
<body> … markup … </body>
<script>
  /* == DATA == */           GRAHAS/RASHIS/BHAVAS/NAK (+ authored prose)
  /* == EMBLEM SYSTEM == */  grahaEmblem(), rashiEmblem(), rays()
  /* == SELFTEST == */       runSelfTest()
  …existing app logic…
</script>
```

---

# Phase 1 — Foundation

### Task 1: Regression self-test guard (safety net first)

**Files:** Modify `index.html` — add a `/* == SELFTEST == */` block near the end of `<script>` (just before the closing `</script>`).

- [ ] **Step 1: Write the guard (the "failing test" — it encodes the values that must stay true).**

Add this block at the end of the script:

```js
/* == SELFTEST == */
function runSelfTest(){
  const A=[]; const ok=(n,c)=>A.push({test:n,pass:!!c});
  // Navamsa (D-9) — exact known values from NAV_START=[Aries,Capricorn,Libra,Cancer]
  ok("navamsa Aries 0° = Aries(0)",      navamsaSign(0,0)===0);
  ok("navamsa Aries 6.7° = Gemini(2)",   navamsaSign(0,6.7)===2);
  ok("navamsa Aries 29.99° = Sag(8)",    navamsaSign(0,29.99)===8);
  ok("navamsa Taurus 0° = Capricorn(9)", navamsaSign(1,0)===9);
  ok("navamsa Gemini 0° = Libra(6)",     navamsaSign(2,0)===6);
  ok("navamsa Cancer 0° = Cancer(3)",    navamsaSign(3,0)===3);
  // Data invariants — guard against corruption during refactor
  ok("9 grahas",   GRAHAS.length===9);
  ok("12 rashis",  RASHIS.length===12);
  ok("12 bhavas",  BHAVAS.length===12);
  ok("27 nakshatras", NAK.length===27);
  ok("Sun exalts Aries / falls Libra / owns Leo", GBYK.Su.exalt===0 && GBYK.Su.debil===6 && GBYK.Su.own.includes(4));
  ok("Jupiter exalts Cancer / falls Capricorn",   GBYK.Ju.exalt===3 && GBYK.Ju.debil===9);
  ok("dignityOf Sun-in-Aries truthy", !!dignityOf("Su",0));
  const failed=A.filter(x=>!x.pass);
  if(console.table) console.table(A);
  return {total:A.length, failed:failed.length, fails:failed.map(f=>f.test)};
}
if(location.hash==="#selftest"){
  window.addEventListener("load",()=>{
    const r=runSelfTest();
    document.title=(r.failed? "❌ " : "✅ ")+"selftest "+(r.total-r.failed)+"/"+r.total;
    if(r.failed) console.error("SELFTEST FAILURES:", r.fails);
  });
}
```

- [ ] **Step 2: Run it to verify it PASSES on current code.**

Open `file:///Users/pradeepsavadi/Desktop/jyotish-atlas/index.html#selftest`.
Expected: tab title shows `✅ selftest 13/13`; `console.table` shows all `pass:true`.
(If any fail now, a function/data name drifted — fix the assertion to match reality before proceeding; do NOT change the math.)

- [ ] **Step 3: Commit.**

```bash
git add index.html && git commit -m "test: add #selftest regression guard for navamsa + graha data"
```

> From here on, the definition of "math intact" is: `#selftest` still shows `✅ 13/13`. Re-run it at the end of every phase.

---

### Task 2: Retune tokens to Warm Celestial (dark)

**Files:** Modify `index.html` `:root` (line ~17) and `<meta name="theme-color">` (line ~7).

- [ ] **Step 1: Replace the color tokens in `:root`.** Keep every token name; change values; add `--terracotta`. Leave `--r --ease --dur --shadow-* --text-* --section-y --font-*` as they are.

```css
  --bg:#181310; --bg2:#1f1813; --panel:#241b16; --panel2:#2c211b;
  --line:#3a2e26; --ink:#f3ead9; --muted:#b8a78f;
  --gold:#e9bf6a; --gold2:#f5d894; --terracotta:#d6815a;
  --accent:#d6815a;            /* repurpose old blue accent → warm terracotta */
  --exalt:#6fbf86; --debil:#e2705a;
  --own:#e9bf6a; --friend:#7fb0c4; --enemy:#e2705a; --neutral:#b8a78f;
```

- [ ] **Step 2: Update the dark theme-color meta** (line ~7) from `#0b0e1a` to the new base:

```html
<meta name="theme-color" content="#181310"/>
```

- [ ] **Step 3: Add a `/* == TOKENS == */` banner comment** on the line directly above `:root{` so the region is findable.

- [ ] **Step 4: Verify.** Open the file (no hash). Expected: whole app shifts to warm ink + antique gold; nothing unstyled or broken; exalt cells warm-green, debil warm-red. Then open `#selftest` → still `✅ 13/13`.

- [ ] **Step 5: Commit.**

```bash
git add index.html && git commit -m "feat: retune palette to Warm Celestial (dark)"
```

---

### Task 3: Warm "Daylight Almanac" light theme

**Files:** Modify `index.html` `html.light{…}` token block (line ~787).

- [ ] **Step 1: Set the light-theme token overrides** to the warm parchment variant. Find the `html.light{` rule that redefines tokens and replace its custom-property values with:

```css
  --bg:#f5f1e8; --bg2:#efe9db; --panel:#fffdf7; --panel2:#f3ecdc;
  --line:#e0d4bb; --ink:#2b2620; --muted:#7a6c55;
  --gold:#b8860b; --gold2:#9a6b12; --terracotta:#b5552f; --accent:#b5552f;
  --exalt:#3e7d57; --debil:#bb3b28;
  --own:#b8860b; --friend:#2f6f86; --enemy:#bb3b28; --neutral:#7a6c55;
```

- [ ] **Step 2: Update the light theme-color** if present in JS `toggleTheme()` (search `theme-color`); set the light value to `#f5f1e8`.

- [ ] **Step 3: Verify.** Open file, click the ☾/☀ toggle (line ~1064 area). Expected: warm parchment theme, gold-on-cream readable, no cool blue remnants. Toggle back to dark. Open `#selftest` → `✅ 13/13`.

- [ ] **Step 4: Commit.**

```bash
git add index.html && git commit -m "feat: warm Daylight Almanac light theme"
```

---

### Task 4: Manuscript typography utility classes

**Files:** Modify `index.html` — add a `/* == TYPOGRAPHY == */` CSS block immediately after the tokens region; extend the Devanagari font fallback.

- [ ] **Step 1: Add the utility classes** (place after `:root`/`html.light`):

```css
/* == TYPOGRAPHY == */
.eyebrow{font-family:var(--font-sans);font-size:10.5px;letter-spacing:.26em;text-transform:uppercase;color:var(--muted)}
.display{font-family:var(--font-display);font-weight:600;line-height:1.02;letter-spacing:-.01em}
.display .em{font-style:italic;color:var(--gold)}
.devanagari{font-family:var(--font-sans),"Noto Sans Devanagari","Nirmala UI","Mangal",sans-serif;color:var(--gold)}
.rule-gold{height:2px;border:0;width:64px;background:linear-gradient(90deg,var(--gold),var(--terracotta));margin:12px 0}
.dropcap::first-letter{font-family:var(--font-display);font-weight:600;font-style:italic;color:var(--gold);
  float:left;font-size:3.4em;line-height:.72;padding:.05em .12em 0 0}
.watchfor{border-left:2px solid var(--terracotta);padding:6px 0 6px 14px;margin-top:14px}
.watchfor .label{font-family:var(--font-sans);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--terracotta);margin-bottom:4px}
```

- [ ] **Step 2: Verify in isolation.** Temporarily add `<p class="dropcap">Atman-karaka…</p>` and `<span class="devanagari">सूर्य</span>` inside `#why`, open the file, confirm the drop-cap renders gold/italic and Devanagari shows (or gracefully falls back to romanized text alongside). Remove the temporary markup.

- [ ] **Step 3: Commit.**

```bash
git add index.html && git commit -m "feat: manuscript typography utility classes"
```

---

### Task 5: Vedic illuminated emblem system

**Files:** Modify `index.html` — add `/* == EMBLEMS == */` CSS in the style block and a `/* == EMBLEM SYSTEM == */` JS block after the `/* == DATA == */` region.

- [ ] **Step 1: Add emblem CSS** (focus aura + reduced-motion):

```css
/* == EMBLEMS == */
.emblem{display:inline-block;vertical-align:middle}
.emblem .ring-base{stroke:var(--line)}
.emblem .ring-gold{stroke:var(--gold);opacity:.5}
.emblem .ink{fill:var(--ink)} .emblem .gold{fill:var(--gold)} .emblem .terra{fill:var(--terracotta)}
.emblem .stroke-gold{stroke:var(--gold);fill:none}
.emblem.focus .aura{animation:embpulse 3.4s ease-in-out infinite}
@keyframes embpulse{0%,100%{opacity:.28;transform:scale(1)}50%{opacity:.5;transform:scale(1.05)}}
@media (prefers-reduced-motion:reduce){.emblem.focus .aura{animation:none;opacity:.4}}
```

- [ ] **Step 2: Add the emblem builder JS.** This is the single source of truth; the shared frame plus per-graha inner art. Ship all 9 grahas.

```js
/* == EMBLEM SYSTEM == */
const TAU=Math.PI*2;
function _rays(n,r1,r2){let s='';for(let i=0;i<n;i++){const a=i/n*TAU-Math.PI/2;
  const x1=(50+Math.cos(a)*r1).toFixed(1),y1=(50+Math.sin(a)*r1).toFixed(1),
        x2=(50+Math.cos(a)*r2).toFixed(1),y2=(50+Math.sin(a)*r2).toFixed(1);
  s+=`<line class="stroke-gold" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="2"/>`;}return s;}
function _dots(n,r){let s='';for(let i=0;i<n;i++){const a=i/n*TAU-Math.PI/2;
  s+=`<circle class="gold" cx="${(50+Math.cos(a)*r).toFixed(1)}" cy="${(50+Math.sin(a)*r).toFixed(1)}" r="1.4"/>`;}return s;}
// inner art per graha key — centered on (50,50), classical Vedic cues
const EMBLEM_ART={
  Su:()=>`${_rays(12,30,40)}<circle class="gold" cx="50" cy="50" r="20"/><circle class="ink" cx="50" cy="50" r="3.4"/>`,
  Mo:()=>`<path class="stroke-gold" d="M58 32 A22 22 0 1 0 58 68 A17 17 0 1 1 58 32 Z" stroke-width="2" fill="var(--ink)" fill-opacity=".08"/>`,
  Ma:()=>`<path class="gold" d="M50 28 L57 50 L50 46 L43 50 Z"/><path class="terra" d="M50 40 L54 66 L50 60 L46 66 Z"/>`,
  Me:()=>`${_dots(2,26)}<circle class="stroke-gold" cx="50" cy="52" r="11" stroke-width="2"/><path class="stroke-gold" d="M50 41 V31 M44 35 H56" stroke-width="2"/>`,
  Ju:()=>`${_dots(8,32)}<path class="stroke-gold" d="M40 38 Q60 38 56 56 Q54 66 44 64" stroke-width="2.4"/><line class="stroke-gold" x1="36" y1="56" x2="58" y2="56" stroke-width="2.4"/>`,
  Ve:()=>`${_rays(6,28,36)}<circle class="stroke-gold" cx="50" cy="46" r="12" stroke-width="2"/><path class="stroke-gold" d="M50 58 V70 M44 64 H56" stroke-width="2"/>`,
  Sa:()=>`<circle class="stroke-gold" cx="50" cy="50" r="22" stroke-width="5" stroke-opacity=".5"/><ellipse class="stroke-gold" cx="50" cy="50" rx="30" ry="9" stroke-width="1.4" transform="rotate(-18 50 50)"/>`,
  Ra:()=>`<path class="stroke-gold" d="M34 60 Q34 34 50 34 Q66 34 66 60" stroke-width="3"/><path class="terra" d="M50 34 l-5 -8 h10 z"/>`,
  Ke:()=>`<path class="stroke-gold" d="M34 40 Q34 66 50 66 Q66 66 66 40" stroke-width="3"/><path class="terra" d="M50 66 l-5 8 h10 z"/>`
};
// returns an <svg> string; opts: {size=64, focus=false, bija=''}
function grahaEmblem(k,opts={}){
  const size=opts.size||64, art=(EMBLEM_ART[k]||EMBLEM_ART.Su)();
  const g=GBYK[k]||{}; const label=(g.skt||k)+" emblem";
  const aura=opts.focus?`<circle class="aura gold" cx="50" cy="50" r="46" opacity=".35"/>`:'';
  const bija=opts.bija?`<text x="50" y="${k==='Su'?'55':'90'}" text-anchor="middle" class="${k==='Su'?'ink':'gold'}" font-family="var(--font-sans)" font-size="${k==='Su'?'14':'13'}">${opts.bija}</text>`:'';
  return `<svg class="emblem${opts.focus?' focus':''}" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${label}">`
    +aura
    +`<circle class="ring-base" cx="50" cy="50" r="44" fill="none" stroke-width="5"/>`
    +`<circle class="ring-gold" cx="50" cy="50" r="44" fill="none" stroke-width="1"/>`
    +art+bija+`</svg>`;
}
// Rashi roundel: element-tinted ring + classical unicode glyph in display face
const RASHI_GLYPH=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const ELEM_TINT={Fire:"var(--terracotta)",Earth:"#9a8a5e",Air:"var(--friend)",Water:"#6f9fb0"};
function rashiEmblem(i,opts={}){
  const size=opts.size||56, r=RASHIS[i]||{}, tint=ELEM_TINT[r.elem]||"var(--gold)";
  return `<svg class="emblem" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${(r.skt||'')} roundel">`
    +`<circle class="ring-base" cx="50" cy="50" r="44" fill="none" stroke-width="5"/>`
    +`<circle cx="50" cy="50" r="44" fill="none" stroke="${tint}" stroke-width="1.4" opacity=".7"/>`
    +`<circle cx="50" cy="50" r="33" fill="none" stroke="${tint}" stroke-width=".8" opacity=".4"/>`
    +`<text x="50" y="64" text-anchor="middle" fill="${tint}" font-family="var(--font-display)" font-size="40">${RASHI_GLYPH[i]}</text>`
    +`</svg>`;
}
```

> **Note on the 9 graha emblems:** the `EMBLEM_ART` map above is the complete, shippable baseline (Surya rayed disc, Chandra crescent, Mangala spear, Budha caduceus-line, Guru benefic curve, Shukra blossom, Shani iron ring, Rahu serpent-head, Ketu serpent-tail). They are intentionally simple, themeable, and offline. Refining any single emblem's geometry later is a content edit to its `EMBLEM_ART[k]` builder only — no other code changes.

- [ ] **Step 3: Smoke-test the system.** Open `#selftest` (still `✅ 13/13`), then in the browser console run `document.body.insertAdjacentHTML('afterbegin', grahaEmblem('Su',{size:120,focus:true,bija:'सू'})+grahaEmblem('Sa',{size:120})+rashiEmblem(0,{size:120}))`. Expected: a glowing pulsing Surya, an iron-ring Shani, and an Aries roundel render crisply. Reload to clear.

- [ ] **Step 4: Commit.**

```bash
git add index.html && git commit -m "feat: Vedic illuminated emblem system (9 grahas + 12 rashi roundels)"
```

---

### Task 6: Global chrome — nav shell, buttons, chips, cards

**Files:** Modify `index.html` — add a `/* == COMPONENTS == */` CSS block; these classes are consumed by later tasks.

- [ ] **Step 1: Add the component classes:**

```css
/* == COMPONENTS == */
.btn-primary{font-family:var(--font-sans);font-weight:600;font-size:13px;color:#2a1a0c;
  background:linear-gradient(135deg,var(--gold),var(--terracotta));border:0;border-radius:9px;
  padding:11px 20px;cursor:pointer}
.btn-ghost{font-family:var(--font-sans);font-size:13px;color:var(--gold);background:none;
  border:1px solid var(--line);border-radius:9px;padding:11px 20px;cursor:pointer}
.chip{font-family:var(--font-sans);font-size:11px;padding:5px 11px;border-radius:20px;border:1px solid var(--line);color:var(--muted);background:var(--panel)}
.chip.good{color:var(--exalt);border-color:color-mix(in srgb,var(--exalt) 40%,transparent);background:color-mix(in srgb,var(--exalt) 12%,transparent)}
.chip.bad{color:var(--debil);border-color:color-mix(in srgb,var(--debil) 40%,transparent);background:color-mix(in srgb,var(--debil) 12%,transparent)}
.chip.gold{color:var(--gold);border-color:color-mix(in srgb,var(--gold) 40%,transparent);background:color-mix(in srgb,var(--gold) 12%,transparent)}
.verdict{border:1px solid var(--line);background:var(--panel);border-radius:9px;padding:9px 13px;min-width:96px}
.verdict .k{font-family:var(--font-sans);font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
.verdict .v{font-family:var(--font-display);font-size:14px;font-weight:600;margin-top:2px}
.zone-card{border:1px solid var(--line);border-radius:11px;padding:16px;background:var(--panel)}
.zone-card h4{font-family:var(--font-display);font-size:19px;font-weight:600;color:var(--gold);margin:0}
.zone-card p{font-family:var(--font-sans);font-size:11.5px;line-height:1.6;color:var(--muted);margin:6px 0 0}
```

- [ ] **Step 2: Verify** the classes don't collide with existing ones — search the file for pre-existing `.chip`, `.btn-primary`, `.verdict`, `.zone-card`. If any already exists, rename the new one with an `ec-` prefix (e.g. `.ec-chip`) and use that prefixed name in all later tasks. Record which names you settled on at the top of the COMPONENTS block in a comment.

- [ ] **Step 3: Verify render** by temporarily dropping `<button class="btn-primary">Begin →</button> <span class="chip good">Exalted</span>` into `#why`; confirm gradient button + green chip; remove. Open `#selftest` → `✅ 13/13`.

- [ ] **Step 4: Commit.**

```bash
git add index.html && git commit -m "feat: global component classes (buttons, chips, verdicts, zone cards)"
```

---

# Phase 2 — Learn

### Task 7: Four-zone navigation

**Files:** Modify `index.html` nav markup (the `<nav id="siteNav">` / header region, ~line 1240–1265) and nav CSS.

- [ ] **Step 1: Restructure the nav into 4 grouped zones.** Replace the flat link list with grouped triggers. Keep the brand mark, the theme toggle, and the `⌘K` palette trigger. Each zone is a button revealing its links (reuse the existing dropdown/disclosure pattern if one exists; otherwise a simple `<details>` or hover/focus menu). Every original anchor (`#why … #quiz`, plus `#promptbuilder`, `#arudhas`, and new `#nakshatras`) must appear under exactly one zone:

```html
<!-- Learn --> #why #grahas #rashis #bhavas #nakshatras
<!-- Synthesize --> #synth #bbavam #arudhas #compare
<!-- My Charts --> #charts #promptbuilder #outlook #lifepredictor
<!-- Practice --> #quiz
```

- [ ] **Step 2: Style** the zone triggers with `.eyebrow`-style uppercase tracking; active zone underlined in `--gold`. Keep mobile behavior usable (stack or scroll). Do not remove the skip-link (`#main`).

- [ ] **Step 3: Verify.** Open file: all four zones reveal their links; every link scrolls to its section; command palette still lists every section; mobile width still navigable; keyboard tab order sane. `#selftest` → `✅ 13/13`.

- [ ] **Step 4: Commit.**

```bash
git add index.html && git commit -m "feat: 4-zone grouped navigation"
```

---

### Task 8: Homepage hero

**Files:** Modify `index.html` — restyle the existing top/hero markup (the `h1.hero` region) or insert a hero block at the top of `<main>` above `#why`.

- [ ] **Step 1: Build the hero** using locked classes + the emblem system. Insert at the top of `<main>`:

```html
<section id="hero" class="hero-warm">
  <div class="hero-copy">
    <div class="eyebrow">A living primer · <span class="devanagari">पराशर</span></div>
    <h1 class="display hero-h">The <span class="em">grammar</span><br>of the heavens</h1>
    <p class="hero-lede">Nine Grahas, twelve Rashis, twelve Bhavas — not a list to memorize, but a language to read. Learn the alphabet, then synthesize any chart.</p>
    <div class="hero-cta">
      <a class="btn-primary" href="#grahas">Begin with the Grahas →</a>
      <a class="btn-ghost" href="#charts">Upload my chart</a>
    </div>
  </div>
  <div class="hero-emblem" id="heroEmblem"></div>
</section>
```

- [ ] **Step 2: Add hero CSS:**

```css
.hero-warm{display:flex;gap:40px;align-items:center;flex-wrap:wrap;padding:48px 0 40px;
  background:radial-gradient(110% 80% at 80% -10%, color-mix(in srgb,var(--gold) 12%,transparent), transparent 55%)}
.hero-copy{flex:1;min-width:280px}
.hero-h{font-size:clamp(38px,6vw,56px);margin:10px 0 0}
.hero-lede{font-family:var(--font-sans);font-size:17px;line-height:1.55;color:var(--muted);max-width:42ch;margin:18px 0 26px}
.hero-cta{display:flex;gap:12px;flex-wrap:wrap}
.hero-emblem{flex:0 0 auto}
```

- [ ] **Step 3: Mount the focused hero emblem** — near app init (after `GRAHAS`/emblem system load), add:

```js
document.getElementById("heroEmblem")?.insertAdjacentHTML("beforeend", grahaEmblem("Su",{size:190,focus:true,bija:"सू"}));
```

- [ ] **Step 4: Add the four zone cards** below the hero (reuse `.zone-card`), one per IA zone, linking to the first section of each zone.

- [ ] **Step 5: Verify.** Hero renders with pulsing Surya + Devanagari + working CTAs; reduced-motion stops the pulse; zone cards link correctly. `#selftest` → `✅ 13/13`.

- [ ] **Step 6: Commit.**

```bash
git add index.html && git commit -m "feat: Warm Celestial homepage hero + zone cards"
```

---

### Task 9: Author Graha interpretation + reference render

**Files:** Modify `index.html` — extend each object in `GRAHAS` (line ~1859); update the graha render in `explorer(...)`/`grahaDetail` (search `grahaTokens`/`grahaDetail`).

- [ ] **Step 1: Add authored fields to every graha object.** Add `bija` (Devanagari seed), `interp` (rich prose, ~150–250 words), `strong` (one line), `afflicted` (one line). Use the classical attributes already present (`karakas`, `body`, `exalt/debil/own`, `nature`, `guna`, `elem`). Full worked example for Surya (`k:"Su"`):

```js
  bija:"सूर्य",
  interp:"Atman-karaka in spirit — Surya is the steady flame the whole chart orbits. He is the king who cannot share a throne: wherever he sits, that house wants to be seen, to lead, to answer to no one. As the natural significator of soul, father, and authority, his condition colours one's sense of self and one's relationship to power. Exalted in Mesha he is pure initiative; fallen in Tula he must learn to share the stage. He rules Simha, the lion's seat of the heart.",
  strong:"Dignity, vitality, a clear spine, recognition, the father's blessing, healthy authority.",
  afflicted:"Pride, a brittle ego, friction with father and superiors, burnout from over-identifying with status.",
```

Author the other eight to the same shape, grounded in their existing data (e.g. Chandra/Mind & mother, Mangala/courage, Budha/intellect, Guru/wisdom & dharma, Shukra/love & art, Shani/time & discipline, Rahu/amplifying desire, Ketu/detachment & moksha). Keep tone classical, teaching-oriented, non-fatalistic.

- [ ] **Step 2: Render the reference page.** Update the graha detail renderer to show: the focused emblem (`grahaEmblem(g.k,{size:120,focus:true,bija:g.bija})`), `Name` + `<span class="devanagari">${g.bija}</span>` + italic gloss, dignity `.chip`s (exalts/falls/owns using `--exalt/--debil/--gold`), a `<p class="dropcap">${g.interp}</p>`, then a two-column grid of `karakas` and `nature/guna/elem`, plus `strong`/`afflicted` lines. Match the approved mockup (`reading-templates.html`, top).

- [ ] **Step 3: Verify.** Click each of the 9 grahas in `#grahas`; each shows its emblem, Devanagari, dignity chips, drop-cap prose, karakas. No `undefined`. `#selftest` → `✅ 13/13`.

- [ ] **Step 4: Commit.**

```bash
git add index.html && git commit -m "feat: authored Graha interpretation + illuminated reference page"
```

---

### Task 10: Author Rashi interpretation + render

**Files:** Modify `index.html` — `RASHIS` (line ~1899) and its renderer (`rashiTokens`/`rashiDetail`).

- [ ] **Step 1: Add `interp` (~120–180 words) and `bija` (Devanagari) to each rashi**, grounded in element/modality/ruler/body. Example for Mesha (i=0):

```js
  bija:"मेष",
  interp:"Mesha, the ram — cardinal fire, ruled by Mangala. The zodiac's first impulse: raw, forward, unhesitating. Planets here act before they deliberate; they pioneer, compete, and prefer the front of the line. Surya is exalted here, Shani fallen — initiative thrives, patience strains. The body's head and the self's first assertion live in this sign.",
```

Author all 12 (Vrishabha/steady earth … Meena/dissolving water).

- [ ] **Step 2: Render** the rashi detail with `rashiEmblem(i,{size:96})`, name + `bija`, element/modality/ruler chips, and `<p class="dropcap">${r.interp}</p>`.

- [ ] **Step 3: Verify** all 12 rashis render with roundel + prose. `#selftest` → `✅ 13/13`.

- [ ] **Step 4: Commit.**

```bash
git add index.html && git commit -m "feat: authored Rashi interpretation + element roundels"
```

---

### Task 11: Author Bhava interpretation + render

**Files:** Modify `index.html` — `BHAVAS` (line ~1906) and its renderer (`bhavaTokens`/`bhavaDetail`).

- [ ] **Step 1: Add `interp` (~120–180 words) to each bhava**, grounded in `en` + classification (Kendra/Trikona/Dusthana/Upachaya). Example for the 10th:

```js
  interp:"The tenth, the Midheaven — karma, vocation, public standing, the visible self. A Kendra and an Upachaya: it strengthens with effort over time. Planets here broadcast their nature to the world and shape how authority treats you and how you wield it. The throne of action, where dharma meets reputation.",
```

Author all 12.

- [ ] **Step 2: Render** the bhava detail with its numbered glyph, name, classification chip(s), and `<p class="dropcap">${b.interp}</p>`. Reuse the existing Bhava mandala view; restyle it with tokens only.

- [ ] **Step 3: Verify** all 12 bhavas. `#selftest` → `✅ 13/13`.

- [ ] **Step 4: Commit.**

```bash
git add index.html && git commit -m "feat: authored Bhava interpretation"
```

---

### Task 12: Nakshatras reference section (new)

**Files:** Modify `index.html` — add `<section id="nakshatras">` under the Learn zone (place after `#bhavas`); render from existing `NAK` (line ~1950).

- [ ] **Step 1: Inspect the `NAK` shape** (fields like name/lord/deity/symbol/theme). Add a short authored `interp` (~60–100 words) per nakshatra if not already present, grounded in its existing deity/symbol/theme fields.

- [ ] **Step 2: Add the section markup** mirroring the other Learn sections (heading with `.eyebrow` + `.display`, a token grid of all 27, a detail panel). Wire a renderer that lists the 27 as tappable tokens and shows lord/deity/symbol + `interp` on selection.

- [ ] **Step 3: Add `#nakshatras` to the Learn zone nav** (Task 7) and the command palette list.

- [ ] **Step 4: Verify** the section appears, all 27 render, nav + palette reach it, deep link `#nakshatras` works. `#selftest` → `✅ 13/13`.

- [ ] **Step 5: Commit.**

```bash
git add index.html && git commit -m "feat: Nakshatras reference section"
```

---

# Phase 3 — Synthesize

### Task 13: Synthesizer — layered verdict + woven authored reading

**Files:** Modify `index.html` — the `#synth` renderer (search the synth compute block that builds the reading; it uses `navamsaSign`, `dignityOf`, `RASHIS`, nakshatra, aspects). **Do not change any computation — only how results are presented and which authored fragments are stitched in.**

- [ ] **Step 1: Render the placement header** — `Graha in Rashi · Nth Bhava` in `.display`, with degrees/nakshatra in the existing mono style on the right (match `reading-templates.html`, bottom).

- [ ] **Step 2: Render the verdict row** — four `.verdict` cards built from existing computed values: Dignity (color the `.v` with `--exalt`/`--debil`/`--gold` per `dignityOf`), Navamsa D-9 (vargottama flag if D1 sign === D9 sign), Nakshatra (+ ruling graha), Drishti (aspected houses).

- [ ] **Step 3: Weave the authored reading.** Compose paragraphs from authored fragments already in the data: graha `interp`/`strong`/`afflicted` (Task 9) + rashi `interp` (Task 10) + bhava `interp` (Task 11) + nakshatra `interp` (Task 12), selected by the computed dignity/house/nakshatra. Add a "Promise vs delivery" line driven by D1-dignity vs D9-dignity, and a `<div class="watchfor">` growth-edge note for afflicted/over-strong cases. Assembly only — no new astrological rules.

- [ ] **Step 4: Verify against the guard AND by hand.** Open `#selftest` → `✅ 13/13`. Then in `#synth` choose Sun / Aries / 10th / ~6° and confirm: Dignity = Exalted (green), the woven reading references the 10th-house and Aries fragments, degrees match the mono readout, and the numbers equal what the pre-redesign build produced (spot-check the D-9 sign equals `navamsaSign(0,deg)`).

- [ ] **Step 5: Commit.**

```bash
git add index.html && git commit -m "feat: Synthesizer layered verdict + woven authored reading"
```

---

### Task 14: Restyle Bhavat Bhavam, Graha Arudhas, Compare

**Files:** Modify `index.html` — sections `#bbavam` (~1476), `#arudhas` (~1516), `#compare` (~1576). Presentation only.

- [ ] **Step 1:** Re-skin each section header to `.eyebrow` + `.display`, route panels/cards/chips through the new component classes and tokens. Where a graha/rashi appears, use `grahaEmblem`/`rashiEmblem` at small size for consistency. Leave all computed text/logic intact.

- [ ] **Step 2: Verify** each section renders correctly in dark + light, no logic regressions (the Arudha/Bhavat-Bhavam/Compare outputs match pre-redesign for a loaded chart). `#selftest` → `✅ 13/13`.

- [ ] **Step 3: Commit.**

```bash
git add index.html && git commit -m "feat: restyle Bhavat Bhavam, Arudhas, Compare"
```

---

# Phase 4 — My Charts

### Task 15: Restyle My Charts / Upload (incl. BAV, Dasha, divisional, Jaimini, avastha)

**Files:** Modify `index.html` — section `#charts` (~1338) and its sub-panels. **Presentation only — do not touch the `.txt` parser, BAV math, dasha, divisional, Jaimini, or avastha computation.**

- [ ] **Step 1:** Re-skin the upload modal, chart tabs, planet rows, BAV tables (keep the strength color-coding but map it to the warm `--exalt … --debil` ramp), dasha timeline, divisional/Jaimini/avastha tables — tokens + component classes only. Use `grahaEmblem` small for planet rows where icons appear.

- [ ] **Step 2: Verify with a real chart.** Load a `.txt` chart; confirm every planet's D-1/Nakshatra/D-9/verdict, the BAV tables, Sarvashtaka, dasha, and divisional/Jaimini/avastha outputs are **numerically identical** to the pre-redesign build (compare against the same chart on `git stash`/previous commit if unsure). `#selftest` → `✅ 13/13`.

- [ ] **Step 3: Commit.**

```bash
git add index.html && git commit -m "feat: restyle My Charts (BAV, dasha, divisional, Jaimini, avastha)"
```

---

### Task 16: Restyle Prompt Builder, Life Outlook, Life Predictor

**Files:** Modify `index.html` — `#promptbuilder` (~1444), `#outlook` (~1552), `#lifepredictor` (~1532). Presentation only.

- [ ] **Step 1:** Re-skin headers, controls, generated-prompt textarea, outlook/predictor panels through tokens + component classes. Keep the Prompt Builder's generated text content byte-for-byte (it feeds external AI tools) — only restyle the surrounding chrome.

- [ ] **Step 2: Verify** the generated prompt text is unchanged for a loaded chart; outlook/predictor render correctly in both themes. `#selftest` → `✅ 13/13`.

- [ ] **Step 3: Commit.**

```bash
git add index.html && git commit -m "feat: restyle Prompt Builder, Life Outlook, Life Predictor"
```

---

# Phase 5 — Practice & polish

### Task 17: Restyle the Practice quiz

**Files:** Modify `index.html` — section `#quiz` (~1596). Presentation only.

- [ ] **Step 1:** Re-skin question cards, options, score, and feedback states through tokens + component classes; correct/incorrect use `--exalt`/`--debil`.

- [ ] **Step 2: Verify** a full quiz round plays, scoring works, both themes fine. `#selftest` → `✅ 13/13`.

- [ ] **Step 3: Commit.**

```bash
git add index.html && git commit -m "feat: restyle Practice quiz"
```

---

### Task 18: Motion & aura polish pass

**Files:** Modify `index.html` CSS/JS.

- [ ] **Step 1:** Apply the focus aura to the *active* emblem in the Synthesizer and the selected token in Grahas/Rashis (add/remove the `.focus` class on selection). Add gentle hover lift on `.zone-card`/cards. Keep transitions on `--dur`/`--ease`.

- [ ] **Step 2: Verify reduced-motion.** With OS "reduce motion" on (or DevTools emulation), confirm no pulsing/animation anywhere; static fallbacks look intentional. `#selftest` → `✅ 13/13`.

- [ ] **Step 3: Commit.**

```bash
git add index.html && git commit -m "feat: emblem aura + motion polish (reduced-motion safe)"
```

---

### Task 19: Accessibility, contrast, print & final audit

**Files:** Modify `index.html` as needed.

- [ ] **Step 1: Contrast.** Verify WCAG AA for `--ink` on `--bg`, `--muted` on `--panel`, and `--gold` on `--bg` (dark) and the parchment equivalents (light). Nudge token values if any fail; re-run Task 2/3 verification.

- [ ] **Step 2: Keyboard & SR.** Tab through nav zones, hero CTAs, token grids, synth controls; ensure focus rings visible on warm bg; emblems have `role="img"`+`aria-label` (already in builder); skip-link works.

- [ ] **Step 3: Print.** `Cmd+P` preview of a Graha reference and a loaded chart — ensure legible (dark bg shouldn't dump ink; add a `@media print` light fallback if needed).

- [ ] **Step 4: Final regression.** `#selftest` → `✅ 13/13`. Load all four reference charts (per README) and confirm Navamsa, Nakshatra, and BAV outputs are unchanged from the pre-redesign build.

- [ ] **Step 5: Decide on the guard.** Keep the `#selftest` block (it's inert without the hash) — note it in the README's technical section, or remove it if the user prefers a pristine file. Default: keep.

- [ ] **Step 6: Commit.**

```bash
git add index.html && git commit -m "chore: a11y, contrast, print audit + final math regression check"
```

---

## Self-review notes (author)

- **Spec coverage:** §3 palette → Tasks 2–3; §3.2 type → Task 4; §4 emblems → Task 5 (grahas) + rashi roundels, used in 9/10/13/14/15; §5 authored interpretation → Tasks 9–12 + assembly in 13; §6 IA/nav/hero → Tasks 7–8, new `#nakshatras` Task 12, new `#promptbuilder`/`#arudhas` folded into 14/16; §7 build regions → Task map + banners; §8 phasing → Phases 1–5; §3.3 motion/reduced-motion → Task 18 + every CSS task; success criteria (offline, math intact) → `#selftest` guard (Task 1) re-run every phase + Task 19.
- **No placeholders:** every code step ships real code; restyle tasks specify exact sections + the component classes (defined in Task 6) they apply; authored-content tasks give a full worked example + the data shape to replicate.
- **Type/name consistency:** `grahaEmblem(k,opts)`, `rashiEmblem(i,opts)`, `EMBLEM_ART`, `runSelfTest()`, classes `.eyebrow .display .devanagari .dropcap .rule-gold .watchfor .btn-primary .btn-ghost .chip .verdict .zone-card`, tokens unchanged in name — used consistently across tasks. Task 6 Step 2 handles any pre-existing class-name collision by switching to an `ec-` prefix everywhere.
