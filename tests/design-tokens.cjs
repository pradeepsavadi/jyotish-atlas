// Ratchet for the design system (UX roadmap, Phase 2). Counts distinct raw values written in the
// stylesheets. Converting a screen to tokens lowers these numbers; adding new one-off values
// fails the test. When a conversion lowers a count, lower the ceiling here to lock it in.
const fs=require('node:fs'),assert=require('node:assert/strict');
const files=['index.html','tokens.css','app-shell.css','global-chart.css','observatory.css','mobile.css'];
const css=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const uniq=re=>new Set([...css.matchAll(re)].map(m=>m[1].toLowerCase()));
const radii=uniq(/border-radius:\s*([0-9.]+px)/g), sizes=uniq(/font-size:\s*([0-9.]+px)/g);
const colours=uniq(/(#[0-9a-f]{6}|#[0-9a-f]{3})\b/gi), important=(css.match(/!important/g)||[]).length;
const CEILING={radii:19,sizes:25,colours:241,important:190};
assert.ok(radii.size<=CEILING.radii,`distinct border radii ${radii.size} > ${CEILING.radii}: use --radius-* tokens`);
assert.ok(sizes.size<=CEILING.sizes,`distinct font sizes ${sizes.size} > ${CEILING.sizes}: use --fs-* tokens`);
assert.ok(colours.size<=CEILING.colours,`distinct hex colours ${colours.size} > ${CEILING.colours}: use colour variables`);
assert.ok(important<=CEILING.important,`!important count ${important} > ${CEILING.important}`);
// No text below the 12px floor, except the tiny ℞ badge on planet emblems.
const tiny=[...css.matchAll(/([^{}]*)\{[^}]*font-size:\s*([0-9.]+)px/g)].filter(m=>parseFloat(m[2])<12&&!m[1].includes('hs-emblem.retro'));
assert.deepEqual(tiny.map(m=>m[1].trim()),[],'font sizes below 12px');
for(const t of ['--fs-xs','--sp-4','--radius-md','--radius-pill']) assert.ok(fs.readFileSync('tokens.css','utf8').includes(t+':'),`token ${t} defined`);
console.log(`Design tokens: ${radii.size} radii, ${sizes.size} font sizes, ${colours.size} colours, ${important} !important (all within ceilings); no text under 12px.`);
