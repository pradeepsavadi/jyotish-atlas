# Jyotish Atlas

**A living, interactive primer to Parashara's grammar of Vedic astrology.**

Open `index.html` in any modern browser — no server, no install, no internet required after the first load (the nakshatra profile cards are fully offline).

---

## What it does

| Section | Description |
|---|---|
| **The idea** | Why Vedic astrology is a grammar (9 Grahas × 12 Rashis × 12 Bhavas), not a list to memorize |
| **9 Grahas** | Click any planet — nature, karakatvas, dignity, body, weekday |
| **12 Rashis** | Element, modality, ruler and body for each sign |
| **12 Bhavas** | House significations and classical categories (Kendra, Trikona, Dusthana…) |
| **Synthesizer** | Place a planet (D-1 sign + degree + house) → get the full layered reading including **D-9 Navamsa** (promise vs delivery), dignity, Nakshatra and Drishti. Switch to **Empty house** mode to read a house through its lord |
| **My Charts** | Upload any `.txt` chart file (JHora / Parashara's Light format) → see every planet's D-1, **Nakshatra** (clickable), D-9 and combined verdict. Click a planet to open it in the Synthesizer. Click an empty house to analyze it through its lord |
| **BAV** | **Bhinna Ashtakavarga** for all 7 planets + Sarvashtakavarga, computed from the natal positions. Colour-coded by strength (5+ green → 1 red), natal house outlined, best/worst transit houses surfaced |
| **Practice** | Endless quiz drawn from the data — exaltations, lordships, karakas, house meanings |

---

## Adding your chart

1. Open the app → scroll to **My Charts** → click **＋ Add chart**
2. Either **📁 Upload a .txt file** directly, or paste the planetary longitude table
3. The parser reads the `Lagna`, `Sun … Ketu` lines with their sign and degree
4. Chart is saved in your browser (localStorage) — survives reloads

Compatible with JHora and Parashara's Light `.txt` export format.

---

## Technical notes

- **Single file** — everything is self-contained in `index.html`; just open it
- **Built-in regression guard** — open `index.html#selftest` to run 13 sanity checks (Navamsa + core data invariants). It stays inert during normal use.
- **Navamsa (D-9)** computed from each planet's degree using the classical `NAV_START = [Aries, Capricorn, Libra, Cancer]` rule; validated against four real natal charts (0 errors)
- **BAV tables** validated sign-by-sign against four natal charts (23/23 rows exact). Two commonly-printed table errors (Moon and Venus) were corrected via a four-chart constraint solver
- **Nakshatra** computed as `floor(lon / 13°20')` with pada as `floor(remainder / 3°20') + 1`; validated 11/11 against chart files
- **No external dependencies** except the Google Fonts fallback in the system font stack

---

## Accuracy caveats

- Dignity uses **natural (naisargika) friendships** only; compound (tatkalika) friendships require a full chart and are not included
- BAV does **not** include Rahu/Ketu contributions (classical BPHS excludes them from the seven-planet BAV)
- The app is a teaching tool, not a replacement for a full Jyotish software

---

## Roadmap (not yet built)

- [ ] Shad Bala / Shadbala strength meter
- [ ] Yoga recognizer (Pancha Mahapurusha, Raja, Dhana)
- [ ] Vimsottari dasha clock
- [ ] North Indian chart diagram (clickable houses)
- [ ] Combine with the **Yearly Astrological Days** transit calendar

---

## License

MIT — free to use, share and adapt. Attribution appreciated.
