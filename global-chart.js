/* One chart context for every reading tool. Calculation modules retain their own controls,
   but the controls are synchronized and removed from the visual flow. */
(function(){
  const selectors=['bbChart','arChart','kdChart','opChart','lpChart','olChart','pbChart','jrChart'];
  const gates=['d1gBody','pbEmpty','bbEmpty','arEmpty','kdEmpty','opEmpty','lpEmpty','olEmpty','jrEmpty','synthChartBar'];
  let menu, syncing=false;
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const currentPeriod=c=>{const now=Date.now(),md=c?.dashas?.mahas?.find(x=>x.start<=now&&(!x.end||now<x.end));const ad=md?.antars?.find(x=>x.start<=now&&(!x.end||now<x.end));return{md,ad};};
  const chartFacts=c=>{
    if(!c?.La)return null;
    const lagna=SIGNS[c.La.sign]||'Lagna unavailable';
    const moon=c.planets?.Mo;const nak=moon?nakInfo(moon.sign*30+moon.deg)?.n||'Moon detail unavailable':'Moon unavailable';
    const p=currentPeriod(c),phase=p.md?`${GBYK[p.md.lord]?.name||p.md.lord} MD${p.ad?` · ${GBYK[p.ad.lord]?.name||p.ad.lord} AD`:''}`:'Daśā dates unavailable';
    return {lagna,nak,phase};
  };
  const gate=()=>`<div class="celestial-gate"><div><div class="celestial-gate-mark" aria-hidden="true">✦</div><h3>Begin with your Kundali</h3><p>Your chart becomes the shared lens for every decoder, timeline and reading in Atlas.</p><div class="celestial-gate-actions"><button type="button" class="gate-primary" data-global-chart-action="create">Create Your Kundali</button><button type="button" class="gate-secondary" data-global-chart-action="demo">Explore with Demo Chart</button><button type="button" class="gate-secondary" data-global-chart-action="import">Import text or file</button></div></div></div>`;
  function positionMenu(){const pill=document.getElementById('activeChartPill');if(!pill||!menu)return;const box=pill.getBoundingClientRect();menu.style.top=`${box.bottom+8}px`;menu.style.left=`${Math.max(12,box.right-Math.min(340,window.innerWidth-24))}px`;}
  function closeMenu(){if(menu)menu.hidden=true;document.getElementById('activeChartPill')?.setAttribute('aria-expanded','false');}
  function renderMenu(){
    if(!menu)return;const charts=JA.getCharts?.()||[],active=JA.getActiveIndex?.();
    menu.innerHTML=`<p>Switch active Kundali</p>${charts.map((c,i)=>`<div class="gcm-chart"><button type="button" data-chart-index="${i}" ${i===active?'aria-current="true"':''}><span>${i===active?'✦':'○'}</span><span>${escape(c.name||`Chart ${i+1}`)}</span></button><button type="button" class="gcm-remove" data-remove-index="${i}" aria-label="Remove ${escape(c.name||`Chart ${i+1}`)}" title="Remove chart">×</button></div>`).join('')}<button type="button" class="gcm-new" data-global-chart-action="create">＋ Create from birth details</button><button type="button" data-global-chart-action="import">⇧ Import chart text / .txt / .pdf</button><button type="button" data-global-chart-action="demo">Explore with Demo Chart</button>${charts.length?'<button type="button" data-global-chart-action="manage">Manage saved charts</button>':''}`+
      `<p>Your data</p>${backupDue()?'<div class="gcm-backup-note">Your charts and journal live only in this browser. A backup file keeps them safe.</div>':''}`+
      `<button type="button" data-global-chart-action="backup">⇩ Back up my data</button><button type="button" data-global-chart-action="restore">⇧ Restore from a backup</button>`+
      `<p class="gcm-backup-when">${lastBackupText()}</p>`;
    positionMenu();
  }

  /* ---- Backup and restore ----
     Everything lives in this browser's storage. A backup is one JSON file with the charts,
     the journal and any other saved data (keys starting "jyotish_"). Restoring MERGES: it adds
     charts and journal entries this browser doesn't have and never deletes or overwrites. */
  const BACKUP_FORMAT='jyotish-atlas-backup', LAST_BACKUP='ja.lastBackup', FIRST_DATA='ja.firstDataSeen';
  const DAY=86400000;
  const read=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
  const write=(k,v)=>{try{localStorage.setItem(k,v);return true;}catch(e){return false;}};
  function dataKeys(){const out=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('jyotish_'))out.push(k);}}catch(e){}return out;}
  function hasData(){return (JA.getCharts?.()||[]).length>0||Object.keys(JSON.parse(read('jyotish_journal_v1')||'{}')).length>0;}
  function backupDue(){
    if(!hasData())return false;
    const now=Date.now(),first=Date.parse(read(FIRST_DATA)||''),last=Date.parse(read(LAST_BACKUP)||'');
    if(!Number.isFinite(first)){write(FIRST_DATA,new Date(now).toISOString());return false;}
    return Number.isFinite(last)?now-last>30*DAY:now-first>7*DAY;
  }
  function lastBackupText(){const last=Date.parse(read(LAST_BACKUP)||'');return Number.isFinite(last)?`Last backup ${new Date(last).toLocaleDateString()}`:'Not backed up yet';}
  function exportData(){
    const data={};dataKeys().forEach(k=>{try{data[k]=JSON.parse(read(k));}catch(e){data[k]=read(k);}});
    const file={format:BACKUP_FORMAT,version:1,exportedAt:new Date().toISOString(),data};
    const blob=new Blob([JSON.stringify(file,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`jyotish-atlas-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    write(LAST_BACKUP,new Date().toISOString());updatePill();
    JA.toast?.(`Backup saved: ${(data.jyotish_charts_v1||[]).length} charts, ${Object.values(data.jyotish_journal_v1||{}).reduce((n,a)=>n+(Array.isArray(a)?a.length:0),0)} journal entries`,'ok');
  }
  /* restore-sanitizers: a backup is an untrusted file. Nothing from it is stored as-is: each
     chart and journal entry is rebuilt from known, type-checked fields (numbers stay numbers,
     planet keys come from a fixed list, text loses markup characters). Unknown fields and
     malformed records are dropped, and only the charts and journal keys can be restored. */
  const RESTORE_KEYS=['jyotish_charts_v1','jyotish_journal_v1'];
  const GRAHA_KEYS=['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'];
  const JOURNAL_CATS=['career','wealth','relationship','family','health','move','education','spiritual','other'];
  const plain=(s,max)=>typeof s==='string'?s.replace(/[<>"'&`]/g,'').slice(0,max):null;
  const inRange=(n,lo,hi)=>typeof n==='number'&&Number.isFinite(n)&&n>=lo&&n<=hi?n:null;
  function cleanPos(p){
    if(!p||typeof p!=='object')return null;
    const sign=Number.isInteger(p.sign)&&p.sign>=0&&p.sign<=11?p.sign:null,deg=inRange(p.deg,0,30);
    if(sign==null||deg==null)return null;
    const o={sign,deg};if(typeof p.retro==='boolean')o.retro=p.retro;return o;
  }
  function cleanPeriod(p,childKey,cleanChild){
    if(!p||typeof p!=='object'||!GRAHA_KEYS.includes(p.lord))return null;
    const o={lord:p.lord};
    for(const k of ['start','end','fullStart']){const v=inRange(p[k],-1e14,1e14);if(v!=null)o[k]=v;}
    if(!('start' in o))return null;
    const fy=inRange(p.fullYears,0,120);if(fy!=null)o.fullYears=fy;
    if(childKey&&Array.isArray(p[childKey]))o[childKey]=p[childKey].map(cleanChild).filter(Boolean);
    return o;
  }
  function cleanDashas(d){
    if(!d||!Array.isArray(d.mahas))return null;
    const mahas=d.mahas.map(m=>cleanPeriod(m,'antars',a=>cleanPeriod(a,'pratyantars',p=>cleanPeriod(p)))).filter(Boolean);
    return mahas.length?{mahas}:null;
  }
  function cleanChart(raw){
    if(!raw||typeof raw!=='object')return null;
    const La=cleanPos(raw.La);if(!La||!raw.planets||typeof raw.planets!=='object')return null;
    const planets={};GRAHA_KEYS.forEach(k=>{const p=cleanPos(raw.planets[k]);if(p)planets[k]=p;});
    if(Object.keys(planets).length<7)return null;
    const c={name:plain(raw.name,80)||'Imported chart',La,planets};
    const bd=plain(raw.birthDate,40);if(bd)c.birthDate=bd;
    const dashas=cleanDashas(raw.dashas);c.dashas=dashas;
    if(raw.birthDetails&&typeof raw.birthDetails==='object'){
      const b={};
      for(const k of ['date','time','place','timezone','offsetLabel','gender','utc','ayanamsa','node','houseSystem','engine']){const v=plain(raw.birthDetails[k],120);if(v)b[k]=v;}
      const lat=inRange(raw.birthDetails.lat,-90,90),lon=inRange(raw.birthDetails.lon,-180,180);
      if(lat!=null)b.lat=lat;if(lon!=null)b.lon=lon;
      if(Object.keys(b).length)c.birthDetails=b;
    }
    return c;
  }
  // Journal snapshots are kept for reference only: rebuild them as plain data (numbers,
  // booleans, short markup-free strings), at most four levels deep.
  function cleanPlainData(v,depth){
    if(typeof v==='number')return Number.isFinite(v)?v:null;
    if(typeof v==='boolean'||v===null)return v;
    if(typeof v==='string')return plain(v,60);
    if(depth>=4||typeof v!=='object')return null;
    if(Array.isArray(v))return v.slice(0,50).map(x=>cleanPlainData(x,depth+1));
    const o={};for(const [k,x] of Object.entries(v).slice(0,50)){if(/^[A-Za-z0-9_]{1,32}$/.test(k))o[k]=cleanPlainData(x,depth+1);}return o;
  }
  let importSeq=0;
  function cleanEvent(e){
    if(!e||typeof e!=='object')return null;
    const ms=inRange(e.ms,-1e14,1e14);if(ms==null)return null;
    const ev={id:typeof e.id==='string'&&/^[A-Za-z0-9-]{1,64}$/.test(e.id)?e.id:`imported-${Date.now().toString(36)}-${++importSeq}`,
      ms,cat:JOURNAL_CATS.includes(e.cat)?e.cat:'other',title:plain(e.title,200)||''};
    if(typeof e.timezone==='string'&&/^[A-Za-z0-9_+\-/:]{1,64}$/.test(e.timezone))ev.timezone=e.timezone;
    if(e.dasha&&typeof e.dasha==='object')ev.dasha={md:GRAHA_KEYS.includes(e.dasha.md)?e.dasha.md:null,ad:GRAHA_KEYS.includes(e.dasha.ad)?e.dasha.ad:null,pd:GRAHA_KEYS.includes(e.dasha.pd)?e.dasha.pd:null};
    if(e.transit!=null)ev.transit=cleanPlainData(e.transit,0);
    return ev;
  }
  // Pure merge, exported for tests: returns the merged store and what was added. Adds only
  // charts and journal entries this browser doesn't have; never overwrites or deletes.
  function mergeBackup(current,incoming){
    const out={...current},added={charts:0,journal:0};
    const same=(a,b)=>a&&b&&a.name===b.name&&JSON.stringify(a.La)===JSON.stringify(b.La)&&JSON.stringify(a.planets)===JSON.stringify(b.planets);
    for(const [k,v] of Object.entries(incoming||{})){
      if(!RESTORE_KEYS.includes(k))continue;
      if(k==='jyotish_charts_v1'&&Array.isArray(v)){
        const have=Array.isArray(out[k])?out[k].slice():[];
        v.forEach(raw=>{const c=cleanChart(raw);if(c&&!have.some(h=>same(h,c))){have.push(c);added.charts++;}});
        out[k]=have;
      }else if(k==='jyotish_journal_v1'&&v&&typeof v==='object'&&!Array.isArray(v)){
        // Journal shape: { chartName: [event, …] }. Keys are chart names, cleaned like names.
        const have={...(out[k]||{})};
        for(const [rawName,events] of Object.entries(v)){
          const name=plain(rawName,80);if(!name||!Array.isArray(events))continue;
          const list=Array.isArray(have[name])?have[name].slice():[];
          events.forEach(raw=>{const ev=cleanEvent(raw);if(ev&&!list.some(x=>x.id===ev.id)){list.push(ev);added.journal++;}});
          have[name]=list;
        }
        out[k]=have;
      }
    }
    return {store:out,added};
  }
  function importData(file){
    const reader=new FileReader();
    reader.onload=()=>{
      let parsed;try{parsed=JSON.parse(reader.result);}catch(e){JA.toast?.('That file isn’t a Jyotish Atlas backup. Choose the .json file saved by “Back up my data”.','warn');return;}
      if(!parsed||parsed.format!==BACKUP_FORMAT||!parsed.data){JA.toast?.('That file isn’t a Jyotish Atlas backup. Choose the .json file saved by “Back up my data”.','warn');return;}
      const current={};RESTORE_KEYS.forEach(k=>{try{const v=JSON.parse(read(k));if(v!=null)current[k]=v;}catch(e){}});
      const {store,added}=mergeBackup(current,parsed.data);
      let ok=true;for(const k of RESTORE_KEYS) if(k in store) ok=write(k,JSON.stringify(store[k]))&&ok;
      if(!ok){JA.toast?.('Couldn’t restore everything: this browser’s storage is full.','warn');return;}
      const total=added.charts+added.journal;
      if(!total){JA.toast?.('Nothing new to restore: this browser already has everything in that backup.','ok');return;}
      JA.toast?.(`Restored ${added.charts} charts and ${added.journal} journal entries. Reloading…`,'ok');
      setTimeout(()=>location.reload(),1400); // the chart store reads storage once at start-up
    };
    reader.readAsText(file);
  }
  function chooseBackupFile(){
    const input=document.createElement('input');input.type='file';input.accept='application/json,.json';
    input.addEventListener('change',()=>{if(input.files&&input.files[0])importData(input.files[0]);});
    input.click();
  }
  window.AtlasBackup={exportData,chooseBackupFile,mergeBackup};
  function updatePill(){
    const pill=document.getElementById('activeChartPill');if(!pill)return;const c=JA.getActiveChart?.();
    if(!c){
      pill.hidden=false;
      pill.innerHTML='<span class="global-chart-dot">✦</span><span class="global-chart-copy"><span class="global-chart-name">No active Kundali</span><span class="global-chart-meta">Create, import, or explore a demo chart</span></span><span class="global-chart-caret">▾</span>';
      pill.title='Choose or create a Kundali';pill.setAttribute('aria-haspopup','menu');pill.setAttribute('aria-expanded','false');renderMenu();return;
    }
    const facts=chartFacts(c);pill.hidden=false;
    const due=backupDue();
    pill.classList.toggle('backup-due',due);
    pill.innerHTML=`<span class="global-chart-dot">✦</span>${due?'<span class="global-chart-backup" title="Your data hasn’t been backed up recently">Back up</span>':''}<span class="global-chart-copy"><span class="global-chart-name">${escape(c.name||'Untitled Kundali')}</span><span class="global-chart-meta">${escape(facts.lagna)} Lagna · ${escape(facts.nak)} · ${escape(facts.phase)}</span></span><span class="global-chart-caret">▾</span>`;
    pill.title='Change active Kundali';pill.setAttribute('aria-haspopup','menu');pill.setAttribute('aria-expanded',String(!menu?.hidden));
    renderMenu();
  }
  function syncTools(){
    const active=JA.getActiveIndex?.();const has=Number.isInteger(active)&&active>=0;
    selectors.forEach(id=>{const el=document.getElementById(id);if(!el)return;el.closest('.bb-sel-grp')?.classList.add('global-chart-bound');if(has){el.value=String(active);if(id!=='pbChart')el.dispatchEvent(new Event('change',{bubbles:true}));}});
    gates.forEach(id=>{const el=document.getElementById(id);if(!el)return;if(!has){el.innerHTML=gate();el.style.display='';}else if(el.querySelector('.celestial-gate')){el.style.display='none';}});
  }
  function afterChartChange(){if(syncing)return;syncing=true;try{updatePill();syncTools();}finally{syncing=false;}}
  function init(){
    menu=document.createElement('div');menu.className='global-chart-menu';menu.id='globalChartMenu';menu.hidden=true;menu.setAttribute('role','menu');document.body.append(menu);
    const pill=document.getElementById('activeChartPill');
    if(pill)pill.dataset.globalChartPill='true';
    pill?.addEventListener('click',e=>{e.preventDefault();if(menu.hidden){renderMenu();menu.hidden=false;pill.setAttribute('aria-expanded','true');}else closeMenu();});
    menu.addEventListener('click',e=>{const chart=e.target.closest('[data-chart-index]'),remove=e.target.closest('[data-remove-index]'),action=e.target.closest('[data-global-chart-action]');if(chart){JA.activateChart?.(+chart.dataset.chartIndex,{stay:true});closeMenu();return;}if(remove){JA.removeChart?.(+remove.dataset.removeIndex);closeMenu();return;}if(action){closeMenu();if(action.dataset.globalChartAction==='create')JA.openBirthModal?.(action);if(action.dataset.globalChartAction==='import')JA.openImportModal?.(action);if(action.dataset.globalChartAction==='demo')document.getElementById('demoFirst')?.click();if(action.dataset.globalChartAction==='manage')AtlasNavigate?.('charts');if(action.dataset.globalChartAction==='backup')exportData();if(action.dataset.globalChartAction==='restore')chooseBackupFile();}});
    document.addEventListener('click',e=>{if(!e.target.closest('#activeChartPill')&&!e.target.closest('#globalChartMenu'))closeMenu();});window.addEventListener('resize',positionMenu);
    document.addEventListener('click',e=>{const action=e.target.closest('[data-global-chart-action]');if(!action||action.closest('#globalChartMenu'))return;if(action.dataset.globalChartAction==='create')JA.openBirthModal?.(action);if(action.dataset.globalChartAction==='import')JA.openImportModal?.(action);if(action.dataset.globalChartAction==='demo')document.getElementById('demoFirst')?.click();});
    const prior=JA.onChartsChange;JA.onChartsChange=function(){prior?.();afterChartChange();};afterChartChange();
    // One gentle reminder per session when a backup is due (see backupDue).
    try{if(backupDue()&&!sessionStorage.getItem('ja.backupNudged')){sessionStorage.setItem('ja.backupNudged','1');setTimeout(()=>JA.toast?.('Your charts live only in this browser. Open the chart menu and choose “Back up my data” to keep a copy.','ok'),2500);}}catch(e){}
    // The core chart store emits this after every activation path. Queue one final binding pass
    // after legacy render callbacks have completed, preventing any tool-local select from
    // silently restoring its first option.
    window.addEventListener('atlas-active-chart-change',()=>queueMicrotask(()=>{try{afterChartChange();}catch(e){console.error('Global active-chart binding failed:',e);}}));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
