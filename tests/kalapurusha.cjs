const assert=require('node:assert/strict');
const kp=require('../kalapurusha.js');

// Classical figure: Aries at the head, Pisces at the feet.
assert.equal(kp.zoneOf(0,0),0);
assert.equal(kp.zoneOf(359.9,0),11);
assert.equal(kp.bodyY(0,0),kp.ZONE_Y[0]);
assert.ok(Math.abs(kp.bodyY(360-1e-9,0)-kp.ZONE_Y[12])<1e-6);
// Height grows monotonically from head to feet.
for(let l=0;l<359;l++) assert.ok(kp.bodyY(l+1,0)>kp.bodyY(l,0),`monotonic at ${l}`);
// Mid-sign degrees land mid-zone: 15° Libra (sign 6) is halfway down the lower-abdomen band.
assert.equal(kp.bodyY(6*30+15,0),(kp.ZONE_Y[6]+kp.ZONE_Y[7])/2);

// Counting from a rising sign: with Leo rising, Leo is the head (house 1) and Cancer the feet.
assert.equal(kp.zoneOf(4*30+1,4),0);
assert.equal(kp.zoneOf(3*30+29,4),11);

// Nakshatras per sign: 2¼ each, so every sign holds three, at least one only partly.
assert.deepEqual(kp.nakshatrasInSign(0).map(n=>n.name),['Ashwini','Bharani','Krittika']);
assert.equal(kp.nakshatrasInSign(0)[2].partial,true);
assert.deepEqual(kp.nakshatrasInSign(11).map(n=>n.name),['Purva Bhadrapada','Uttara Bhadrapada','Revati']);
for(let s=0;s<12;s++) assert.equal(kp.nakshatrasInSign(s).length,3,`sign ${s}`);

// The two classical lists differ only at Gemini and Virgo.
const differ=kp.BODY.bj.map((b,i)=>b[0]!==kp.BODY.bphs[i][0]?i:-1).filter(i=>i>=0);
assert.deepEqual(differ,[2,5]);

console.log('Kalapurusha body mapping, house counting, nakshatra spans and source differences passed.');
