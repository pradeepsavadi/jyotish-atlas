# Jyotish Atlas: UX audit and roadmap

**Date:** 2026-11-23
**Scope:** the whole app (organisation, navigation, language, look and feel, mobile, accessibility, and the code structure that limits them).
**Method:** an expert review of the running app at 1440×900 and 375×812 with the demo chart loaded, plus measurements taken from the page (counts of controls, text sizes, colours, page lengths). No real users were tested; Phase 0 below fixes that.

"10,000× better" can't be measured, so this document sets targets that can: a first-time visitor understands something true about their chart within 60 seconds, and can find any feature in two clicks.

---

## Progress (updated 2026-11-24)

| Phase | Status | What was done |
|---|---|---|
| 0 · User test | Kit ready | [User-test kit](2026-11-user-test-kit.md) with tasks, script and summary sheet. Sessions with real people still to run. |
| 1 · Quick wins | Done | Home cards removed from other pages; Previous/Next kept on Learn lessons only; Life timeline and Year by year follow the active chart and only ask for a birth date when it's missing; sample chart has life periods and is never duplicated; header mandala removed; Fraunces dropped (Georgia stays, so it works offline); plain menu names with technique captions, searchable by both in ⌘K; empty states rewritten with one action; no text under 12px; all form fields labelled. |
| 2 · Visual system | Started | Token scale added to `tokens.css` (`--fs-*`, `--sp-*`, `--radius-*`); new screens use it; `tests/design-tokens.cjs` stops raw radii, sizes, colours and `!important` from growing and enforces the 12px floor. Converting existing screens remains. |
| 6 · First run and data | Done | "Try a sample chart" on the home screen opens My charts; Back up / Restore in the chart menu (restore merges and never deletes); a gentle reminder when data has no recent backup. |
| 9 · Polish | Started | "What this app is" note in the first Learn lesson; Life Predictor renamed Life timeline with tendency-not-fate wording. Glossary pass, Sanskrit spelling rule, light-theme wheel and motion review remain. |
| New · Cosmic Body | Done | Kālapuruṣa lesson in Learn after the Nakshatras lesson, with links from the Signs, Houses and Nakshatras lessons (see section 3.8). |
| 3, 4, 5, 7, 8 | Not started | Waiting on Phase 0 findings, as recommended. |

---

## 1. Verdict

The app has excellent content and correct calculations wrapped in an organisation that grew by addition. Every feature that was built got its own menu entry, its own controls and its own visual treatment. The result is a toolbox for someone who already knows Jyotish, presented to people who don't.

The single biggest problem is organisation, not appearance. Fixing the look without fixing the structure would produce a prettier maze.

### What is already good (keep it)

- **Privacy and independence.** Charts are calculated and stored in the browser; nothing personal leaves the device.
- **Trustworthy calculations.** A built-in self-test (44 checks) guards the astrology maths.
- **Plain-language readings.** The Beginner readings in My Charts explain a house in everyday words. This voice is the app's best asset.
- **Readable base contrast.** Body text is 16:1 against the background and secondary text 9:1, both well above the 4.5:1 minimum.
- **Command palette (⌘K), skip link, reduced-motion support.** Rare in hobby-scale apps.

---

## 2. The flaws, with evidence

### 2.1 Organisation: 16 destinations, named after techniques

The side menu has 16 flat entries in four groups:

| Group | Entries |
|---|---|
| Today | Personal Almanac |
| Study | Learn, Synthesizer, Practice |
| Your chart | My Charts, Rāśi Guide, Relationship Decoder, Graha Arudhas, Career Decoder |
| Timing & reflection | Opportunity Windows, Life Predictor, Life Outlook, Prashna, Life Journal, Prompt Builder, Compare Charts |

Problems:

1. **Entries are named by method, not by the question a person has.** "Graha Arudhas", "Rāśi Guide" and "Prashna" mean nothing to a novice. Nobody arrives wanting "Arudhas"; they arrive wanting "how do others see me?".
2. **Three tools answer one question.** Opportunity Windows, Life Predictor and Life Outlook all answer "when?". A user has to guess which one.
3. **The last group is a junk drawer.** A journal, an AI prompt builder and chart comparison are filed under "Timing".
4. **Too many choices at one level.** Sixteen peers with no hierarchy forces reading the whole list every visit.

