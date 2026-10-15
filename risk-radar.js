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
 {id:'safety.hormuz',topic:'safety',label:'荷莫茲封鎖機率',angle:-80,radius:94,tone:'high'},
 {id:'safety.timeline',anchor:'start',topic:'safety',label:'預警時間軸',angle:-34,radius:182,tone:'medium'},
 {id:'policy.tpu',topic:'policy',label:'政策不確定性',angle:4,radius:148,tone:'medium'},
 {id:'policy.imports',topic:'policy',label:'美國進口結構',angle:35,radius:211,tone:'medium'},
 {id:'fuel.ovx',anchor:'end',topic:'fuel',label:'OVX 波動率',angle:72,radius:180,tone:'medium'},
 {id:'fuel.crack',topic:'fuel',label:'燃料油價差',angle:108,radius:111,tone:'medium'},
 {id:'ports.occurred',topic:'ports',label:'已發生事件',angle:145,radius:152,tone:'medium'},
 {id:'ports.ongoing',topic:'ports',label:'持續與前瞻事件',angle:177,radius:214,tone:'medium'},
 {id:'countries.highRisk',topic:'countries',label:'高風險地區',angle:213,radius:132,tone:'high'},
 {id:'countries.ratings',topic:'countries',label:'國家與產業評級',angle:245,radius:196,tone:'medium'}
];
function radarPoint(angle,radius){const a=angle*Math.PI/180;return [320+Math.cos(a)*radius,320+Math.sin(a)*radius]}
function radarWedge(angle,radius){const a=radarPoint(angle-36,radius),b=radarPoint(angle+36,radius);return `M320 320 L${a[0].toFixed(1)} ${a[1].toFixed(1)} A${radius} ${radius} 0 0 1 ${b[0].toFixed(1)} ${b[1].toFixed(1)} Z`}
const RADAR_TOPIC_ICON={safety:'lane',policy:'policy',fuel:'fuel',ports:'port',countries:'country'};
const RADAR_TONES={crit:'危急',high:'高',mid:'中',low:'低',none:'無訊號'};
// Node labels use the same title as the topic page's 關鍵訊號 (ports in its default 全部／全部 scope),
// so the radar and the page never drift apart. The radar always shows the global, unfiltered view (not stated on screen).
function radarPageLabel(s){
 const scope=s.topic==='ports'?{entries:PORT_EVENTS,area:'全部',status:'全部'}:{},i=RISK_TOPIC_SIGNALS[s.topic].indexOf(s.id);
 return riskTopicModel(s.topic,scope).signals[i]?.[0]||s.label;
}
function radarLabelLines(text){if(text.length<=9)return [text];const i=text.lastIndexOf(' ');if(i>0)return [text.slice(0,i),text.slice(i+1)];const m=Math.floor(text.length/2);return [text.slice(0,m),text.slice(m)]}
// Nodes take their topic's shared status: colour = level, distance = level band (closer = more severe);
// the two signals of a topic sit slightly apart inside the band.
const RADAR_BANDS={crit:98,high:134,mid:168,low:204,none:226};
function radarBinding(s){
 s={...s,label:radarPageLabel(s)};
 const st=riskTopicStatus(s.topic).status,i=RISK_TOPIC_SIGNALS[s.topic].indexOf(s.id);
 return {...s,radius:RADAR_BANDS[st]+(i?20:-20),tone:st,reading:riskSignal(s.id)};
}
let radarMotionCleanup=()=>{};
function radarSignalMarkup(s,index){
 const topicIndex=RISK_RADAR_SIGNALS.slice(0,index).filter(x=>x.topic===s.topic).length,evidence=riskTopicModel(s.topic).signals[topicIndex];
 const [x,y]=radarPoint(s.angle,s.radius),anchor=s.anchor||(x>410?'end':'start'),offset=anchor==='end'?-14:14;
 const delay=((s.angle+90+360)%360)/360*12-12;
 return `<g class="radar-signal tone-${s.tone}" data-radar-topic="${s.topic}" data-radar-label="${s.label}" data-radar-tone="${s.tone}" role="link" tabindex="0" aria-label="${s.label}，${RADAR_TONES[s.tone]}，查看${RISK_RADAR_TOPICS.find(t=>t.key===s.topic).name}" style="--echo-delay:${delay}s"><title>${escapeHTML(evidence[0]+'：'+evidence[1]+' · '+RADAR_TONES[s.tone])}</title><circle class="radar-hit" cx="${x}" cy="${y}" r="20"/><circle class="radar-echo" cx="${x}" cy="${y}" r="18"/><circle class="radar-signal-halo" cx="${x}" cy="${y}" r="12"/><circle class="radar-signal-dot" cx="${x}" cy="${y}" r="5"/><text x="${x+offset}" y="${y+5-(radarLabelLines(s.label).length-1)*7.5}" text-anchor="${anchor}">${radarLabelLines(s.label).map((line,i)=>`<tspan x="${x+offset}" dy="${i?15:0}">${escapeHTML(line)}</tspan>`).join('')}</text></g>`
}
function renderRiskRadar(active){
 radarMotionCleanup();
 // Sector dividers run from the vessel ring out through the bearing ticks, with a node where they meet the outer ring.
 const dividers=RISK_RADAR_TOPICS.map(t=>{const [x0,y0]=radarPoint(t.angle-36,40),[x1,y1]=radarPoint(t.angle-36,268),[nx,ny]=radarPoint(t.angle-36,245);return `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"/><circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="3"/>`}).join('');
 // Each topic's sector gets a status arc on the rim (topic-wide status).
 const statusArcs=RISK_RADAR_TOPICS.map(t=>{const st=riskTopicStatus(t.key).status,[ax,ay]=radarPoint(t.angle-33,256),[bx,by]=radarPoint(t.angle+33,256);return `<path class="radar-status-arc arc-${st}" d="M${ax.toFixed(1)} ${ay.toFixed(1)} A256 256 0 0 1 ${bx.toFixed(1)} ${by.toFixed(1)}"/>`}).join('');
 // Topic icon sits above its label; the pair is centred well outside the bezel and status rim.
 const labels=RISK_RADAR_TOPICS.map(t=>{const [x,y]=radarPoint(t.angle,322);return `<g class="radar-topic-label ${active===t.key?'active':''}" data-radar-topic="${t.key}" role="link" tabindex="0" aria-label="查看${t.name}，狀態${RISK_STATUS[riskTopicStatus(t.key).status].label}${active===t.key?'（目前主題）':''}"><svg class="topic-ic radar-ic" x="${(x-11).toFixed(1)}" y="${(y-26).toFixed(1)}" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><use href="#ym-ic-${RADAR_TOPIC_ICON[t.key]}"/></svg><text x="${x.toFixed(1)}" y="${(y+16).toFixed(1)}" text-anchor="middle">${t.name}</text></g>`}).join('');
 const ticks=Array.from({length:120},(_,i)=>{const a=radarPoint(i*3,252),b=radarPoint(i*3,i%10===0?266:i%5===0?261:256);return `<line class="${i%10===0?'major':''}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`}).join('');
 const sweep=Array.from({length:32},(_,i)=>{const a=radarPoint(-138+i*1.5,245),b=radarPoint(-136.5+i*1.5,245);return `<path d="M320 320 L${a.join(' ')} A245 245 0 0 1 ${b.join(' ')} Z" fill="#57bdff" opacity="${.005+i*.004}"/>`}).join('');
 return `<div class="risk-radar-heading"><div><h2>航海風險雷達</h2></div><span class="radar-asof">資料時點 ${(window.RISK_SHARED&&RISK_SHARED.asOf||"2026-06-30").replace(/-/g,"/")}</span></div><div class="risk-radar-visual"><svg viewBox="-48 -14 736 692" role="group" aria-label="航海風險雷達，點選訊號查看分析"><defs><radialGradient id="radarWater"><stop stop-color="#143b61" stop-opacity=".8"/><stop offset=".65" stop-color="#08243c" stop-opacity=".6"/><stop offset="1" stop-color="#08131e"/></radialGradient><linearGradient id="radarHull" x1="0" x2="1"><stop stop-color="#769dbf"/><stop offset=".5" stop-color="#f1f7ff"/><stop offset="1" stop-color="#82b0d6"/></linearGradient><clipPath id="radarOceanClip"><circle cx="320" cy="320" r="245"/></clipPath></defs><circle class="radar-bezel" cx="320" cy="320" r="269"/><circle class="radar-surface" cx="320" cy="320" r="246"/><g clip-path="url(#radarOceanClip)" class="radar-ocean"><path d="M44 180 Q180 130 268 195 T560 190 M35 192 Q180 142 268 207 T570 202 M38 205 Q180 155 268 220 T580 215 M84 456 Q190 395 302 449 T584 410 M74 468 Q190 407 302 461 T590 422 M64 480 Q190 419 302 473 T590 434"/><path class="radar-course" d="M262 578 Q245 434 320 320 T419 72"/></g><path class="radar-active-sector" d="${active==='intelligence'?'':radarWedge(RISK_RADAR_TOPICS.find(t=>t.key===active)?.angle??-54,245)}"/><g class="radar-grid"><circle cx="320" cy="320" r="112"/><circle cx="320" cy="320" r="176"/><circle cx="320" cy="320" r="245"/></g><g class="radar-dividers">${dividers}</g><circle class="radar-rim" cx="320" cy="320" r="245"/><g class="radar-bearing-ticks">${ticks}</g><g class="radar-status-arcs" aria-hidden="true">${statusArcs}</g><g class="radar-sweep" aria-hidden="true">${sweep}<path class="radar-sweep-edge" d="M320 320V75"/><circle cx="320" cy="75" r="3" fill="#b8e5ff"/></g><g class="radar-compass" aria-hidden="true"><text x="320" y="38" text-anchor="middle">N</text><path d="M320 47l-4 8h8Z"/><text x="602" y="324">E</text><text x="320" y="634" text-anchor="middle">S</text><text x="28" y="324">W</text></g><g class="radar-vessel" aria-label="貨船意象" transform="translate(320 320) scale(.7) translate(-320 -320)"><circle cx="320" cy="320" r="34" class="radar-vessel-ring"/><path class="radar-wake" d="M313 339l-10 26m24-26 10 26M317 343v28m6-28v28"/><path d="M320 293 Q308 302 310 319l2 24h16l2-24Q332 302 320 293Z" fill="url(#radarHull)" stroke="#d9edff"/><path d="M320 300l-5 10h10Z" fill="#004ea2"/><rect x="314" y="313" width="5" height="8" rx="1" fill="#004ea2"/><rect x="321" y="313" width="5" height="8" rx="1" fill="#589acf"/><rect x="314" y="323" width="5" height="7" rx="1" fill="#589acf"/><rect x="321" y="323" width="5" height="7" rx="1" fill="#004ea2"/><rect x="313" y="333" width="14" height="5" rx="1" fill="#f1f1f1"/><path d="M315 335h10" stroke="#163b5a"/></g>${RISK_RADAR_SIGNALS.map(radarBinding).map(radarSignalMarkup).join('')}${labels}</svg></div><div class="risk-radar-foot"><div class="risk-radar-legend"><span class="tone-crit">危急</span><span class="tone-high">高</span><span class="tone-mid">中</span><span class="tone-low">低</span><span class="tone-none">無訊號</span></div><p>越靠中心風險等級越高。</p></div>`
}
function bindRiskRadar(root){
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),controller=new AbortController();
 let visible=true;
 const sync=()=>root.classList.toggle('radar-paused',motion.matches||!visible||document.hidden);
 document.addEventListener('visibilitychange',sync,{signal:controller.signal});
 motion.addEventListener('change',sync,{signal:controller.signal});
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()});observer.observe(root);
 radarMotionCleanup=()=>{observer.disconnect();controller.abort()};
 // Topic labels and signal nodes both open their topic page (the topic tabs were replaced by a back link).
 root.querySelectorAll('.radar-signal, .radar-topic-label').forEach(node=>{
  const open=()=>{location.hash=node.dataset.radarTopic};
  node.addEventListener('click',open);
  node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
 });sync();
}
