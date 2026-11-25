/* The Cosmic Body (Kālapuruṣa) lesson.
   Classical texts lay the zodiac over a human figure: Aries is the head, Pisces the feet
   (Brihat Jataka 1.4; BPHS, chapter on the signs). This view shows the 12 signs or houses
   from head to feet, the 27 nakshatras on a scale beside the body, and, if the reader
   chooses, their own planets at their exact degrees. Read-only: it only reads
   JA.getActiveChart() and computes no astrology of its own beyond longitude → body height. */
(function(root){
  const SIGNS=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const LORDS=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
  const ELEMENTS=['Fire','Earth','Air','Water'];
  const ELEMENT_COLOUR={Fire:'#cf714d',Earth:'#9b8956',Air:'#5e9bb2',Water:'#6d83b8'};
  // Body part per sign, in the two classical lists. They differ only at Gemini and Virgo.
  const BODY={
    bj:[['head','varāṅga'],['face','ānana'],['chest','uras'],['heart','hṛd'],['belly, stomach','kroḍa'],['waist, where cloth is tied','vāsobhṛt'],['lower abdomen, bladder','vasti'],['genitals','vyañjana'],['thighs','ūru'],['knees','jānu'],['shanks, calves','jaṅghā'],['feet','aṅghri']],
    bphs:[['head','śīrṣa'],['face','ānana'],['arms and shoulders','bāhu'],['heart','hṛd'],['belly, stomach','kroḍa'],['waist, hips','kaṭi'],['lower abdomen, bladder','vasti'],['genitals','guhya'],['thighs','ūru'],['knees','jānu'],['shanks, calves','jaṅghā'],['feet','caraṇa']]
  };
  const SOURCE={bj:'Brihat Jataka 1.4',bphs:'BPHS, chapter on the signs'};
  const HOUSES=[['Tanu','self'],['Dhana','wealth, speech'],['Sahaja','courage, siblings'],['Sukha','home, mother'],['Putra','children, creativity'],['Ripu','health, obstacles'],['Kalatra','partner'],['Āyu','longevity, change'],['Dharma','fortune, belief'],['Karma','career'],['Lābha','gains'],['Vyaya','loss, release']];
  const NAKSHATRAS=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  const NAK_LORDS=['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
  const PLANETS=[['Su','Sun'],['Mo','Moon'],['Ma','Mars'],['Me','Mercury'],['Ju','Jupiter'],['Ve','Venus'],['Sa','Saturn'],['Ra','Rahu'],['Ke','Ketu']];
  const NAK_SPAN=360/27;
  // Body zones top→bottom, in SVG units: head, face, shoulders, chest, belly, waist,
  // lower abdomen, pelvis, thighs, knees, shins, feet.
  const ZONE_Y=[40,80,120,165,215,260,300,335,365,445,475,565,600];

  /* ---- Pure mapping (tested in tests/kalapurusha.cjs) ---- */
  // `start` = the sign at the head: 0 (Aries) for the classical figure, the rising sign
  // when the houses are counted from a person's own chart.
  function zoneOf(lon,start){const r=((lon-start*30)%360+360)%360;return Math.min(11,Math.floor(r/30));}
  function bodyY(lon,start){
    const r=((lon-start*30)%360+360)%360, z=Math.min(11,Math.floor(r/30));
    return ZONE_Y[z]+(r-z*30)/30*(ZONE_Y[z+1]-ZONE_Y[z]);
  }
  function nakshatrasInSign(sign){
    const a=sign*30,b=a+30,out=[];
    NAKSHATRAS.forEach((n,i)=>{const s=i*NAK_SPAN,e=s+NAK_SPAN;if(s<b-1e-9&&e>a+1e-9)out.push({i,name:n,partial:s<a-1e-9||e>b+1e-9});});
    return out;
  }
  function dms(d){const m=Math.round((d%1)*60);return Math.floor(d)+'°'+(m?String(m).padStart(2,'0')+'′':'');}
  function ordinal(n){const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}
  const api={SIGNS,BODY,NAKSHATRAS,ZONE_Y,zoneOf,bodyY,nakshatrasInSign};
  if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}

  /* ---- View ---- */
  const doc=root.document;
  const state={scheme:'bj',mine:false,naks:true,sel:{t:'z',i:0}};
  try{const s=JSON.parse(localStorage.getItem('ja.kp')||'null');if(s){state.scheme=s.scheme==='bphs'?'bphs':'bj';state.mine=!!s.mine;state.naks=s.naks!==false;}}catch(e){}
  const save=()=>{try{localStorage.setItem('ja.kp',JSON.stringify({scheme:state.scheme,mine:state.mine,naks:state.naks}));}catch(e){}};
  const chart=()=>(typeof JA!=='undefined'&&JA.getActiveChart)?JA.getActiveChart():null;
  const NS='http://www.w3.org/2000/svg';
  const el=(t,a,txt)=>{const e=doc.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;return e;};
  let host=null, narrow=false;

  function start(){const c=chart();return state.mine&&c&&c.La?c.La.sign:0;}
  function planets(){
    const c=chart(); if(!state.mine||!c||!c.planets) return [];
    return PLANETS.filter(([k])=>c.planets[k]&&Number.isFinite(c.planets[k].deg)).map(([k,name])=>({k,name,sign:c.planets[k].sign,deg:c.planets[k].deg,lon:c.planets[k].sign*30+c.planets[k].deg}));
  }

  function controls(){
    const c=chart();
    const b=(id,label,on,extra='')=>`<button type="button" data-kp-ctl="${id}" aria-pressed="${on}" ${extra}>${label}</button>`;
    return `<div class="kp-controls">
      <div class="kp-seg" role="group" aria-label="Whose body">${b('classic','Classical figure',!state.mine)}${b('mine','My chart',state.mine)}</div>
      <div class="kp-seg" role="group" aria-label="Classical source">${b('bj','Brihat Jataka',state.scheme==='bj')}${b('bphs','BPHS',state.scheme==='bphs')}</div>
      <label class="kp-check"><input type="checkbox" data-kp-ctl="naks" ${state.naks?'checked':''}> Nakshatras</label>
      ${state.mine&&!c?`<span class="kp-note">No chart is loaded. <a href="#charts">Load or create a chart</a> to see your own planets here.</span>`:''}
    </div>`;
  }

  function draw(){
    if(!host) return;
    const s0=start(), pls=planets();
    host.innerHTML=controls()+`<div class="kp-figure"><svg viewBox="${narrow?'20 20 440 600':'0 20 680 600'}" role="group" aria-label="Kalapurusha figure: signs from head to feet"></svg></div>`+
      (state.naks&&narrow?`<div class="kp-naklist" role="group" aria-label="Nakshatras">${NAKSHATRAS.map((n,i)=>`<button type="button" data-kp-nak="${i}" aria-pressed="${state.sel.t==='n'&&state.sel.i===i}">${i+1} ${n}</button>`).join('')}</div>`:'')+
      `<div class="kp-card" aria-live="polite"></div>`+
      `<p class="kp-foot">Source: ${SOURCE[state.scheme]}. The nakshatras follow the signs they fall in; Brihat Samhita's separate “Nakshatra-purusha” assigns them in a different order. This is traditional symbolism, not medical advice.</p>`;
    const svg=host.querySelector('svg');
    const defs=el('defs');const clip=el('clipPath',{id:'kpBody'});
    [['ellipse',{cx:340,cy:78,rx:30,ry:38}],['rect',{x:327,y:110,width:26,height:26}],
     ['path',{d:'M300 132L380 132Q402 134 404 150L392 260Q388 300 392 340L388 372L292 372L288 340Q292 300 288 260L276 150Q278 134 300 132Z'}],
     ['path',{d:'M292 366L338 366L336 470L332 576L314 576L304 470Z'}],['path',{d:'M342 366L388 366L376 470L366 576L348 576L344 470Z'}],
     ['rect',{x:298,y:572,width:40,height:28,rx:8}],['rect',{x:342,y:572,width:40,height:28,rx:8}]].forEach(([t,a])=>clip.appendChild(el(t,a)));
    defs.appendChild(clip);svg.appendChild(defs);
    const bands=el('g',{'clip-path':'url(#kpBody)'});svg.appendChild(bands);
    const arms=el('g');svg.appendChild(arms);
    const selZone=state.sel.t==='z'?state.sel.i:-1;
    const fade=z=>state.sel.t==='z'?(z===selZone?.8:.25):.42;
    for(let z=0;z<12;z++){
      const sign=(s0+z)%12, col=ELEMENT_COLOUR[ELEMENTS[sign%4]];
      const r=el('rect',{x:240,y:ZONE_Y[z],width:200,height:ZONE_Y[z+1]-ZONE_Y[z],fill:col,opacity:fade(z),'data-kp-zone':z,class:'kp-hit'});
      bands.appendChild(r);
      bands.appendChild(el('line',{x1:240,y1:ZONE_Y[z],x2:440,y2:ZONE_Y[z],stroke:'var(--ink)','stroke-width':.5,opacity:.25}));
    }
    const armCol=ELEMENT_COLOUR[ELEMENTS[(s0+2)%12%4]];
    ['M278 140Q262 146 260 170L250 330Q248 352 258 356Q268 356 268 336L280 200Z','M402 140Q418 146 420 170L430 330Q432 352 422 356Q412 356 412 336L400 200Z']
      .forEach(d=>arms.appendChild(el('path',{d,fill:armCol,opacity:fade(2),'data-kp-zone':2,class:'kp-hit'})));
    const outline=el('g',{fill:'none',stroke:'var(--ink)','stroke-width':1,opacity:.5,'pointer-events':'none'});
    ['M300 132L380 132Q402 134 404 150L392 260Q388 300 392 340L388 372L292 372L288 340Q292 300 288 260L276 150Q278 134 300 132Z',
     'M292 370L304 470L314 576M338 370L336 470L332 576M342 370L344 470L348 576M388 370L376 470L366 576',
     'M327 114V134M353 114V134',
     'M278 140Q262 146 260 170L250 330Q248 352 258 356Q268 356 268 336L280 200M402 140Q418 146 420 170L430 330Q432 352 422 356Q412 356 412 336L400 200'].forEach(d=>outline.appendChild(el('path',{d})));
    outline.appendChild(el('ellipse',{cx:340,cy:78,rx:30,ry:38}));
    outline.appendChild(el('rect',{x:298,y:572,width:40,height:28,rx:8}));outline.appendChild(el('rect',{x:342,y:572,width:40,height:28,rx:8}));
    svg.appendChild(outline);

    // Selected nakshatra: its exact band on the body.
    if(state.sel.t==='n'){
      const a=bodyY(state.sel.i*NAK_SPAN,s0), b=bodyY((state.sel.i+1)*NAK_SPAN-1e-6,s0);
      const seg=(y1,y2)=>svg.appendChild(el('rect',{x:240,y:y1,width:200,height:Math.max(2,y2-y1),fill:'var(--gold)',opacity:.6,'clip-path':'url(#kpBody)','pointer-events':'none'}));
      if(b>=a)seg(a,b);else{seg(a,600);seg(40,b);}
    }

    // Left: houses / signs at their zone. Labels sit at each zone's middle.
    const left=el('g');svg.appendChild(left);
    svg.appendChild(el('line',{x1:232,y1:40,x2:232,y2:600,stroke:'var(--ink)','stroke-width':.5,opacity:.4}));
    for(let z=0;z<12;z++){
      const sign=(s0+z)%12, my=(ZONE_Y[z]+ZONE_Y[z+1])/2, on=z===selZone;
      const g=el('g',{class:'kp-label kp-hit',tabindex:0,role:'button','data-kp-zone':z,'aria-pressed':String(on),
        'aria-label':`${ordinal(z+1)} house, ${SIGNS[sign]}, ${BODY[state.scheme][z][0]}`});
      g.appendChild(el('line',{x1:214,y1:my,x2:232,y2:my,stroke:'var(--ink)','stroke-width':.5,opacity:.5}));
      g.appendChild(el('text',{x:208,y:my-7,'text-anchor':'end','dominant-baseline':'central','font-size':narrow?15:13,'font-weight':on?700:500,fill:on?'var(--gold2)':'var(--ink)'},`${ordinal(z+1)} · ${HOUSES[z][0]}`));
      g.appendChild(el('text',{x:208,y:my+9,'text-anchor':'end','dominant-baseline':'central','font-size':narrow?13:12,fill:'var(--muted)'},`${SIGNS[sign]} · ${BODY[state.scheme][z][0].split(',')[0]}`));
      left.appendChild(g);
    }

    // Right: nakshatra scale (wide layouts). Labels evenly spaced, in body order, so leaders never cross.
    if(state.naks&&!narrow){
      svg.appendChild(el('line',{x1:452,y1:40,x2:452,y2:600,stroke:'var(--ink)','stroke-width':.5,opacity:.4}));
      const right=el('g');svg.appendChild(right);
      NAKSHATRAS.forEach((n,i)=>{const y=bodyY(i*NAK_SPAN,s0);right.appendChild(el('line',{x1:448,y1:y,x2:456,y2:y,stroke:'var(--ink)','stroke-width':.5,opacity:.6}));});
      const order=NAKSHATRAS.map((n,i)=>({i,y:bodyY(i*NAK_SPAN+NAK_SPAN/2,s0)})).sort((a,b)=>a.y-b.y), step=556/26;
      order.forEach((o,k)=>{
        const ly=44+k*step, on=state.sel.t==='n'&&state.sel.i===o.i;
        const g=el('g',{class:'kp-label kp-hit',tabindex:0,role:'button','data-kp-nak':o.i,'aria-pressed':String(on),'aria-label':`Nakshatra ${NAKSHATRAS[o.i]}`});
        g.appendChild(el('path',{d:`M452 ${o.y.toFixed(1)}L466 ${o.y.toFixed(1)}L478 ${ly.toFixed(1)}L484 ${ly.toFixed(1)}`,fill:'none',stroke:on?'var(--gold)':'var(--ink)','stroke-width':on?1.4:.5,opacity:on?1:.5}));
        g.appendChild(el('text',{x:490,y:ly,'dominant-baseline':'central','font-size':12,'font-weight':on?700:400,fill:on?'var(--gold2)':'var(--muted)'},`${o.i+1} ${NAKSHATRAS[o.i]}`));
        right.appendChild(g);
      });
    }

    // Planets at their exact degree; close ones step sideways.
    const pg=el('g',{'pointer-events':'none'});svg.appendChild(pg);
    let lastY=-99,lane=0;
    pls.map(p=>({p,y:bodyY(p.lon,s0)})).sort((a,b)=>a.y-b.y).forEach(o=>{
      lane=o.y-lastY<20?lane+1:0;lastY=o.y;
      const x=340+(lane%2?1:-1)*Math.ceil(lane/2)*24;
      pg.appendChild(el('circle',{cx:x,cy:o.y,r:10,fill:'var(--panel)',stroke:'var(--gold)','stroke-width':1.2}));
      pg.appendChild(el('text',{x,y:o.y,'text-anchor':'middle','dominant-baseline':'central','font-size':11,'font-weight':700,fill:'var(--gold2)'},o.p.k));
    });
    card();
  }

  function card(){
    const C=host.querySelector('.kp-card'); if(!C) return;
    const s0=start(), pls=planets(), sch=state.scheme;
    if(state.sel.t==='z'){
      const z=state.sel.i, sign=(s0+z)%12, body=BODY[sch][z], other=BODY[sch==='bj'?'bphs':'bj'][z];
      const here=pls.filter(p=>p.sign===sign);
      C.innerHTML=`<div class="kp-card-eyebrow">${ordinal(z+1)} house · ${HOUSES[z][0]} (${HOUSES[z][1]}) · ${SIGNS[sign]}, ruled by ${LORDS[sign]}</div>
        <h3>Body: ${body[0]}</h3><div class="kp-skt">${body[1]}</div>
        ${other[0]!==body[0]?`<p class="kp-muted">${sch==='bj'?'BPHS':'Brihat Jataka'} gives ${other[1]} (${other[0]}) here instead.</p>`:''}
        <p>Nakshatras in ${SIGNS[sign]}: ${nakshatrasInSign(sign).map(n=>n.name+(n.partial?' (part)':'')).join(', ')}.</p>
        ${state.mine&&chart()?`<p>${here.length?'Your planets here: '+here.map(p=>`${p.name} ${dms(p.deg)}`).join(', ')+'.':'None of your planets are in this sign.'}</p>`:''}`;
    }else{
      const i=state.sel.i, a=i*NAK_SPAN, s1=Math.floor(a/30), s2=Math.floor((a+NAK_SPAN-1e-6)/30);
      const z1=zoneOf(a,s0), z2=zoneOf(a+NAK_SPAN-1e-6,s0);
      const inside=pls.filter(p=>p.lon>=a&&p.lon<a+NAK_SPAN);
      C.innerHTML=`<div class="kp-card-eyebrow">Nakshatra ${i+1} of 27 · ruled by ${NAK_LORDS[i%9]}</div>
        <h3>${NAKSHATRAS[i]}</h3>
        <p>${dms(a-s1*30)} ${SIGNS[s1]} to ${dms(a+NAK_SPAN-s2*30)} ${SIGNS[s2]} · on the body: ${BODY[sch][z1][0]}${z2!==z1?' into '+BODY[sch][z2][0]:''}.</p>
        ${state.mine&&chart()?`<p>${inside.length?'Your planets here: '+inside.map(p=>`${p.name} ${dms(p.deg)} ${SIGNS[p.sign]}`).join(', ')+'.':'None of your planets are in this nakshatra.'}</p>`:''}`;
    }
  }

  function select(t,i){
    const hadFocus=host.contains(doc.activeElement); // the redraw replaces the focused node
    state.sel={t,i}; draw();
    if(hadFocus) host.querySelector(t==='z'?`.kp-label[data-kp-zone="${i}"]`:`[data-kp-nak="${i}"]`)?.focus({preventScroll:true});
  }

  function wire(){
    host.addEventListener('click',e=>{
      const ctl=e.target.closest('[data-kp-ctl]');
      if(ctl){const v=ctl.dataset.kpCtl;
        if(v==='classic')state.mine=false;else if(v==='mine')state.mine=true;
        else if(v==='bj'||v==='bphs')state.scheme=v;else if(v==='naks'){state.naks=ctl.checked;}
        save();draw();return;}
      const z=e.target.closest('[data-kp-zone]'); if(z){select('z',+z.dataset.kpZone);return;}
      const n=e.target.closest('[data-kp-nak]'); if(n){select('n',+n.dataset.kpNak);}
    });
    host.addEventListener('keydown',e=>{
      const t=e.target.closest('[data-kp-zone].kp-label,[data-kp-nak]'); if(!t) return;
      if(e.key==='Enter'||e.key===' '){e.preventDefault();t.dispatchEvent(new MouseEvent('click',{bubbles:true}));return;}
      const step={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key]; if(!step) return;
      e.preventDefault();
      if(t.dataset.kpZone!=null) select('z',(+t.dataset.kpZone+step+12)%12);
      else select('n',(+t.dataset.kpNak+step+27)%27);
    });
    if('ResizeObserver' in root) new ResizeObserver(es=>{const w=es[0].contentRect.width,n=w>0&&w<600;if(n!==narrow){narrow=n;draw();}}).observe(host);
  }

  // "See it on the body" links from the Signs, Houses and Nakshatras lessons. Runs on
  // window capture, before app-shell.js routes the #kalapurusha link.
  root.addEventListener('click',e=>{
    const a=e.target.closest&&e.target.closest('[data-kp-focus]'); if(!a) return;
    const [t,i]=a.dataset.kpFocus.split(':');
    if(t==='nak') state.sel={t:'n',i:+i};
    else { state.mine=false; state.sel={t:'z',i:+i}; } // signs and houses: the classical figure, where sign n = house n
    save(); draw();
  },true);

  function mount(){
    host=doc.getElementById('kpRoot'); if(!host) return;
    wire(); draw();
    if(typeof JA!=='undefined'){const prev=JA.onChartsChange;JA.onChartsChange=function(){try{prev&&prev();}finally{if(state.mine)draw();}};}
  }
  root.Kalapurusha={...api,draw:()=>draw()};
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',mount);else mount();
})(typeof window!=='undefined'?window:globalThis);