### 2.2 Navigation: six systems that disagree

A user can move around with the side menu, the "Predictions / Learn Jyotish" switch, ⌘K, a "Workspace" dropdown on phones, four "Learn / Synthesize / My Charts / Practice" cards, and "← Previous / Next →" buttons at the foot of each page.

- The four cards are left over from the old single-page layout. They still appear at the top of unrelated pages such as Life Predictor and My Charts, pushing real content down.
- The Previous/Next buttons impose a reading order on unrelated tools, and the order contradicts the menu. On Life Predictor they offer "Life Journal" and "Prompt Builder"; the menu's neighbours are Opportunity Windows and Life Outlook.
- "Predictions / Learn Jyotish" is a second top-level structure that overlaps the menu's Today and Study groups.

### 2.3 First run and dead ends

- The demo chart has no dasha dates, so the first thing a newcomer sees on the home screen is "Not available in supplied dates" three times, and Life Predictor shows an empty box.
- **Life Predictor asks for a birth date even though a chart is active.** The app's own top bar says a chart is loaded; the page behaves as if it isn't.
- Clicking "Try a sample chart" twice creates two tabs both named "Demo chart".
- Empty states say what is missing in technical terms ("No Vimshottari dasha data yet… paste JHora text") instead of offering one button that fixes it.

### 2.4 Language

- Three registers are mixed without a rule: English ("Career"), plain transliteration ("Lagna"), and scholarly diacritics ("Rāśi", "kāraka", "daśā").
- Abbreviations appear before they are explained: SAV, BAV, D-1, D-9, H7.
- Introductions are long and academic. Graha Arudhas opens with about 90 words including a scripture citation before showing anything about the user.
- Feature names over-promise. "Life Predictor" and green/red "favours delivery / signals friction" read as fate, while the README calls the app a teaching tool.

### 2.5 Density and page length

| Screen (desktop) | Screens tall | Text blocks | Under 12px | Controls |
|---|---|---|---|---|
| Graha Arudhas | 5.1 | 219 | 84 | 18 (12 under 32px tall) |
| My Charts | 2.2 | 132 | 54 | 50 |
| Career Decoder | 2.5 | 102 | 43 | 11 |
| Synthesizer | 2.3 | 120 | 25 | 33 |

- 38% of the text blocks on Graha Arudhas are smaller than 12px.
- My Charts shows 50 controls at once.
- **On a phone, the top bar is 154px, 19% of the screen**, and it never scrolls away. It holds a workspace dropdown, the chart picker, ⌘K (useless on a phone), a theme toggle and an Appearance dropdown.
- **On a phone, My Charts is 7.9 screens long and the chart wheel starts 2.8 screens down.**

### 2.6 Look and feel: no enforced system

Measured across the app:

| Property | Distinct values in use | A disciplined system uses |
|---|---|---|
| Colours | 79 | 12–16 |
| Corner radii | 19 (1px to 20px, plus pills) | 3–4 |
| Shadows | 9 | 2–3 |
| Text sizes on one screen | 9 to 17 (range 9.5px–44px) | 5–6 |
| Breakpoints | 17 different widths | 3 |

- **The display typeface never appears.** `index.html` sets Fraunces; `tokens.css` overrides it with Georgia. The page still downloads Fraunces from Google Fonts and never uses it.
- A decorative mandala sits in the top bar, cropped by the bar's edge and overlapping the page title. It carries no information.
- ~~There are two theme controls side by side.~~ Correction: the ◐ button is the colour-blind palette toggle, not a second theme control. It is icon-only, so it relies on its tooltip and label.
- The chart wheel is dark in both themes, so in light theme it looks pasted in.
- Every tool invented its own cards, chips and selectors, so nothing learned on one page transfers to the next.

### 2.7 Consistency of interaction

