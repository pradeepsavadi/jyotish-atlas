/* Decorative native SVG. It is intentionally static data: no astronomy claim is implied. */
(function(){
  const rashi=['AR','TA','GE','CN','LE','VI','LI','SC','SG','CP','AQ','PI'];
  function wheel(className,label){
    const ticks=Array.from({length:72},(_,i)=>{const major=i%6===0;return `<line class="om-tick" x1="50" y1="${major?4:5.5}" x2="50" y2="${major?8:7}" transform="rotate(${i*5} 50 50)" stroke-width="${major?.7:.35}"/>`;}).join('');
    const words=rashi.map((name,i)=>{const a=(i*30-90)*Math.PI/180,x=(50+40*Math.cos(a)).toFixed(2),y=(50+40*Math.sin(a)+1.6).toFixed(2);return `<text class="om-rashi" x="${x}" y="${y}">${name}</text>`;}).join('');
    const stars=Array.from({length:9},(_,i)=>{const a=(i*40-90)*Math.PI/180;return `<circle class="om-star" cx="${(50+22*Math.cos(a)).toFixed(2)}" cy="${(50+22*Math.sin(a)).toFixed(2)}" r=".85"/>`;}).join('');
    return `<div class="observatory-mandala ${className||''}" role="img" aria-label="${label||'Astronomical mandala'}"><svg viewBox="0 0 100 100" aria-hidden="true"><g class="om-rotor"><circle class="om-orbit" cx="50" cy="50" r="46"/><circle class="om-fine" cx="50" cy="50" r="39"/><circle class="om-orbit" cx="50" cy="50" r="29"/><circle class="om-fine" cx="50" cy="50" r="22"/>${ticks}${words}<path class="om-fine" d="M50 11V89M11 50H89M22.4 22.4L77.6 77.6M77.6 22.4L22.4 77.6"/>${stars}</g><circle class="om-center" cx="50" cy="50" r="12"/><text class="om-word" x="50" y="49">JYOTISH</text><text class="om-word" x="50" y="55">ATLAS</text></svg></div>`;
  }
  function init(){
    document.documentElement.classList.add('observatory-ready');
    // No mandala in the top bar: it was cropped by the bar, overlapped the page title and carried no information.
    const hero=document.getElementById('hero');if(hero&&!hero.querySelector('.hero-mandala'))hero.insertAdjacentHTML('beforeend',wheel('hero-mandala','Nakshatra wheel'));
    const charts=document.querySelector('#charts .charts-main');if(charts&&!charts.querySelector('.workbench-constellation'))charts.insertAdjacentHTML('afterbegin',`<div class="workbench-constellation"><div><div class="workbench-kicker">Kundali workbench</div><h3>Trace the living geometry.</h3><p>Your active Kundali is read here through houses, grahas, vargas and daśā. The wheel is a visual orientation device; calculations stay in the chart below.</p><span class="observatory-stamp">पराशर · नवांश · दशा</span></div>${wheel('workbench-mandala','Astronomical orientation wheel')}</div>`);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
