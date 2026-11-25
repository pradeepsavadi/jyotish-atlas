/* Daily observation, not a daily event prediction. All data stays in this browser. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const zone=Intl.DateTimeFormat().resolvedOptions().timeZone;
  const drafts=new WeakMap();let active=null,section=null;
  const date=ms=>new Date(ms).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
  function snapshot(c,now){
    const pos=getTransitPlanets(new Date(now)).pos;
    if(!pos.Mo||!pos.Su)throw Error('Sun or Moon unavailable');
    const lon=p=>p.sign*30+p.deg;
    const angle=((lon(pos.Mo)-lon(pos.Su))%360+360)%360;
    const tithi=Math.floor(angle/12)+1;
    return {timestamp:now,timezone:zone,moon:{sign:pos.Mo.sign,degree:pos.Mo.deg,nakshatra:nakInfo(lon(pos.Mo)).n,fromLagna:houseFromSigns(c.La.sign,pos.Mo.sign),fromMoon:c.planets.Mo?houseFromSigns(c.planets.Mo.sign,pos.Mo.sign):null},tithi,phase:tithi<=15?'Waxing':'Waning'};
  }
  function periods(c,now){
    const within=p=>Number.isFinite(p.start)&&p.start<=now&&(p.end==null||now<p.end);
    const md=c.dashas?.mahas?.find(within),ad=md?.antars?.find(within),pd=ad?.pratyantars?.find(within);
    return {md,ad,pd};
  }
  function refreshSky(){
    if(!section||!active)return;
    const now=Date.now(),c=active;
    let sky;
    try{
      const s=snapshot(c,now),within=s.tithi<=15?s.tithi:s.tithi-15;
      const tithi=within===15?(s.tithi===15?'Full moon tithi':'New moon tithi'):`${s.phase} · tithi ${within} of 15`;
      sky=`<dl><div><dt>Moon nakshatra · Nakṣatra</dt><dd>${esc(s.moon.nakshatra)}</dd></div><div><dt>Lunar day · Tithi</dt><dd>${tithi}</dd></div><div><dt>Moon in your chart</dt><dd>${esc(SIGNS[s.moon.sign])} · H${s.moon.fromLagna} from Lagna${s.moon.fromMoon?' · H'+s.moon.fromMoon+' from Moon':''}</dd></div></dl>`;
    }catch(e){sky='<p>Today’s sky could not be calculated. Your saved chart is still available.</p>';}
    const p=periods(c,now);
    // No period data at all: one sentence and one action, not three "not available" rows.
    const hasPeriods=!!(c.dashas&&c.dashas.mahas&&c.dashas.mahas.length);
    const phase=!hasPeriods?`<div class="period-row"><div>Your life periods are worked out from your birth date, which this chart doesn’t include yet.</div><a class="ax-secondary" href="#lifepredictor">Add your birth date</a></div>`:[['Mahadasha',p.md],['Antardasha',p.ad],['Pratyantardasha',p.pd]].map(([label,v])=>{
      if(!v)return `<div class="period-row"><small>${label}</small><div>Not listed in this chart’s data</div></div>`;
      const known=Number.isFinite(v.end)&&v.end>v.start;
      const percent=known?Math.max(0,Math.min(100,(now-v.start)/(v.end-v.start)*100)):null;
      return `<div class="period-row"><div>${label} · <b>${esc(GBYK[v.lord]?.name||v.lord)}</b></div><small>${date(v.start)} → ${known?date(v.end):'End not supplied'}</small>${known?`<progress value="${percent}" max="100" aria-label="${label} elapsed"></progress><small>${percent.toFixed(1)}% elapsed · period progress, not strength</small>`:''}</div>`;
    }).join('');
    const lord=p.ad?.lord||p.md?.lord,planet=c.planets[lord];
    const theme=planet?`Your ongoing ${esc(GBYK[lord]?.name||lord)} period brings H${houseFromSigns(c.La.sign,planet.sign)} (${esc(BHAVAS[houseFromSigns(c.La.sign,planet.sign)-1].en)}) into the reading through its natal placement. This is a period theme, not a prediction of today’s events.`:'';
    section.querySelector('[data-almanac-sky]').innerHTML=`<small>As of ${esc(date(now))} · ${esc(zone)}</small>${sky}<p>Sky essentials: a partial almanac. Hora requires current location and local sunrise/sunset and is not calculated here. These are instant values, not sunrise-based calendar assignments.</p><h3>Your ongoing life phase</h3>${phase}<p>${theme}</p>`;
  }
  function mount(){
    const c=JA.getActiveChart?.(),host=document.getElementById('axPredict');
    if(!c||!host){section?.remove();section=null;active=null;return;}
    if(section?.isConnected&&active===c){refreshSky();return;}
    section?.remove();
    section=document.createElement('section');section.className='almanac';section.setAttribute('aria-label','Personal almanac');active=c;
    section.innerHTML=`<header><div><div class="ax-kicker">A moment with the sky</div><h2>Your personal almanac</h2></div><svg class="astrolabe" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor"><circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="32"/><ellipse cx="50" cy="50" rx="44" ry="16" transform="rotate(-35 50 50)"/><path d="M50 2v96M2 50h96"/><circle cx="50" cy="50" r="5"/></g></svg></header><div data-almanac-sky></div><form><label for="dailyReflection">What would you like to remember about today?</label><textarea id="dailyReflection" maxlength="500" placeholder="One observation, a mood, or something that happened…"></textarea><button class="ax-primary" type="submit">Save to my Life Journal</button><p role="status" data-reflection-status></p><small>Optional. Saved only in this browser, with the time, timezone and available sky snapshot.</small></form>`;
    host.prepend(section);
    const input=section.querySelector('textarea');input.value=drafts.get(c)||'';
    input.addEventListener('input',()=>drafts.set(c,input.value));
    section.querySelector('form').addEventListener('submit',e=>{
      e.preventDefault();const title=input.value.trim(),status=section.querySelector('[data-reflection-status]');
      if(!title){status.textContent='Write a short reflection first.';input.focus();return;}
      const now=Date.now();let transit=null;try{transit=snapshot(c,now);}catch(e){}
      const p=periods(c,now);
      try{
        const journal=JSON.parse(localStorage.getItem('jyotish_journal_v1')||'{}');
        if(!journal||Array.isArray(journal)||typeof journal!=='object')throw Error('Invalid journal');
        const events=Object.hasOwn(journal,c.name)?journal[c.name]:[];
        if(!Array.isArray(events))throw Error('Invalid journal entries');
        Object.defineProperty(journal,c.name,{value:[...events,{id:crypto.randomUUID(),ms:now,cat:'other',title,timezone:zone,transit,dasha:{md:p.md?.lord||null,ad:p.ad?.lord||null,pd:p.pd?.lord||null}}],enumerable:true,configurable:true,writable:true});
        localStorage.setItem('jyotish_journal_v1',JSON.stringify(journal));
        input.value='';drafts.delete(c);status.textContent=transit?'Saved with today’s sky snapshot.':'Saved. Transit snapshot was unavailable.';
        window.dispatchEvent(new Event('atlas-journal-change'));
      }catch(e){status.textContent='Could not save in this browser. Your note remains here; copy it somewhere safe.';}
    });
    refreshSky();
  }
  const previous=JA.onChartsChange;JA.onChartsChange=function(){previous?.();mount();};
  // Experience-mode changes recreate the host content; reattach without losing drafts.
  new MutationObserver(()=>{if(!section?.isConnected)mount();}).observe(document.getElementById('axPredict'),{childList:true});
  setInterval(()=>{if(!document.hidden)refreshSky();},60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshSky();});
  mount();
})();