- Each chart tool has its own selectors for chart, reference point and planet, in different places and styles.
- 18 of 65 form fields have no label a screen reader can announce.
- Hover explanations, levels of detail and a legend exist only in the Bhava Mandala. The other eleven chart tools have none of them.

### 2.8 Data safety

- Charts and journal entries live only in the browser's storage. Clearing site data or switching device loses everything, and there is no export or backup.

### 2.9 Code structure that causes the UX problems

These are engineering facts, listed because each one produces a user-facing symptom above.

| Fact | Symptom it causes |
|---|---|
| One 13,560-line, 1 MB `index.html` | Every feature is built in isolation; patterns drift |
| 1,775 CSS rules, 157 `!important`, 5 stylesheets layered on top of the inline one | Layout bugs like the wheel being squeezed to 418px (fixed in Phase 1 of the Mandala work) |
| 884 inline styles, 109 inline event handlers | The colour and radius sprawl in 2.6 |
| All 16 workspaces rendered into the page at once (8,315 elements) | Leftover blocks from other pages showing through |
| No interface tests | Four `window.JA` features were silently dead until this week |

Load speed is not a problem today: the page is ready in about a quarter of a second locally. PDF.js (313 KB) loads on every visit though only chart import needs it.

---

## 3. The target experience

### 3.1 Principles

1. **Your chart is the home.** Everything is a way of looking at one chart, so the chart stays on screen.
2. **Questions, not techniques.** Menus use the user's words. Sanskrit terms appear as secondary labels with a tap-to-explain glossary.
3. **Show one thing, offer the next.** Each screen has one main idea and one obvious next step. Depth is opt-in.
4. **One of everything.** One navigation, one chart picker, one date control, one level-of-detail switch, one card style.
5. **Honest framing.** Tendencies and timing windows, never predictions of fate.

### 3.2 New organisation: 16 destinations become 5

| New area | What it answers | Absorbs |
|---|---|---|
| **Today** | What is the sky doing for me now? | Personal Almanac, Life Journal |
| **My Chart** | Who am I, by area of life? | My Charts, Rāśi Guide, Career Decoder, Relationship Decoder, Graha Arudhas |
| **Timing** | When? | Life Predictor, Life Outlook, Opportunity Windows |
| **Learn** | How does this work? | Learn, Synthesizer, Practice |
| **Ask** | A specific question, or a second opinion | Prashna, Prompt Builder, Compare Charts |

Chart management (create, import, switch, delete, export) moves into the chart picker in the top bar, which already exists.

### 3.3 My Chart: one workspace, topic lenses

The wheel stays on the left. A row of topics replaces five separate pages:

`Overview · Self · Career · Relationships · Money · How others see me · All 12 houses`

- Choosing a topic highlights the relevant houses and planets on the wheel and shows a plain-language reading beside it.
- "Career" is today's Career Decoder; "Relationships" is the Relationship Decoder; "How others see me" is Graha Arudhas. The method name appears as a small caption ("Method: Graha Arudha").
- The Beginner / Intermediate / Expert switch built for the Mandala becomes app-wide and controls how much technical detail every topic shows.

### 3.4 Timing: one timeline

One horizontal timeline of life periods, with today marked.

- Zoom levels: life, decade, year, month.
- Toggle overlays instead of separate tools: "Opportunity windows" (from Opportunity Windows), "Good dates for…" (from Life Outlook).
- Selecting a period explains it in plain words and moves the My Chart wheel to that date.

### 3.5 First run

1. One screen: "Enter your birth details" with three fields, and "Explore a sample first" underneath.
2. The sample chart is a complete one, with dates, so nothing shows "not available".
3. After a chart exists, the "How this chart is made" intro plays once, then lands on My Chart → Overview with three sentences about the person and one suggested next step.

### 3.6 Phone layout

- A bottom tab bar with the five areas replaces the 154px top bar.
- The top bar shrinks to one 48px row: chart name and a menu button. Theme and appearance move into the menu.
- In My Chart the wheel fills the width; readings open in a sheet that slides up from the bottom, with the house cards already built.

### 3.7 Visual system

