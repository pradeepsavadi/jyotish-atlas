const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('global-chart.js','utf8');
const ctx=vm.createContext({});
vm.runInContext(source.slice(source.indexOf('  /* restore-sanitizers'),source.indexOf('  function importData'))+';this.mergeBackup=mergeBackup;',ctx);
const planets=sign=>Object.fromEntries(['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'].map((k,i)=>[k,{sign:(sign+i)%12,deg:i+1}]));
const chart=(name,sign)=>({name,La:{sign,deg:1},planets:planets(sign)});
const ev=(id,title,extra={})=>({id,ms:1700000000000,cat:'career',title,...extra});

// Merge adds what is missing, never duplicates or overwrites.
const current={jyotish_charts_v1:[chart('Mine',0)],jyotish_journal_v1:{Mine:[ev('a1','one')]}};
const {store,added}=ctx.mergeBackup(current,{
  jyotish_charts_v1:[chart('Mine',0),chart('Sister',4)],
  jyotish_journal_v1:{Mine:[ev('a1','changed'),ev('b2','two')],Sister:[ev('c3','three')]}
});
assert.equal(added.charts,1);assert.equal(added.journal,2);
assert.deepEqual(store.jyotish_charts_v1.map(c=>c.name),['Mine','Sister']);
assert.equal(store.jyotish_journal_v1.Mine.find(e=>e.id==='a1').title,'one','existing entry not overwritten');
assert.equal(store.jyotish_journal_v1.Mine.length,2);
assert.equal(store.jyotish_journal_v1.Sister.length,1);
assert.equal(current.jyotish_charts_v1.length,1,'input store not mutated');
assert.equal(ctx.mergeBackup(store,{jyotish_charts_v1:store.jyotish_charts_v1,jyotish_journal_v1:store.jyotish_journal_v1}).added.charts,0,'re-import adds nothing');

// Only the charts and journal keys are restored.
const other=ctx.mergeBackup({},{jyotish_active_chart_v1:'<img src=x onerror=alert(1)>',jyotish_evil:{x:1}});
assert.deepEqual(Object.keys(other.store),[]);

// Charts are rebuilt from known fields: markup stripped, unknown fields dropped, bad data rejected.
const evil={...chart('<img src=x onerror=alert(1)>',2),birthDate:'<script>x</script>1990',extra:'<b>x</b>',
  La:{sign:2,deg:1,html:'<svg onload=x>'},dashas:{mahas:[{lord:'Su',start:1,end:2,note:'<i>',antars:[{lord:'<x>',start:1}]},{lord:'XX',start:1}]},
  birthDetails:{place:'Pune<script>',lat:18.5,lon:'73.8',evil:'<x>'}};
const r=ctx.mergeBackup({},{jyotish_charts_v1:[evil,{name:'no positions'},{...chart('bad sign',0),La:{sign:'0',deg:1}}]});
assert.equal(r.added.charts,1,'malformed charts skipped');
const c=r.store.jyotish_charts_v1[0];
assert.ok(!/[<>"']/.test(c.name+c.birthDate+c.birthDetails.place),'text loses markup characters');
assert.equal(c.extra,undefined);assert.equal(c.La.html,undefined);assert.equal(c.birthDetails.evil,undefined);
assert.equal(c.birthDetails.lat,18.5);assert.equal(c.birthDetails.lon,undefined,'non-numeric coordinate dropped');
assert.equal(c.dashas.mahas.length,1,'period with unknown planet dropped');
assert.equal(c.dashas.mahas[0].note,undefined);assert.equal(c.dashas.mahas[0].antars.length,0);

// Journal entries are rebuilt too: unsafe ids replaced, categories checked, markup stripped.
const j=ctx.mergeBackup({},{jyotish_journal_v1:{'Mine"><img>':[
  ev('x" onclick="alert(1)','<img src=x onerror=alert(1)>',{cat:'<b>',timezone:'UTC"><x>',dasha:{md:'Su',ad:'<x>'},transit:{moon:{sign:3,label:'<b>x</b>'},fn:'<i>'}}),
  {id:'ok',ms:'not a number',cat:'career',title:'skip me'},
  null
]}});
assert.equal(j.added.journal,1);
const [name]=Object.keys(j.store.jyotish_journal_v1);
assert.ok(!/[<>"']/.test(name),'journal chart key cleaned');
const e=j.store.jyotish_journal_v1[name][0];
assert.match(e.id,/^[A-Za-z0-9-]+$/,'unsafe id replaced');
assert.equal(e.cat,'other');assert.ok(!/[<>"']/.test(e.title));
assert.equal(e.timezone,undefined);assert.deepEqual({...e.dasha},{md:'Su',ad:null,pd:null});
assert.ok(!/[<>]/.test(JSON.stringify(e.transit)),'snapshot kept as plain data');

console.log('Backup restore: merges without overwriting, restores only charts and journal, rebuilds every record from a strict schema.');
