/* Route risk network for 航線方案評估: route core → five topics → evidence leaves.
   Evidence comes only from existing data: registry signals (quantitative, solid wires, sparklines),
   the safety warning timeline and this route's port events (events, dashed wires), and country ratings
   mapped to the route. Topic counts = evidence related to this route; topic badges = topic-wide status. */
(()=>{
 const ICON={safety:'lane',policy:'policy',fuel:'fuel',ports:'port',countries:'country'};
 const LEVEL={crit:['危急','crit'],high:['高','high'],mid:['中','mid'],low:['低','low']};
 const STAGE={'已發生':'occurred','常態化':'ongoing','前瞻預警':'ahead'};
 const COUNTRY_ROUTE=c=>c[0]==='墨西哥'?3:c[0]==='巴拿馬'?4:5;

 function spark(values){
  const w=64,h=18,min=Math.min(...values),max=Math.max(...values),span=max-min||1;
  return `<svg class="net-spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${values.map((v,i)=>(i?'L':'M')+(i/(values.length-1)*w).toFixed(1)+' '+(h-2-(v-min)/span*(h-4)).toFixed(1)).join('')}"/></svg>`;
 }
 function signalLeaf(topic,id,series){
  const s=riskSignal(id),m=riskTopicModel(topic).signals[RISK_TOPIC_SIGNALS[topic].indexOf(id)]||[];
  return {topic,kind:'quant',label:m[0]||s.name,level:null,badge:m[1]||riskFormat(s.value,s.unit),desc:m[3]||'',meta:m[2]||'',spark:series};
 }
 function leavesFor(i,matrix){
  const out={safety:[],fuel:[],policy:[],ports:[],countries:[]};
  if(matrix[i].safety){
   out.safety.push(signalLeaf('safety','safety.hormuz',HORMUZ_ODDS.map(p=>p[1])));
   SAFETY_CHART_EVENTS.forEach(e=>out.safety.push({topic:'safety',kind:'event',label:e.title,badge:e.date,desc:e.description,meta:'航道預警時間軸'}));
  }
  if(matrix[i].fuel){out.fuel.push(signalLeaf('fuel','fuel.ovx',OVX_WEEKS.ovx),signalLeaf('fuel','fuel.crack',CRACK.near))}
  if(matrix[i].policy){out.policy.push(signalLeaf('policy','policy.tpu',TPU_MA7),signalLeaf('policy','policy.imports',null))}
  PORT_EVENTS.filter(e=>e.route===i).forEach(e=>out.ports.push({topic:'ports',kind:'event',label:e.title,badge:e.status,stage:STAGE[e.status],desc:e.impact,meta:e.country+' · '+e.kind}));
  const high=highRiskCountryRows();
  COUNTRY_ROWS.filter(c=>COUNTRY_ROUTE(c)===i).forEach(c=>out.countries.push({topic:'countries',kind:'quant',label:c[0]+' 國家與產業評級',level:null,badge:'CRR '+c[1]+' · SRR '+c[2],desc:c[3],meta:'CRR 國家風險 · SRR 航運產業風險'}));
  return out;
 }
 const topicIcon=k=>`<svg class="hub-ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#ym-ic-${ICON[k]}"/></svg>`;
 const levelBadge=l=>l&&LEVEL[l]?`<span class="net-level net-level-${LEVEL[l][1]}">${LEVEL[l][0]}</span>`:'';

 function topicInfo(i,k,matrix){
  const r=matrix[i][k],n=EXPOSURE_KEYS.indexOf(k),st=(window.routeTopicLevel?routeTopicLevel(i,k):riskTopicStatus(k).status);
  return `<div class="net-info-head">${topicIcon(k)}<b>${TOPIC_LABELS[k]}</b>${riskStatusBadge(st)}</div><p class="net-info-exposure">${escapeHTML(EXPOSURE[i][n])}</p>${r?`<p class="net-info-proposal">${escapeHTML(r.proposal)}</p><p class="net-info-trigger"><span>啟動條件</span>${escapeHTML(r.when)}</p>${riskImpactChips(r)}`:'<p class="net-info-muted">這條航線在此主題沒有建議。</p>'}`;
 }
 function leafInfo(leaf){
  return `<div class="net-info-head">${topicIcon(leaf.topic)}<b>${escapeHTML(leaf.label)}</b>${levelBadge(leaf.level)}</div>${leaf.meta?`<p class="net-info-meta">${escapeHTML(leaf.meta)}</p>`:''}<p class="net-info-exposure">${escapeHTML(leaf.desc)}</p><p class="net-info-muted">${leaf.kind==='quant'?'量化指標':'報告／事件'}</p>`;
 }

 const state={i:null,leaves:null,matrix:null};
 window.routeNetwork=function(i,matrix,question,watch){
  const leaves=leavesFor(i,matrix),rank=Object.fromEntries(Object.entries(RISK_STATUS).map(([k,v])=>[k,v.rank]));
  const topics=INTELLIGENCE_TOPICS.map(k=>({k,n:leaves[k].length,st:(window.routeTopicLevel?routeTopicLevel(i,k):riskTopicStatus(k).status)})).sort((a,b)=>(b.n>0)-(a.n>0)||rank[b.st]-rank[a.st]||b.n-a.n);
  const selected=topics[0].k,all=topics.flatMap(t=>leaves[t.k]),total=all.length,route=routes[i],s=draftFor(i).s,c=assessmentCases[i];
  state.i=i;state.leaves=all;state.matrix=matrix;
  const delta=s.altDays-s.days;
  const core=`<div class="net-core tone-${riskLevelTone(route.level)}"><div class="net-core-orb"><svg viewBox="0 0 220 220" aria-hidden="true"><defs><radialGradient id="netGlow"><stop offset="0" stop-color="#1d6fd1" stop-opacity=".55"/><stop offset=".6" stop-color="#0b2a4a" stop-opacity=".35"/><stop offset="1" stop-color="#08131e" stop-opacity="0"/></radialGradient></defs><circle cx="110" cy="110" r="108" fill="url(#netGlow)"/><circle class="orb-ring" cx="110" cy="110" r="96"/><circle class="orb-ring orb-ring-dash" cx="110" cy="110" r="74"/><circle class="orb-ring" cx="110" cy="110" r="50"/><g class="orb-sweep"><path d="M110 110 L110 14 A96 96 0 0 1 178 42 Z"/></g><g transform="translate(110 112) scale(1.1)"><path d="M0 -26 Q-10 -18 -8 -4l2 22h12l2-22Q10 -18 0 -26Z" fill="#dbeafe"/><rect x="-5" y="-12" width="4" height="6" rx="1" fill="#004ea2"/><rect x="1" y="-12" width="4" height="6" rx="1" fill="#f87171"/><rect x="-5" y="-4" width="4" height="6" rx="1" fill="#fbbf24"/><rect x="1" y="-4" width="4" height="6" rx="1" fill="#34d399"/><rect x="-5" y="4" width="10" height="5" rx="1" fill="#93c5fd"/></g></svg><div class="net-core-name"><b>${escapeHTML(route.name)}</b><small>${escapeHTML(route.via)}</small></div></div><div class="net-core-badges"><span class="net-core-level">綜合風險 ${escapeHTML(route.level)}</span><span class="net-core-count">${total} 項證據</span></div></div>`;
  const topicCards=`<div class="net-topics">${topics.map(t=>`<button type="button" class="net-topic${t.n?'':' is-empty'}" data-net-topic="${t.k}" aria-pressed="${t.k===selected}"><span class="net-topic-count">${t.n}</span>${riskStatusBadge(t.st)}<span class="net-topic-name">${topicIcon(t.k)}${TOPIC_LABELS[t.k]} · 證據</span></button>`).join('')}</div>`;
  const n=all.length;
  const leafList=`<ol class="net-leaves">${all.map((l,idx)=>{const tt=n>1?(idx-(n-1)/2)/((n-1)/2):0,arc=Math.round(90*(1-tt*tt));
   return `<li class="net-leaf kind-${l.kind}${l.topic===selected?' is-on':''}" data-net-topic="${l.topic}" style="--arc:${arc}px"><button type="button" data-net-leaf="${idx}"><i class="net-dot" aria-hidden="true"></i><span class="net-leaf-label">${escapeHTML(l.label)}</span>${levelBadge(l.level)}<span class="net-badge${l.stage?' stage-'+l.stage:''}">${escapeHTML(l.badge)}</span>${l.spark?spark(l.spark):''}</button></li>`}).join('')}</ol>`;
  return `<section class="page-card risk-net" data-net-route="${i}">${question?`<div class="risk-net-head"><div><span class="risk-net-kicker">本次評估 · ${escapeHTML(route.name)}・${escapeHTML(route.via)}</span><h2>${question}</h2>${watch?`<p class="assessment-watch"><span>持續觀察</span>${watch}</p>`:''}</div></div>`:''}<div class="risk-net-body"><svg class="net-wires" aria-hidden="true"></svg>${core}${topicCards}${leafList}<aside class="net-info" id="netInfo" role="tooltip">${topicInfo(i,selected,matrix)}</aside></div><div class="risk-net-foot" aria-hidden="true"><span><i class="wire-solid"></i>量化指標</span><span><i class="wire-dash"></i>報告／事件</span><span>五類依證據數與主題狀態排列；燈號為主題全局狀態</span></div></section>`;
 };

 function draw(root){
  const body=root.querySelector('.risk-net-body'),svg=root.querySelector('.net-wires');if(!body||!svg)return;
  if(getComputedStyle(svg).display==='none'){svg.innerHTML='';return}
  const box=body.getBoundingClientRect(),pt=(el,side)=>{const r=el.getBoundingClientRect();return [(side==='l'?r.left:side==='r'?r.right:r.left+r.width/2)-box.left,r.top+r.height/2-box.top]};
  const curve=([x1,y1],[x2,y2])=>{const dx=Math.max(30,(x2-x1)*.5);return `M${x1.toFixed(1)} ${y1.toFixed(1)}C${(x1+dx).toFixed(1)} ${y1.toFixed(1)} ${(x2-dx).toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`};
  svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
  const orb=root.querySelector('.net-core-orb svg'),from=pt(orb,'r');
  let paths='';
  root.querySelectorAll('.net-topic').forEach(t=>{const on=t.getAttribute('aria-pressed')==='true';paths+=`<path class="wire wire-core${on?' is-on':''}" d="${curve(from,pt(t,'l'))}"/>`});
  root.querySelectorAll('.net-leaf').forEach(li=>{const t=root.querySelector(`.net-topic[data-net-topic="${li.dataset.netTopic}"]`);if(!t)return;
   paths+=`<path class="wire ${li.classList.contains('kind-event')?'wire-event':'wire-quant'}${li.classList.contains('is-on')?' is-on':''}" d="${curve(pt(t,'r'),pt(li.querySelector('.net-dot'),'c'))}"/>`});
  svg.innerHTML=paths;
 }

 // net-info is a hover/focus panel on desktop: beside a topic card, or to the left of an evidence leaf.
 // Below 1000px it is static under the topics and always shows the selected topic.
 window.bindRouteNetwork=function(){
  const root=document.querySelector('.risk-net');if(!root)return;
  const i=+root.dataset.netRoute,info=root.querySelector('.net-info'),body=root.querySelector('.risk-net-body');
  let selected=root.querySelector('.net-topic[aria-pressed="true"]')?.dataset.netTopic;
  const floating=()=>getComputedStyle(info).position==='absolute';
  const place=(el,side)=>{if(!floating())return;const b=body.getBoundingClientRect(),r=el.getBoundingClientRect(),w=info.offsetWidth,h=info.offsetHeight;
   let left=side==='right'?r.right-b.left+16:r.left-b.left-w-16;if(left<0)left=r.right-b.left+16;left=Math.min(left,b.width-w);
   const top=Math.max(0,Math.min(r.top-b.top+r.height/2-h/2,b.height-h));info.style.left=left+'px';info.style.top=top+'px'};
  const show=(html,el,side)=>{info.innerHTML=html;info.classList.add('is-visible');place(el,side)};
  const hide=()=>{info.classList.remove('is-visible');info.innerHTML=topicInfo(i,selected,state.matrix)};
  const select=k=>{selected=k;root.querySelectorAll('.net-topic').forEach(b=>b.setAttribute('aria-pressed',b.dataset.netTopic===k));root.querySelectorAll('.net-leaf').forEach(li=>{li.classList.toggle('is-on',li.dataset.netTopic===k);li.classList.remove('is-picked')});if(!info.classList.contains('is-visible'))info.innerHTML=topicInfo(i,k,state.matrix);draw(root)};
  root.querySelectorAll('.net-topic').forEach(b=>{
   const open=()=>show(topicInfo(i,b.dataset.netTopic,state.matrix),b,'right');
   b.addEventListener('mouseenter',open);b.addEventListener('focus',open);b.addEventListener('mouseleave',hide);b.addEventListener('blur',hide);
   b.onclick=()=>{select(b.dataset.netTopic);open()};
  });
  root.querySelectorAll('[data-net-leaf]').forEach(b=>{
   const leaf=state.leaves[+b.dataset.netLeaf],li=b.closest('.net-leaf'),open=()=>show(leafInfo(leaf),b,'left');
   b.addEventListener('mouseenter',open);b.addEventListener('focus',open);b.addEventListener('mouseleave',hide);b.addEventListener('blur',hide);
   b.onclick=()=>{if(!li.classList.contains('is-on'))select(leaf.topic);root.querySelectorAll('.net-leaf').forEach(x=>x.classList.toggle('is-picked',x===li));open()};
  });
  draw(root);
  if(window.ResizeObserver){const ro=new ResizeObserver(()=>{if(!document.body.contains(root)){ro.disconnect();return}draw(root)});ro.observe(body)}
  document.fonts?.ready.then(()=>draw(root));
 };
})();