| Token | Values |
|---|---|
| Type sizes | 12, 14, 16, 20, 28, 40. Nothing below 12px. |
| Typefaces | One display serif, shipped with the app (so it works offline), and Inter for text. Decide Fraunces or Georgia and delete the other. |
| Spacing | 4, 8, 12, 16, 24, 32, 48 |
| Radii | 6 (controls), 12 (cards), pill |
| Shadows | 2 levels |
| Colour | Background ×3, text ×2, border, gold accent, plus 4 meaning colours (supportive, mixed, demanding, neutral) that also differ by shape or icon |
| Breakpoints | 640, 1024, 1440 |

Components to build once and reuse everywhere: button, segmented switch, select, card, reading block, chip, meter, empty state, explainer popover, bottom sheet, timeline.

### 3.8 The Cosmic Body (Kālapuruṣa) lesson

- **Where:** Learn, as the last lesson of the Alphabet chapter, after "The 27 Nakshatras" and before the Synthesizer. Not in My Chart and not a new menu item.
- **What:** the 12 signs or houses from head to feet, the 27 nakshatras on a scale beside the body, and optionally the reader's own planets at their exact degrees (houses then count from their rising sign).
- **Sources:** Brihat Jataka 1.4 by default, with a switch to BPHS (they differ at Gemini and Virgo). The page names its source and says it is traditional symbolism, not medical advice.
- **Links:** "See it on the body" from the Signs, Houses and Nakshatras lessons opens it with that item selected.
- **In the five-area plan:** it stays in Learn. A small Today overlay is optional later.

---

## 4. Roadmap

Each phase ships on its own and leaves the app working. Effort is rough, for one developer.

### Phase 0: Baseline (2–3 days)

1. Write five tasks for a newcomer: create a chart; find what your chart says about career; find out whether next month is a good time for something; learn what a "house" is; come back tomorrow and find your chart.
2. Watch five people who know no astrology attempt them. Record time, wrong turns and the words they use.
3. Record today's numbers from section 2 as the baseline.

**Done when:** there is a one-page findings summary and a baseline table.

### Phase 1: Quick wins, no restructuring (about 1 week)

1. Remove the four "Learn / Synthesize / My Charts / Practice" cards from every workspace page.
2. Remove the Previous/Next footer from tool pages; keep it inside the guided Learn course only.
3. Make Life Predictor use the active chart's birth date; never ask for data the app already has.
4. Give the sample chart full dasha dates, and stop "Try a sample chart" creating duplicates.
5. Remove the header mandala and the duplicate theme control.
6. Resolve the display font: pick one, ship it locally, delete the unused Google Fonts request.
7. Rename menu entries in plain words with the term as a caption: "Signs in my chart (Rāśi)", "How others see me (Arudhas)", "Ask a question (Prashna)".
8. Rewrite every empty state as: one sentence on what's missing, one button that fixes it.
9. Raise all text below 12px to 12px.
10. Label the 18 unlabeled form fields.

**Done when:** no page shows content belonging to another page, the sample chart has no "not available" rows, and no text is under 12px.

### Phase 2: Design tokens and components (1–2 weeks)

1. Put the token table from 3.7 into `tokens.css` as the only source of colours, sizes, radii and shadows.
2. Build the shared components listed in 3.7.
3. Convert screens one at a time, deleting each screen's private styles as it moves.
4. Add a check that fails when a colour or pixel size is written outside the tokens file.

**Done when:** distinct colours ≤ 16, radii ≤ 4, text sizes ≤ 6, `!important` count under 20.

### Phase 3: Reorganise into five areas (2 weeks)

1. Build the five-item navigation (side rail on desktop, bottom tabs on phones).
2. Keep every old link working by redirecting it to its new home.
3. Move chart create/import/switch/delete into the top-bar chart picker.
4. Remove the "Predictions / Learn Jyotish" switch; Today and Learn replace it.
5. Update ⌘K to search topics and questions ("career", "when", "marriage") as well as page names.

**Done when:** every feature is reachable in two clicks from anywhere, and old bookmarks still land correctly.

### Phase 4: My Chart as one workspace (2–3 weeks)

