/* Navigation radar: thresholded signals are placed by distance to their (provisional) thresholds;
   closer to the centre = closer to or past the action threshold. Signals without thresholds sit on the outer band. */
const RISK_RADAR_TOPICS=[
 {key:'safety',name:'航道安全',angle:-54},
 {key:'policy',name:'政策與關稅',angle:18},
 {key:'fuel',name:'燃油成本',angle:90},
 {key:'ports',name:'港口與內陸',angle:162},
 {key:'countries',name:'國家風險',angle:234}
];
const RISK_RADAR_SIGNALS=[
 {id:'safety.hormuz',topic:'safety',label:'荷莫茲封鎖機率',angle:-67,radius:94,tone:'high'},
 {id:'safety.timeline',topic:'safety',label:'預警時間軸',angle:-42,radius:182,tone:'medium'},
 {id:'policy.tpu',topic:'policy',label:'政策不確定性',angle:4,radius:148,tone:'medium'},
 {id:'policy.imports',topic:'policy',label:'美國進口結構',angle:35,radius:211,tone:'medium'},
 {id:'fuel.ovx',topic:'fuel',label:'OVX 波動率',angle:72,radius:180,tone:'medium'},
 {id:'fuel.crack',topic:'fuel',label:'燃料油價差',angle:108,radius:111,tone:'medium'},
 {id:'ports.occurred',topic:'ports',label:'已發生事件',angle:145,radius:152,tone:'medium'},
 {id:'ports.ongoing',topic:'ports',label:'持續與前瞻事件',angle:177,radius:214,tone:'medium'},
 {id:'countries.highRisk',topic:'countries',label:'高風險地區',angle:213,radius:132,tone:'high'},
 {id:'countries.ratings',topic:'countries',label:'國家與產業評級',angle:245,radius:196,tone:'medium'}
];
function radarPoint(angle,radius){const a=angle*Math.PI/180;return [320+Math.cos(a)*radius,320+Math.sin(a)*radius]}
function radarWedge(angle,radius){const a=radarPoint(angle-36,radius),b=radarPoint(angle+36,radius);return `M320 320 L${a[0].toFixed(1)} ${a[1].toFixed(1)} A${radius} ${radius} 0 0 1 ${b[0].toFixed(1)} ${b[1].toFixed(1)} Z`}
const RADAR_TONES={high:'行動',medium:'觀察',low:'正常',info:'未設門檻'};
function radarBinding(s){
 const x=riskSignal(s.id),t=x.thresholds;if(!t)return {...s,radius:228,tone:'info',reading:x};
 const [lo,hi]=x.range,v=x.value,mix=(a,b,f)=>a+(b-a)*Math.min(1,Math.max(0,f));
 if(x.status==='act')return {...s,radius:mix(110,62,(v-t.act)/(hi-t.act)),tone:'high',reading:x};
 if(x.status==='watch')return {...s,radius:mix(172,118,(v-t.watch)/(t.act-t.watch)),tone:'medium',reading:x};
 return {...s,radius:mix(236,182,(v-lo)/(t.watch-lo)),tone:'low',reading:x};
}
let radarMotionCleanup=()=>{};
function radarSignalMarkup(s,index){
 const topicIndex=RISK_RADAR_SIGNALS.slice(0,index).filter(x=>x.topic===s.topic).length,evidence=riskTopicModel(s.topic).signals[topicIndex];
 const [x,y]=radarPoint(s.angle,s.radius),anchor=x>410?'end':'start',offset=anchor==='end'?-14:14;
 const delay=((s.angle+90+360)%360)/360*12-12;
 return `<g class="radar-signal tone-${s.tone}" data-radar-topic="${s.topic}" data-radar-label="${s.label}" data-radar-tone="${s.tone}" role="button" tabindex="0" aria-label="${s.label}，${RADAR_TONES[s.tone]}，查看${RISK_RADAR_TOPICS.find(t=>t.key===s.topic).name}" style="--echo-delay:${delay}s"><title>${escapeHTML(evidence[0]+'：'+evidence[1]+' · '+RADAR_TONES[s.tone])}</title><circle class="radar-hit" cx="${x}" cy="${y}" r="20"/><circle class="radar-echo" cx="${x}" cy="${y}" r="18"/><circle class="radar-signal-halo" cx="${x}" cy="${y}" r="12"/><circle class="radar-signal-dot" cx="${x}" cy="${y}" r="5"/><text x="${x+offset}" y="${y+5}" text-anchor="${anchor}">${s.label}</text></g>`
}
function renderRiskRadar(active){
 radarMotionCleanup();
 const axes=RISK_RADAR_TOPICS.map(t=>{const [x,y]=radarPoint(t.angle-36,246);return `<line x1="320" y1="320" x2="${x}" y2="${y}"/>`}).join('');
 const labels=RISK_RADAR_TOPICS.map(t=>{const [x,y]=radarPoint(t.angle,287);return `<g class="radar-topic-label ${active===t.key?'active':''}" data-radar-topic="${t.key}" role="button" tabindex="0" aria-label="查看${t.name}"><text x="${x}" y="${y}" text-anchor="middle">${t.name}</text></g>`}).join('');
 const ticks=Array.from({length:120},(_,i)=>{const a=radarPoint(i*3,252),b=radarPoint(i*3,i%10===0?266:i%5===0?261:256);return `<line class="${i%10===0?'major':''}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`}).join('');
 const sweep=Array.from({length:32},(_,i)=>{const a=radarPoint(-138+i*1.5,245),b=radarPoint(-136.5+i*1.5,245);return `<path d="M320 320 L${a.join(' ')} A245 245 0 0 1 ${b.join(' ')} Z" fill="#57bdff" opacity="${.005+i*.004}"/>`}).join('');
 return `<div class="risk-radar-heading"><div><small>MARITIME INTELLIGENCE</small><h2>航海風險雷達</h2></div></div><div class="risk-radar-visual"><svg viewBox="0 0 640 640" role="group" aria-label="航海風險雷達，點選訊號查看分析"><defs><radialGradient id="radarWater"><stop stop-color="#143b61" stop-opacity=".8"/><stop offset=".65" stop-color="#08243c" stop-opacity=".6"/><stop offset="1" stop-color="#08131e"/></radialGradient><linearGradient id="radarHull" x1="0" x2="1"><stop stop-color="#769dbf"/><stop offset=".5" stop-color="#f1f7ff"/><stop offset="1" stop-color="#82b0d6"/></linearGradient><clipPath id="radarOceanClip"><circle cx="320" cy="320" r="245"/></clipPath></defs><circle class="radar-bezel" cx="320" cy="320" r="269"/><circle class="radar-surface" cx="320" cy="320" r="246"/><g clip-path="url(#radarOceanClip)" class="radar-ocean"><path d="M44 180 Q180 130 268 195 T560 190 M35 192 Q180 142 268 207 T570 202 M38 205 Q180 155 268 220 T580 215 M84 456 Q190 395 302 449 T584 410 M74 468 Q190 407 302 461 T590 422 M64 480 Q190 419 302 473 T590 434"/><path class="radar-course" d="M262 578 Q245 434 320 320 T419 72"/></g><path class="radar-active-sector" d="${active==='intelligence'?'':radarWedge(RISK_RADAR_TOPICS.find(t=>t.key===active)?.angle??-54,245)}"/><g class="radar-grid"><circle cx="320" cy="320" r="112"/><circle cx="320" cy="320" r="176"/><circle cx="320" cy="320" r="245"/>${axes}</g><g class="radar-bearing-ticks">${ticks}</g><g class="radar-sweep" aria-hidden="true">${sweep}<path class="radar-sweep-edge" d="M320 320V75"/><circle cx="320" cy="75" r="3" fill="#b8e5ff"/></g><g class="radar-compass" aria-hidden="true"><text x="320" y="38" text-anchor="middle">N</text><path d="M320 47l-4 8h8Z"/><text x="602" y="324">E</text><text x="320" y="634" text-anchor="middle">S</text><text x="28" y="324">W</text></g><g class="radar-rings-label"><text x="310" y="224" text-anchor="end">行動區</text><text x="310" y="160" text-anchor="end">觀察區</text></g><g class="radar-vessel" aria-label="貨船意象"><circle cx="320" cy="320" r="34" class="radar-vessel-ring"/><path class="radar-wake" d="M313 339l-10 26m24-26 10 26M317 343v28m6-28v28"/><path d="M320 293 Q308 302 310 319l2 24h16l2-24Q332 302 320 293Z" fill="url(#radarHull)" stroke="#d9edff"/><path d="M320 300l-5 10h10Z" fill="#004ea2"/><rect x="314" y="313" width="5" height="8" rx="1" fill="#004ea2"/><rect x="321" y="313" width="5" height="8" rx="1" fill="#589acf"/><rect x="314" y="323" width="5" height="7" rx="1" fill="#589acf"/><rect x="321" y="323" width="5" height="7" rx="1" fill="#004ea2"/><rect x="313" y="333" width="14" height="5" rx="1" fill="#f1f1f1"/><path d="M315 335h10" stroke="#163b5a"/></g>${RISK_RADAR_SIGNALS.map(radarBinding).map(radarSignalMarkup).join('')}${labels}</svg></div><div class="risk-radar-foot"><div class="risk-radar-legend"><span class="tone-high">行動</span><span class="tone-medium">觀察</span><span class="tone-low">正常</span><span class="tone-info">未設門檻</span></div><p>越靠中心越接近行動門檻（暫定門檻）。</p></div>`
}
function bindRiskRadar(root){
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),controller=new AbortController();
 let visible=true;
 const sync=()=>root.classList.toggle('radar-paused',motion.matches||!visible||document.hidden);
 document.addEventListener('visibilitychange',sync,{signal:controller.signal});
 motion.addEventListener('change',sync,{signal:controller.signal});
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()});observer.observe(root);
 radarMotionCleanup=()=>{observer.disconnect();controller.abort()};
 root.querySelectorAll('[data-radar-topic]').forEach(node=>{
  const open=()=>{location.hash=node.dataset.radarTopic};
  node.addEventListener('click',open);
  node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
 });sync();
}
