/* Persistent workspaces: routing changes visibility, never recreates chart UI. */
(function(){
  // [id, plain-language label, technique name shown as a caption]. Menus use the question a
  // reader has; the classical/feature name stays visible underneath so nothing feels renamed away.
  const groups=[['Today',[['atlasExperience','Today’s sky','Personal almanac']]],['Study',[['starthere','Learn the basics','Guided course'],['synth','Combine the pieces','Synthesizer'],['quiz','Practice','Quiz']]],['Your chart',[['charts','My charts','Wheel and readings'],['d1guide','Planet by planet','Rāśi guide'],['bbavam','How life areas connect','Relationship decoder'],['arudhas','How others see you','Graha arudhas'],['karmasutra','Work and career','Career decoder']]],['Timing & reflection',[['opportunity','When doors open','Opportunity windows'],['lifepredictor','Life timeline','Life predictor'],['outlook','Year by year','Life outlook'],['prashna','Ask about this moment','Prashna'],['journal','Journal','Life journal'],['promptbuilder','Prepare an AI reading','Prompt builder'],['compare','Compare two charts','Compare charts']]]];
  const lessons=[['starthere','Start here'],['why','The idea'],['grahas','Planets'],['rashis','Signs'],['bhavas','Houses'],['nakshatras','Nakshatras'],['kalapurusha','Cosmic body']];
  const labels=new Map([...groups.flatMap(g=>g[1].map(([id,label])=>[id,label])),...lessons,['hero','Welcome']]);
  let main,views,select,links,active;
  const positions=new Map();
  function resolve(id){
    const target=document.getElementById(id);
    const view=target?.closest('#main > section');
    return view?{target,view}:null;
  }
  function open(id,{historyMode='push',focus=true}={}){
    const route=resolve(id);if(!route||!views)return false;
    document.documentElement.classList.remove('atlas-predict','atlas-learn','jm-guided');
    if(active)positions.set(active,main.scrollTop);
    active=route.view.id;
    views.forEach(view=>{const current=view===route.view;view.hidden=!current;view.classList.toggle('workspace-active',current);});
    const navId=lessons.some(l=>l[0]===active)||active==='hero'?'starthere':active;
    links.forEach(a=>{if(a.dataset.workspace===navId)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    select.value=navId;
    document.querySelectorAll('[data-lesson]').forEach(a=>{if(a.dataset.lesson===active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    const lessonNav=document.getElementById('workspaceLessons');
    lessonNav.hidden=!lessons.some(l=>l[0]===active);
    main.prepend(lessonNav);
    document.getElementById('workspaceTitle').textContent=labels.get(active)||'Workspace';
    document.title=(labels.get(active)||'Workspace')+' · Jyotish Atlas';
    if(historyMode!=='none'&&location.hash!=='#'+id)history[historyMode==='replace'?'replaceState':'pushState'](null,'','#'+id);
    main.scrollTop=positions.get(active)||0;
    if(route.target!==route.view)route.target.scrollIntoView({block:'start',behavior:'auto'});
    if(focus){const heading=route.view.querySelector('h1,h2,h3')||route.view;heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
    return true;
  }
  window.AtlasNavigate=id=>open(id);
  function init(){
    main=document.getElementById('main');views=[...main.querySelectorAll(':scope > section')];
    main.setAttribute('role','main');main.setAttribute('tabindex','-1');
    const rail=document.createElement('aside');rail.id='workspaceRail';
    rail.innerHTML='<a class="workspace-brand" href="#atlasExperience">✦ Jyotish Atlas</a><nav aria-label="Workspaces">'+groups.map(([name,items])=>'<div class="workspace-group"><p>'+name+'</p>'+items.map(([id,label,term])=>`<a href="#${id}" data-workspace="${id}"><span class="ws-label">${label}</span>${term?`<small class="ws-term">${term}</small>`:''}</a>`).join('')+'</div>').join('')+'</nav>';
    const bar=document.createElement('header');bar.id='workspaceBar';
    bar.innerHTML='<span id="workspaceTitle">Personal Almanac</span><label class="workspace-picker">Workspace<select aria-label="Choose workspace">'+groups.map(([name,items])=>`<optgroup label="${name}">`+items.map(([id,label,term])=>`<option value="${id}">${label}${term?` (${term})`:''}</option>`).join('')+'</optgroup>').join('')+'</select></label>';
    const appearance=document.querySelector('.appearance-field');if(appearance)bar.append(appearance);
    const actions=document.querySelector('.header-actions');if(actions)bar.append(actions);
    document.body.append(rail,bar);
    const lessonNav=document.createElement('nav');lessonNav.id='workspaceLessons';lessonNav.setAttribute('aria-label','Learning topics');
    lessonNav.innerHTML=lessons.map(([id,label])=>`<a href="#${id}" data-lesson="${id}">${label}</a>`).join('');main.prepend(lessonNav);
    select=bar.querySelector('select');links=[...rail.querySelectorAll('[data-workspace]')];
    select.addEventListener('change',()=>open(select.value));
    document.documentElement.classList.add('app-shell');
    document.addEventListener('click',e=>{
      const mode=e.target.closest('[data-atlas-mode]');
      if(mode){e.preventDefault();e.stopImmediatePropagation();open(mode.dataset.atlasMode==='learn'?'starthere':'atlasExperience');return;}
      const a=e.target.closest('a[href^="#"]');
      if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;
      const id=a.getAttribute('href').slice(1);
      if(resolve(id)){e.preventDefault();e.stopImmediatePropagation();open(id);}
    },true);
    window.addEventListener('popstate',()=>open(location.hash.slice(1),{historyMode:'none'}));
    window.addEventListener('hashchange',()=>open(location.hash.slice(1),{historyMode:'none'}));
    open(resolve(location.hash.slice(1))?location.hash.slice(1):'atlasExperience',{historyMode:location.hash.startsWith('#chart=')||location.hash==='#selftest'?'none':'replace',focus:false});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