1. Make the wheel persistent in My Chart.
2. Add the topic row; wire Career, Relationships, "How others see me" and Signs as topics that highlight the wheel.
3. Apply the Beginner / Intermediate / Expert switch to every topic.
4. Reuse the hover explainer and legend across all topics.
5. Cut each topic's first view to one screen: a three-sentence summary, the highlighted wheel, and "Show the reasoning".

**Done when:** no topic's first view is longer than 1.5 screens, and the same wheel, picker and level switch are used everywhere.

### Phase 5: One Timing view (2 weeks)

1. Build the zoomable timeline with today marked.
2. Fold Opportunity Windows and Life Outlook in as overlays.
3. Link the timeline's selected date to the wheel's transit date.
4. Rename "Life Predictor" (for example "Life timeline") and reword green/red as "supportive / demanding periods" with icons as well as colour.

**Done when:** "when?" has one entry point and the three old pages redirect to it.

### Phase 6: First run and data safety (1 week)

1. Build the single-screen start described in 3.5.
2. Add "Export my data" and "Import my data" (one file containing charts and journal).
3. Show a gentle reminder to export after a chart or journal entry has existed for a week without a backup.

**Done when:** a new visitor reaches a personal reading in under 60 seconds, and data can move between devices.

### Phase 7: Phone experience (1–2 weeks)

1. Bottom tab bar and 48px top bar.
2. Readings in a bottom sheet.
3. Check every screen at 375px for touch targets of 44px or more and no sideways page scrolling.

**Done when:** the top bar is under 8% of the screen and the wheel is visible without scrolling in My Chart.

### Phase 8: Structure of the code (2–3 weeks, can run alongside 2–5)

1. Split `index.html` into one file per area, with shared data, calculation and component modules. Keep it a static, offline app with no server.
2. Render only the area being viewed.
3. Load PDF.js only when someone imports a file.
4. Replace inline event handlers and inline styles with the shared components.
5. Add interface tests for the five tasks from Phase 0 so features can't silently die again.

**Done when:** no source file is over about 1,500 lines, and the five tasks run as automated tests.

### Phase 9: Trust and polish (ongoing)

1. One glossary: every term is tappable and explained in a sentence, in every area.
2. One spelling rule for Sanskrit: plain transliteration by default, diacritics at Expert level.
3. A short "How to read this app" note on what Jyotish claims and what this tool is: a teaching aid.
4. Make the wheel follow the light theme.
5. Motion: one easing and two durations, used consistently.
6. A full keyboard and screen-reader pass on each area.

---

## 5. Measures of success

| Measure | Today | Target |
|---|---|---|
| Top-level destinations | 16 | 5 |
| Ways to navigate | 6 | 2 (menu and ⌘K) |
| Time for a newcomer to reach a personal reading | not measured | under 60 seconds |
| Newcomers completing the 5 tasks unaided | not measured | 4 of 5 people, all 5 tasks |
| Longest first view of any page (desktop) | 5.1 screens | 1.5 screens |
| Text under 12px (worst page) | 84 blocks | 0 |
| Controls visible at once (worst page) | 50 | 12 or fewer |
| Phone top bar share of screen | 19% | under 8% |
| Phone: screens before the wheel in My Chart | 2.8 | 0 |
| Distinct colours / radii / text sizes | 79 / 19 / up to 17 | 16 / 4 / 6 |
| Unlabeled form fields | 18 of 65 | 0 |
| Dead ends with an active chart | at least 2 | 0 |
| Data export | none | one-click |

---

## 6. Order of priority

If only three things get done, do these:

1. **Phase 1** removes the visible mess in a week.
2. **Phase 3** fixes the organisation, which is the root problem.
3. **Phase 4** turns five disconnected tools into one chart-centred experience.

The visual system (Phase 2) makes those cheaper to build, so start it alongside Phase 1.

## 7. Limits of this audit

- No real users were observed. Section 2 is expert judgement backed by measurement; Phase 0 may reorder priorities.
- The Learn course content, the reading text itself and screen-reader behaviour were not reviewed in depth.
- Measurements used the demo chart at two screen sizes in dark theme.
