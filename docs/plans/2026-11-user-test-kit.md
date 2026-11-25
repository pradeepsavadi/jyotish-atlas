# Jyotish Atlas: user-test kit (roadmap Phase 0)

**Purpose:** watch five people who know little or no astrology use the app, so the bigger reorganisation (Phases 3–5 of [the UX roadmap](2026-11-ux-audit-and-roadmap.md)) is driven by evidence rather than opinion.
**Time:** about 30 minutes per person, plus 10 minutes to write up.
**What you need:** the app open in a fresh browser profile (no saved charts), a timer, and this sheet.

---

## 1. Who to invite

- 5 people. At least 3 should have never studied astrology; 1–2 can be curious beginners.
- At least 2 should use their phone for the session.
- Avoid people who have seen the app before.

## 2. Before each session

1. Use a fresh browser profile or a private window, so there are no saved charts.
2. Ask the participant for their birth date, time and place in advance, or have a made-up set ready (for example: 14 March 1990, 06:30, Pune).
3. Say this, word for word:

> "I'm testing the app, not you. There are no wrong answers. Please think out loud: say what you're looking for, what you expect, and what surprises you. I won't help unless you're completely stuck."

## 3. The five tasks

Give one task at a time, on a card. Don't use the words on the screen (for example, don't say "Kundali" or "dasha").

| # | Task (read aloud) | Success looks like | Stop after |
|---|---|---|---|
| 1 | "Make a chart for yourself." | A chart is created and active. | 5 min |
| 2 | "Find out what your chart says about your work or career." | Reaches career content (Work and career, or the 10th house reading) and can say one thing it means for them. | 5 min |
| 3 | "Is next month a good time to start something new? Find out what the app suggests." | Reaches a timing view (Life timeline, Year by year, When doors open, or transit controls) and can describe the answer. | 5 min |
| 4 | "Find out what a 'house' is in astrology." | Reaches the Houses lesson or the Cosmic Body lesson and explains it in their own words. | 4 min |
| 5 | "Imagine it's tomorrow. Come back and find your chart again." (Reload the page.) | Their chart is still there and active. | 2 min |

## 4. What to record for each task

Use one row per task per person.

| Measure | How |
|---|---|
| Completed? | Yes / with help / no |
| Time | From reading the card to success or stop |
| Wrong turns | Each time they open a page that doesn't help |
| Words they used | Write down the words they search or look for ("career", "future", "marriage"): these become menu labels and ⌘K keywords |
| Confusing terms | Any word they ask about or skip over |
| Quotes | One sentence they said that captures the experience |

## 5. After the five tasks (5 minutes)

Ask:

1. "In one sentence, what is this app for?"
2. "What was the most confusing moment?"
3. "What did you like most?"
4. "Would you come back to it? What would bring you back?"
5. "Did anything feel like it was telling you your fate?" (checks the honest-framing goal)

## 6. Summarising (after all five)

Fill in this table and compare it with the baseline in the roadmap's section 5.

| Measure | Result | Target |
|---|---|---|
| People completing all 5 tasks unaided | _ of 5 | 4 of 5 |
| Median time to create a chart (task 1) | _ | under 60 seconds to a first reading |
| Task with most wrong turns | _ | — |
| Top 5 words people looked for | _ | — |
| Top 5 confusing terms | _ | — |
| People who felt it predicted fate | _ of 5 | 0 |

Then write a one-page findings note in `docs/plans/` with:

1. The three biggest problems, each with the evidence (which task, how many people, a quote).
2. Whether the evidence supports the five-area reorganisation (roadmap Phase 3) as written, and what to change if not.
3. Menu labels and ⌘K keywords to add, from the words people used.

## 7. What changed since the audit (so you test the current app)

Already done before this test: the leftover home cards are gone from every page, menu items use plain names with the technique name underneath, Life timeline and Year by year use the active chart, the sample chart has life periods, there is a Cosmic Body lesson in Learn, and a backup option in the chart menu. Task 5 also checks that saved data survives a reload.
