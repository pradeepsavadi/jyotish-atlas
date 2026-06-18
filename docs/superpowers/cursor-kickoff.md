# Cursor Kickoff Prompts — Warm Celestial Redesign

Copy-paste prompts for driving Cursor's agent through the redesign.

- **Plan (source of truth):** `docs/superpowers/plans/2026-06-17-warm-celestial-redesign.md`
- **Spec (design rationale):** `docs/superpowers/specs/2026-06-17-warm-celestial-redesign-design.md`
- **Branch:** `cursor/ux-a11y-quick-wins` (rebased on latest `main`)
- **PR target (when done):** `pradeepsavadi/jyotish-atlas:main` ← `cursor/ux-a11y-quick-wins` — opened manually, not by Cursor.

---

## 1. Initial kickoff (start from Task 1)

> Use this for a fresh start. Phase 1 (Tasks 1–6) is already complete on the branch, so in practice use the continuation prompt below — keep this for reference / re-runs.

```
You are implementing the "Warm Celestial" redesign of Jyotish Atlas.

READ FIRST (both are committed in the repo):
- Plan:  docs/superpowers/plans/2026-06-17-warm-celestial-redesign.md
- Spec:  docs/superpowers/specs/2026-06-17-warm-celestial-redesign-design.md

The plan is the source of truth. Execute it task-by-task, in order, Task 1 → Task 19.

PROJECT SHAPE
- Single self-contained file: index.html (~7348 lines). No build step, no npm,
  no dependencies, no network at runtime. Everything ships inline.
- It must keep working by just opening the file: open index.html in a browser.

HARD RULES (do not break)
1. NEVER modify the validated astrology computation: navamsaSign (~line 2032),
   NAV_START, dignityOf (~2160), BAV/Sarvashtakavarga, nakshatra math, the .txt
   chart parser, and the divisional/Jaimini/avastha/dasha logic. This redesign is
   PRESENTATION + AUTHORED CONTENT only. If a task seems to need a logic change,
   STOP and ask me.
2. Preserve every existing id= anchor (#why #grahas #rashis #bhavas #synth #charts
   #promptbuilder #bbavam #arudhas #outlook #lifepredictor #compare #quiz) so deep
   links and the command palette keep working.
3. Keep all CSS custom-property NAMES (--bg --panel --gold --accent --exalt --debil
   etc.). Change their values, add a few new tokens. Existing rules rely on the names.
4. Every animation must be disabled under @media (prefers-reduced-motion: reduce).

VERIFICATION (there is no test runner)
- Task 1 adds a #selftest guard. After each task, open index.html#selftest and
  confirm the tab title reads "✅ selftest 13/13" (it asserts navamsa values + graha
  data). If it ever shows ❌, you broke the engine — fix before continuing.
- Also visually open index.html (no hash) and check the section you changed in BOTH
  dark and light themes.

WORKFLOW
- Do ONE task at a time. After each task: run the #selftest check, then commit with
  the exact commit message given in that task, then move to the next.
- Use the complete code provided in the plan. Where a task says "author the other N
  to the same shape," follow the worked example's structure and the classical
  attributes already in the GRAHAS/RASHIS/BHAVAS/NAK data.
- After each PHASE (1–5), pause and tell me what changed so I can eyeball it in the
  browser before you continue.

Start with Task 1 (the #selftest regression guard). Confirm it shows ✅ 13/13 on the
current code before making any visual changes.
```

---

## 2. Continuation (resume at Task 7 — current next step)

> Phase 1 (Tasks 1–6) is committed. Use this to finish Phases 2–5.

```
Continue implementing the Warm Celestial redesign.

Phase 1 (Tasks 1–6) is already done and committed. Resume at Task 7 and work
through Task 19 in order.

Plan (source of truth): docs/superpowers/plans/2026-06-17-warm-celestial-redesign.md

Same hard rules as before:
- index.html only; no build step, no dependencies, no network at runtime.
- NEVER modify the compute logic: navamsaSign, NAV_START, dignityOf, the .txt
  parser, BAV/Sarvashtakavarga, nakshatra math, divisional/Jaimini/avastha/dasha.
  Presentation + authored content ONLY. If a task seems to need a logic change, STOP.
- Preserve all 13 id= section anchors and all CSS token NAMES.
- All animation must be disabled under prefers-reduced-motion.

After EACH task: open index.html#selftest, confirm the tab title is "✅ 13/13",
then commit with the exact message in the plan. Do not refactor anything outside
the current task.

After each PHASE (2, 3, 4, 5), pause and summarize what changed so I can review in
the browser (dark + light themes) before you continue.

When Task 19 is done and #selftest is still ✅ 13/13, push the branch and tell me —
do NOT open a PR yourself; I'll handle that.

Start with Task 7 (four-zone navigation).
```

---

## Progress

- [x] **Phase 1 — Foundation** (Tasks 1–6): selftest guard, Warm Celestial tokens (dark + light), manuscript typography, emblem system, global components. Committed + pushed.
- [ ] **Phase 2 — Learn** (Tasks 7–12): 4-zone nav, hero, authored Graha/Rashi/Bhava interpretation, Nakshatras section.
- [ ] **Phase 3 — Synthesize** (Tasks 13–14): woven Synthesizer reading; Bhavat Bhavam / Arudhas / Compare.
- [ ] **Phase 4 — My Charts** (Tasks 15–16): Charts/BAV/Dasha/divisional/Jaimini/avastha; Prompt Builder / Outlook / Predictor.
- [ ] **Phase 5 — Practice & polish** (Tasks 17–19): Quiz; motion/aura; a11y/contrast/print + final regression.
- [ ] **PR** into `pradeepsavadi/jyotish-atlas:main` (after Task 19).
